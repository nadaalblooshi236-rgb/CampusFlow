import paho.mqtt.client as mqtt
import time

# MQTT Configuration
MQTT_BROKER_URL = "broker.emqx.io"
MQTT_PORT = 1883
GATE_TOPIC = "ats/smartgate/gate"
LED_TOPIC = "ats/smartgate/led"
PI_STATUS_TOPIC = "ats/smartgate/status"

# --- MOCK HARDWARE FUNCTIONS (for testing without real hardware) ---
# Replace these with your actual servo and LED control functions
def control_servo(position):
    """
    Controls the servo motor.
    - position (int): The desired position of the servo (0 for closed, 90 for open).
    """
    print(f"--- MOCK SERVO: Moving to {position} degrees ---")

def control_led(state):
    """
    Controls an LED.
    - state (str): "on", "off", or "flash".
    """
    if state == "on":
        print("--- MOCK LED: Turning ON ---")
    elif state == "off":
        print("--- MOCK LED: Turning OFF ---")
    elif state == "flash":
        print("--- MOCK LED: Flashing ---")
# --------------------------------------------------------------------


# --- MQTT CALLBACKS ---

def on_connect(client, userdata, flags, rc):
    """Callback function for when the client connects to the broker."""
    if rc == 0:
        print(f"Connected successfully to MQTT Broker at {MQTT_BROKER_URL}")
        # Subscribe to topics
        client.subscribe(GATE_TOPIC)
        print(f"Subscribed to topic: {GATE_TOPIC}")
        client.subscribe(LED_TOPIC)
        print(f"Subscribed to topic: {LED_TOPIC}")
        
        # Announce that the Pi is online
        print("Sending 'online' status to topic...")
        client.publish(PI_STATUS_TOPIC, "online", qos=1, retain=True)
    else:
        print(f"Failed to connect, return code {rc}\n")

def on_message(client, userdata, msg):
    """Callback function for when a message is received."""
    payload = msg.payload.decode()
    print(f"Received message on topic {msg.topic}: {payload}")
    
    if msg.topic == GATE_TOPIC:
        try:
            position = int(payload)
            if position == 0:
                print("Received: CLOSE GATE")
                control_servo(0)
            elif position == 90:
                print("Received: OPEN GATE")
                control_servo(90)
            else:
                print(f"Warning: Received invalid position '{position}'")
        except ValueError:
            print(f"Error: Could not convert payload '{payload}' to an integer.")

    elif msg.topic == LED_TOPIC:
        if payload == "on":
            print("Received: LED ON")
            control_led("on")
        elif payload == "off":
            print("Received: LED OFF")
            control_led("off")
        elif payload == "flash":
            print("Received: LED FLASH")
            control_led("flash")
        else:
            print(f"Warning: Received invalid LED command '{payload}'")

# --- MAIN SCRIPT ---

def setup_client():
    """Sets up and configures the MQTT client."""
    # Set the "Last Will and Testament" (LWT)
    # If the Pi disconnects ungracefully, the broker will publish "offline" for us.
    client = mqtt.Client(client_id=f"pi-controller-{int(time.time())}", protocol=mqtt.MQTTv311, transport="tcp")
    client.will_set(PI_STATUS_TOPIC, payload="offline", qos=1, retain=True)
    
    client.on_connect = on_connect
    client.on_message = on_message
    
    return client

if __name__ == "__main__":
    print("Starting hardware controller...")
    client = setup_client()
    
    try:
        print(f"Connecting to MQTT broker at {MQTT_BROKER_URL}...")
        client.connect(MQTT_BROKER_URL, MQTT_PORT, 60)
        
        # Loop forever to process network traffic and dispatch callbacks.
        # This is a blocking call.
        client.loop_forever()
        
    except ConnectionRefusedError:
        print("Connection refused. Check broker address and port.")
    except OSError as e:
        print(f"Network error: {e}. Check your internet connection.")
    except KeyboardInterrupt:
        print("\nDisconnecting from MQTT broker...")
    finally:
        # Before exiting, explicitly send an "offline" message
        client.publish(PI_STATUS_TOPIC, "offline", qos=1, retain=True)
        client.disconnect()
        print("Hardware controller stopped.")
