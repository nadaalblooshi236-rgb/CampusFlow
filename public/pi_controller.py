
# =================================================================
# ATS Smart Gate - Raspberry Pi Controller Script
# =================================================================
# This script connects a Raspberry Pi to an MQTT broker to listen for
# commands from the CampusFlow web application to control a servo
# motor (gate) and an LED indicator.
#
# Required Libraries:
#   - paho-mqtt:  `pip3 install paho-mqtt`
#   - RPi.GPIO:   `pip3 install RPi.GPIO`
#
# Hardware Setup:
#   - Servo Motor Signal Pin -> GPIO 17 (or change SERVO_PIN)
#   - LED Anode (+) -> GPIO 18 (or change LED_PIN)
#   - LED Cathode (-) -> 220-330 Ohm Resistor -> Pi Ground (GND)
# =================================================================

import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time
import sys

# --- 1. Configuration ---
# MQTT Broker Details
BROKER_URL    = "broker.emqx.io"
BROKER_PORT   = 1883
CLIENT_ID     = f"ats_pi_controller_{int(time.time())}"

# MQTT Topics
GATE_TOPIC    = "ats/smartgate/gate"      # Topic for receiving gate commands (0 or 90)
LED_TOPIC     = "ats/smartgate/led"       # Topic for receiving LED commands (on, off, flash)
STATUS_TOPIC  = "ats/smartgate/status"    # Topic for publishing the Pi's online status

# GPIO Pin Configuration
SERVO_PIN = 17
LED_PIN   = 18

# --- 2. Global Variables ---
client = None
pwm = None

# --- 3. MQTT Callback Functions ---

# Called when the client successfully connects to the broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
        # Subscribe to the command topics
        client.subscribe(GATE_TOPIC)
        client.subscribe(LED_TOPIC)
        print(f"👂 Subscribed to topics: '{GATE_TOPIC}' and '{LED_TOPIC}'")
        
        # Publish "online" message to the status topic
        client.publish(STATUS_TOPIC, "online", qos=1, retain=True)
        print(f"📢 Published 'online' to '{STATUS_TOPIC}'")
    else:
        print(f"❌ Failed to connect, return code {rc}\n. Exiting.")
        sys.exit()

# Called when a message is received from a subscribed topic
def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print(f"📬 Received message on topic '{msg.topic}': {payload}")

    if msg.topic == GATE_TOPIC:
        handle_gate_command(payload)
    elif msg.topic == LED_TOPIC:
        handle_led_command(payload)

# Called when the client disconnects
def on_disconnect(client, userdata, rc):
    print("🔌 Disconnected from MQTT Broker.")

# --- 4. Hardware Control Functions ---

def setup_gpio():
    """Initializes GPIO pins and servo PWM."""
    global pwm
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)

    # Setup Servo
    GPIO.setup(SERVO_PIN, GPIO.OUT)
    pwm = GPIO.PWM(SERVO_PIN, 50)  # 50Hz for servo
    pwm.start(0)
    set_servo_angle(0) # Start in closed position
    print("🔧 Servo initialized at 0 degrees (closed).")

    # Setup LED
    GPIO.setup(LED_PIN, GPIO.OUT)
    GPIO.output(LED_PIN, GPIO.LOW)
    print("💡 LED initialized to OFF.")

def set_servo_angle(angle):
    """Moves the servo to a specified angle."""
    # Duty cycle formula for servos: (angle / 18) + 2.5
    # Clamp angle between 0 and 90
    angle = max(0, min(90, angle))
    duty = (angle / 18) + 2.5
    pwm.ChangeDutyCycle(duty)
    time.sleep(0.5) # Give servo time to move
    # pwm.ChangeDutyCycle(0) # Stop sending signal to prevent jitter
    print(f"⚙️ Servo moved to {angle} degrees.")

def handle_gate_command(payload):
    """Processes commands for the gate servo."""
    try:
        angle = int(payload)
        set_servo_angle(angle)
    except ValueError:
        print(f"⚠️ Invalid gate command: '{payload}'. Expected an integer (0 or 90).")

def handle_led_command(payload):
    """Processes commands for the LED."""
    if payload == "on":
        GPIO.output(LED_PIN, GPIO.HIGH)
        print("💡 LED turned ON.")
    elif payload == "off":
        GPIO.output(LED_PIN, GPIO.LOW)
        print("💡 LED turned OFF.")
    elif payload == "flash":
        print("💡 Flashing LED...")
        for _ in range(3):
            GPIO.output(LED_PIN, GPIO.HIGH)
            time.sleep(0.3)
            GPIO.output(LED_PIN, GPIO.LOW)
            time.sleep(0.3)
    else:
        print(f"⚠️ Invalid LED command: '{payload}'. Expected 'on', 'off', or 'flash'.")


# --- 5. Main Execution ---

def main():
    """Main function to set up GPIO and connect to MQTT."""
    global client
    try:
        setup_gpio()

        client = mqtt.Client(CLIENT_ID)
        
        # Set Last Will and Testament
        # If the Pi disconnects ungracefully, the broker will publish "offline"
        client.will_set(STATUS_TOPIC, payload="offline", qos=1, retain=True)
        print("📜 Set Last Will and Testament to publish 'offline'.")
        
        client.on_connect = on_connect
        client.on_message = on_message
        client.on_disconnect = on_disconnect
        
        print(f"⏳ Connecting to MQTT broker at {BROKER_URL}...")
        client.connect(BROKER_URL, BROKER_PORT, 60)

        # Loop forever to process network traffic and dispatch callbacks
        client.loop_forever()

    except KeyboardInterrupt:
        print("\n🛑 Program interrupted by user.")
    finally:
        if pwm:
            pwm.stop()
        GPIO.cleanup()
        if client:
            # Before disconnecting, explicitly publish "offline"
            client.publish(STATUS_TOPIC, "offline", qos=1, retain=True)
            client.disconnect()
        print("👋 GPIO cleaned up and client disconnected. Goodbye!")


if __name__ == "__main__":
    main()

    