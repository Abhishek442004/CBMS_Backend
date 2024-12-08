const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'], 
    credentials: true,
  },
}); 

app.use(cors({
  origin: 'http://localhost:3000', // Frontend origin
  methods: ['GET', 'POST'],
  credentials: true, // Allow credentials if needed
}));
// app.use(cors());

// MQTT Broker settings
const MQTT_BROKER = 'mqtt://broker.emqx.io';
const MQTT_TOPIC = 'emqx/esp8266/led';

// Connect to the MQTT broker
const mqttClient = mqtt.connect(MQTT_BROKER, {
  username: 'emqx', 
  password: 'public', 
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic ${MQTT_TOPIC}`, err);
    } else {
      console.log(`Subscribed to topic ${MQTT_TOPIC}`);
    }
  });
});

// Listen for messages from the MQTT broker
mqttClient.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);
  const data = message.toString();
  // console.log(data);
  // Send the message to connected frontend clients via Socket.io
  io.emit('mqttData', data);
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

