
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import type { User, UserRole, Vehicle, PickupRequest, Notification, Attendance } from '@/lib/types';
import { initialVehicles, initialRequests, initialNotifications, initialAttendance } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import mqtt, { MqttClient } from 'mqtt';

const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const GATE_TOPIC = 'ats/smartgate/gate';
const LED_TOPIC = 'ats/smartgate/led';
const PI_STATUS_TOPIC = 'ats/smartgate/status';

type MqttStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'reconnecting' | 'pi_offline';

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  requests: PickupRequest[];
  setRequests: React.Dispatch<React.SetStateAction<PickupRequest[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  attendance: Attendance[];
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  gateStatus: 'open' | 'closed';
  setGateStatus: React.Dispatch<React.SetStateAction<'open' | 'closed'>>;
  currentCapacity: number;
  setCurrentCapacity: React.Dispatch<React.SetStateAction<number>>;
  maxCapacity: number;
  handleEnterGate: (vehicleId: number) => void;
  handleExitGate: (vehicleId: number) => void;
  changeRole: (role: UserRole) => void;
  approveRequest: (requestId: number) => void;
  denyRequest: (requestId: number) => void;
  submitRequest: (newRequest: Omit<PickupRequest, 'id' | 'lastUpdated'>) => void;
  mqttStatus: MqttStatus;
  testGate: (action: 'open' | 'close') => void;
  mqttBrokerUrl: string;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<User>({ type: "reception", name: "Ayesha Al Marzooqi", studentName: "N/A" });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [requests, setRequests] = useState<PickupRequest[]>(initialRequests);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  
  const [gateStatus, setGateStatus] = useState<'open' | 'closed'>("closed");
  const [currentCapacity, setCurrentCapacity] = useState(vehicles.filter(v => v.status === 'inside').length);
  const [maxCapacity] = useState(50);
  
  const [mqttStatus, setMqttStatus] = useState<MqttStatus>('connecting');
  const clientRef = useRef<MqttClient | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // This effect should only run once on the client side.
    if (typeof window === 'undefined' || clientRef.current) {
      return;
    }

    try {
      setMqttStatus('connecting');
      const client = mqtt.connect(MQTT_BROKER_URL, {
        reconnectPeriod: 5000,
        connectTimeout: 10 * 1000, // 10 seconds
        keepalive: 120, 
        clientId: `campusflow_web_${Math.random().toString(16).substr(2, 8)}`
      });
      clientRef.current = client;

      const clearStatusTimeout = () => {
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }
      }

      const handleConnect = () => {
        toast({ title: "Broker Connected", description: "Waiting for status from hardware..." });
        client.subscribe(PI_STATUS_TOPIC, { qos: 1 }, (err) => {
          if (err) {
            console.error("Failed to subscribe to Pi status topic", err);
            setMqttStatus('error');
          } else {
            // Wait for a heartbeat from the Pi
            statusTimeoutRef.current = setTimeout(() => {
                toast({ variant: 'destructive', title: 'Hardware Not Found', description: 'No status signal received from the Raspberry Pi.' });
                setMqttStatus('pi_offline');
            }, 10000); 
          }
        });
      };

      const handleError = (err: Error) => {
        console.error('MQTT Connection Error:', err);
        setMqttStatus('error');
        toast({ variant: 'destructive', title: 'Connection Error', description: `Could not connect to broker: ${err.message}` });
        clearStatusTimeout();
      };
      
      const handleReconnect = () => {
        setMqttStatus('reconnecting');
        toast({ title: 'Reconnecting...', description: 'Attempting to reconnect to the broker.' });
        clearStatusTimeout();
      };

      const handleOffline = () => {
        setMqttStatus('disconnected');
        toast({ variant: 'destructive', title: 'Broker Disconnected', description: 'Connection lost. Please check network.' });
        clearStatusTimeout();
      };
      
      const handleClose = () => {
        // 'close' can be triggered by errors, so check current status
        if (mqttStatus !== 'error') {
            setMqttStatus('disconnected');
        }
        clearStatusTimeout();
      };

      const handleMessage = (topic: string, payload: Buffer) => {
          if (topic === PI_STATUS_TOPIC) {
              const message = payload.toString();
              if (message === 'online') {
                  clearStatusTimeout();
                  // Only update and toast if the status wasn't already 'connected'
                  if (clientRef.current?.connected) {
                    setMqttStatus('connected');
                    toast({ title: "Hardware Connected", description: "Successfully receiving signals from Raspberry Pi.", className: "bg-green-100 text-green-800" });
                  }
              } else if (message === 'offline') {
                  setMqttStatus('pi_offline');
                  toast({ variant: 'destructive', title: "Hardware Offline", description: "Raspberry Pi has disconnected." });
              }
          }
      };

      client.on('connect', handleConnect);
      client.on('error', handleError);
      client.on('reconnect', handleReconnect);
      client.on('offline', handleOffline);
      client.on('close', handleClose);
      client.on('message', handleMessage);

      // Cleanup function to run when the component unmounts
      return () => {
        if (clientRef.current) {
          clearStatusTimeout();
          client.end(true);
          clientRef.current = null;
        }
      };
    } catch (error) {
       console.error('MQTT initialization failed:', error);
       setMqttStatus('error');
    }
  // The empty dependency array is crucial here to ensure this effect runs only once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const publish = (topic: string, message: string) => {
    if (clientRef.current && mqttStatus === 'connected') {
      clientRef.current.publish(topic, message, { qos: 1 }, (err) => {
        if (err) {
          console.error('MQTT publish error:', err);
          toast({ variant: 'destructive', title: 'Publish Error', description: 'Failed to send command to hardware.'});
        }
      });
    } else {
        toast({ variant: 'destructive', title: 'Hardware Not Connected', description: 'Cannot send command. Pi is offline or not responding.'});
    }
  }
  
  const addNotification = (notif: Omit<Notification, 'id' | 'time'>) => {
    const newNotif = { ...notif, id: Date.now() + Math.random(), time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setNotifications(prev => [newNotif, ...prev]);
  };
  
  const operateGate = () => {
    publish(GATE_TOPIC, '90'); // 90 degrees to open
    publish(LED_TOPIC, 'on');
    setGateStatus("open");
    addNotification({ message: 'Gate opening command sent.', type: 'entry' });
    
    setTimeout(() => {
      publish(GATE_TOPIC, '0'); // 0 degrees to close
      publish(LED_TOPIC, 'off');
      setGateStatus("closed");
      addNotification({ message: 'Gate closing command sent.', type: 'exit' });
    }, 4000); // Gate stays open for 4 seconds
  }

  const handleEnterGate = (vehicleId: number) => {
    if (currentCapacity >= maxCapacity) {
      toast({ variant: 'destructive', title: "Campus Full", description: "Cannot allow entry, capacity reached."});
      publish(LED_TOPIC, 'flash');
      return;
    };
    
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.status === 'inside') return;

    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, entryTime: now, status: "inside", lastUpdated: Date.now() } : v
    ));
    
    setCurrentCapacity(prev => prev + 1);
    operateGate();
    
    addNotification({ message: `Vehicle ${vehicle.plate} has entered campus`, type: "entry" });
    toast({ title: 'Vehicle Entry', description: `Vehicle ${vehicle.plate} has entered.`});
    
    setAttendance(prev => prev.map(record => 
      record.vehicleId === vehicleId ? { ...record, entry: now, status: "present" } : record
    ));
  };
  
  const testGate = (action: 'open' | 'close') => {
    const command = action === 'open' ? '90' : '0';
    publish(GATE_TOPIC, command);
    toast({ title: 'Test Command Sent', description: `Sent '${command}°' command to gate.`});
  };

  const handleExitGate = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
     if (!vehicle) return;

    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, exitTime: now, status: "exited", lastUpdated: Date.now() } : v
    ));
    
    setCurrentCapacity(prev => Math.max(0, prev - 1));
    operateGate();
    
    addNotification({ message: `Vehicle ${vehicle.plate} has exited campus`, type: "exit" });
    
    setAttendance(prev => prev.map(record => 
      record.vehicleId === vehicleId ? { ...record, exit: now } : record
    ));
  };

  const changeRole = (role: UserRole) => {
    const userDetails = {
      parent: { name: "Fatima Al Hammadi", studentName: "Dana Mohammed Alsayari" },
      teacher: { name: "Laila Zuaiter", studentName: "N/A" },
      reception: { name: "Ayesha Al Marzooqi", studentName: "N/A" }
    };
    
    setCurrentUser({
      type: role,
      ...userDetails[role]
    });
    setActiveTab("dashboard");
  };

  const approveRequest = (requestId: number) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: "approved",
        approvedAt: now,
        approvedBy: currentUser.name,
        lastUpdated: Date.now()
      } : req
    ));
    addNotification({ message: `Pickup request approved for ${request.plate}`, type: "approval" });
  };

  const denyRequest = (requestId: number) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const reason = prompt("Reason for denial:");
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: "denied",
        deniedAt: now,
        deniedBy: currentUser.name,
        denialReason: reason || "Not specified",
        lastUpdated: Date.now()
      } : req
    ));
    addNotification({ message: `Pickup request denied for ${request.plate}`, type: "denial" });
  };

  const submitRequest = (newRequestData: Omit<PickupRequest, 'id' | 'lastUpdated'>) => {
    const newRequest = {
        ...newRequestData,
        id: Date.now(),
        lastUpdated: Date.now(),
    };
    setRequests(prev => [newRequest, ...prev]);
    addNotification({ 
        message: `New pickup request for ${newRequest.plate}`, 
        time: newRequest.time, 
        type: "request" 
    });
    toast({ title: 'Request Submitted', description: 'Your pickup request has been sent for approval.' });
    setActiveTab('dashboard');
  }

  const value = {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    vehicles,
    setVehicles,
    requests,
    setRequests,
    notifications,
    setNotifications,
    attendance,
    setAttendance,
    gateStatus,
    setGateStatus,
    currentCapacity,
    setCurrentCapacity,
    maxCapacity,
    handleEnterGate,
    handleExitGate,
    changeRole,
    approveRequest,
    denyRequest,
    submitRequest,
    mqttStatus,
    testGate,
    mqttBrokerUrl: MQTT_BROKER_URL,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
