import paho.mqtt.client as mqtt
import time
import RPi.GPIO as GPIO

# --- Hardware Configuration ---
# WARNING: Please ensure these are the correct GPIO pin numbers you are using.
SERVO_PIN = 18  # GPIO pin for the servo motor
LED_PIN = 17    # GPIO pin for the LED

# --- MQTT Configuration ---
MQTT_BROKER_URL = "broker.emqx.io"
MQTT_BROKER_PORT = 1883
CLIENT_ID = f"pi_controller_{int(time.time())}"

# --- Topics ---
GATE_TOPIC = "ats/smartgate/gate"
LED_TOPIC = "ats/smartgate/led"
STATUS_TOPIC = "ats/smartgate/status"

# --- Last Will and Testament (LWT) ---
LWT_MESSAGE = "offline"
LWT_TOPIC = STATUS_TOPIC

def setup_hardware():
    """Initializes GPIO pins for the servo and LED."""
    GPIO.setmode(GPIO.BCM)  # Use Broadcom pin-numbering scheme
    GPIO.setwarnings(False) # Disable warnings

    # Setup LED pin
    GPIO.setup(LED_PIN, GPIO.OUT)
    GPIO.output(LED_PIN, GPIO.LOW) # Turn LED off initially

    # Setup Servo pin
    GPIO.setup(SERVO_PIN, GPIO.OUT)
    p = GPIO.PWM(SERVO_PIN, 50)  # GPIO 18 for PWM with 50Hz
    p.start(2.5) # Initialization
    time.sleep(0.5)
    p.ChangeDutyCycle(0) # Stop sending signal to servo
    return p

def control_servo(pwm, angle):
    """Controls the servo motor to move to a specific angle."""
    duty_cycle = 2.5 + (angle / 18.0)
    print(f"Moving servo to {angle} degrees (Duty Cycle: {duty_cycle:.2f})")
    pwm.ChangeDutyCycle(duty_cycle)
    time.sleep(1) # Allow time for servo to move
    pwm.ChangeDutyCycle(0) # Stop sending signal to reduce jitter

def control_led(state):
    """Controls the LED."""
    if state == 'on':
        print("Turning LED ON")
        GPIO.output(LED_PIN, GPIO.HIGH)
    elif state == 'off':
        print("Turning LED OFF")
        GPIO.output(LED_PIN, GPIO.LOW)
    elif state == 'flash':
        print("Flashing LED")
        for _ in range(5):
            GPIO.output(LED_PIN, GPIO.HIGH)
            time.sleep(0.2)
            GPIO.output(LED_PIN, GPIO.LOW)
            time.sleep(0.2)

def on_connect(client, userdata, flags, rc, properties=None):
    """Callback for when the client connects to the broker."""
    if rc == 0:
        print(f"Connected successfully to MQTT Broker at {MQTT_BROKER_URL}")
        client.subscribe(GATE_TOPIC)
        print(f"Subscribed to topic: {GATE_TOPIC}")
        client.subscribe(LED_TOPIC)
        print(f"Subscribed to topic: {LED_TOPIC}")
        
        # Send the "online" status message
        print(f"Sending 'online' status to topic: {STATUS_TOPIC}")
        client.publish(STATUS_TOPIC, "online", qos=1, retain=True)
    else:
        print(f"Failed to connect, return code {rc}\n")

def on_message(client, userdata, msg):
    """Callback for when a message is received."""
    pwm = userdata['pwm']
    payload = msg.payload.decode()
    print(f"Received message on topic {msg.topic}: {payload}")
    
    if msg.topic == GATE_TOPIC:
        try:
            angle = int(payload)
            if 0 <= angle <= 180:
                control_servo(pwm, angle)
            else:
                print("Invalid angle. Must be between 0 and 180.")
        except ValueError:
            print("Invalid payload for gate topic. Expected an integer angle.")
            
    elif msg.topic == LED_TOPIC:
        control_led(payload)


def setup_client(userdata):
    """Sets up and returns an MQTT client instance."""
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=CLIENT_ID, clean_session=True)
    client.user_data_set(userdata)
    
    client.will_set(LWT_TOPIC, payload=LWT_MESSAGE, qos=1, retain=True)
    
    client.on_connect = on_connect
    client.on_message = on_message
    
    print("Connecting to MQTT broker...")
    try:
        client.connect(MQTT_BROKER_URL, MQTT_BROKER_PORT, 60)
    except Exception as e:
        print(f"Error connecting to broker: {e}")
        return None
        
    return client

if __name__ == '__main__':
    pwm_controller = None
    try:
        pwm_controller = setup_hardware()
        client = setup_client({'pwm': pwm_controller})
        if client:
            client.loop_forever()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        print("Cleaning up GPIO...")
        if pwm_controller:
            pwm_controller.stop()
        GPIO.cleanup()
        print("GPIO cleanup complete. Exiting.")
