// const express = require('express');
// const http = require('http');
// const mqtt = require('mqtt');
// const socketIo = require('socket.io');
// const cors = require('cors');


// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'], 
//     credentials: true,
//   },
// }); 

// app.use(cors({
//   origin: 'http://localhost:3000', // Frontend origin
//   methods: ['GET', 'POST'],
//   credentials: true, // Allow credentials if needed
// }));
// // app.use(cors());

// // MQTT Broker settings
// const MQTT_BROKER = 'mqtt://broker.emqx.io';
// const MQTT_TOPIC = 'emqx/esp8266/tbfm';

// // Connect to the MQTT broker
// const mqttClient = mqtt.connect(MQTT_BROKER, {
//   username: 'emqx', 
//   password: 'public', 
// });

// mqttClient.on('connect', () => {
//   console.log('Connected to MQTT broker');
//   mqttClient.subscribe(MQTT_TOPIC, (err) => {
//     if (err) {
//       console.error(`Failed to subscribe to topic ${MQTT_TOPIC}`, err);
//     } else {
//       console.log(`Subscribed to topic ${MQTT_TOPIC}`);
//     }
//   });
// });

// // Listen for messages from the MQTT broker
// mqttClient.on('message', (topic, message) => {
//   console.log(`Message received on topic ${topic}: ${message.toString()}`);
//   const data = message.toString();
//   // console.log(data);
//   // Send the message to connected frontend clients via Socket.io
//   io.emit('mqttData', data);
// });

// // Start the server
// const PORT = 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });






// const express = require('express');
// const http = require('http');
// const mqtt = require('mqtt');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const XLSX = require('xlsx');
// const fs = require('fs');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST'],
//   credentials: true,
// }));

// // MQTT Broker settings
// const MQTT_BROKER = 'mqtt://broker.emqx.io';
// const MQTT_TOPIC = 'emqx/esp8266/tbfm';

// // Connect to the MQTT broker
// const mqttClient = mqtt.connect(MQTT_BROKER, {
//   username: 'emqx',
//   password: 'public',
// });

// mqttClient.on('connect', () => {
//   console.log('Connected to MQTT broker');
//   mqttClient.subscribe(MQTT_TOPIC, (err) => {
//     if (err) {
//       console.error(`Failed to subscribe to topic ${MQTT_TOPIC}, err`);
//     } else {
//       console.log(`Subscribed to topic ${MQTT_TOPIC}`);
//     }
//   });
// });

// app.use(express.json());

// // Login credentials
// const ADMIN_CREDENTIALS = {
//   username: 'admin_motor',
//   password: 'admin1234',
// };

// // Login route
// app.post('/api/login', (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ success: false, message: 'Username and password are required' });
//   }

//   if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
//     return res.status(200).json({ success: true, isAdmin: true });
//   } else {
//     return res.status(200).json({ success: true, isAdmin: false });
//   }
// });

// // Comprehensive sensor data parsing function
// const parseSensorData = (dataString) => {
//   const parsedData = {};

//   // Regular expression to match the data pattern
//   const regex = /RPM:([\d.]+),\s*Temperature:([\d.]+)\u00b0C,\s*Humidity:([\d.]+)%,\s*Peak Acceleration:([\d.-]+)\s*m\/s²,\s*SoundDB:([\d.]+)\s*db,\s*Volts:([\d.]+|nan)\s*V,\s*Current:([\d.]+)\s*A,\s*Power:([\d.]+)\s*W,\s*MotorId:"?([\w]+)"?/;

//   const match = dataString.match(regex);
//   const timestamp = new Date().toLocaleTimeString();
//   const datestamp = new Date().toLocaleDateString();
//   console.log('Data received:', dataString);  // Log the incoming data string

//   if (match) {
//     console.log('Full Regex Match:', match);  // Log the full regex match

//     parsedData.Datestamp = datestamp;
//     parsedData.Timestamp = timestamp;
//     parsedData.RPM = parseFloat(match[1]);
//     parsedData.Temperature = parseFloat(match[2]);
//     parsedData.Humidity = parseFloat(match[3]);
//     parsedData.PeakAcceleration = parseFloat(match[4]);
//     parsedData.SoundDB = isNaN(parseFloat(match[5])) ? null : parseFloat(match[5]);
//     parsedData.Volts = match[6] === 'nan' ? null : parseFloat(match[6]);
//     parsedData.Current = parseFloat(match[7]);
//     parsedData.Power = parseFloat(match[8]);
//     parsedData.MotorID = match[9].replace(/"/g, '');

//     console.log('Parsed Sensor Data:', parsedData);  // Log the parsed data

//     return parsedData;
//   }

//   console.error('Failed to parse data. Raw data string:', dataString);
//   return null;
// };

// // Function to append data to Excel file
// const appendToExcel = (data) => {
//   try {
//     const filePath = './CBMS_TVF.xlsx';

//     // Parse the incoming data
//     const parsedData = parseSensorData(data);
//     if (!parsedData) {
//       console.error('Parsing failed for data:', data);
//       return;
//     }

//     let previousSoundDB = null;  // To store the previous SoundDB value
//     let previousPeakAcceleration = null;  // To store the previous PeakAcceleration value

//     // Check if the file exists
//     if (!fs.existsSync(filePath)) {
//       // Create a new workbook (with rate of change columns)
//       const workbook = XLSX.utils.book_new();
//       const worksheetData = [
//         [
//           'Datestamp', 'Timestamp', 'RPM', 'Temperature', 'Humidity', 
//           'PeakAcceleration', 'SoundDB', 'Volts', 'Current', 
//           'Power', 'MotorID', 'RateOfChangeSoundDB', 'RateOfChangePeakAcceleration'
//         ],
//         [
//          parsedData.Datestamp, parsedData.Timestamp, parsedData.RPM, parsedData.Temperature, 
//           parsedData.Humidity, parsedData.PeakAcceleration, parsedData.SoundDB, 
//           parsedData.Volts, parsedData.Current, parsedData.Power, 
//           parsedData.MotorID, 0, 0  // Initial values for rate of change
//         ]
//       ];
//       const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//       XLSX.writeFile(workbook, filePath);

//       previousSoundDB = parsedData.SoundDB;
//       previousPeakAcceleration = parsedData.PeakAcceleration;
//     } else {
//       const workbook = XLSX.readFile(filePath);
//       const worksheet = workbook.Sheets['Sheet1'];
//       const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//       const lastRow = existingData[existingData.length - 1];
//       previousSoundDB = lastRow[6]; // Assuming SoundDB is at index 5
//       previousPeakAcceleration = lastRow[5]; // Assuming PeakAcceleration is at index 4

//       const rateOfChangeSoundDB = previousSoundDB
//         ? Math.abs((parsedData.SoundDB - previousSoundDB) / parsedData.SoundDB)
//         : 0;
//       const rateOfChangePeakAcceleration = previousPeakAcceleration
//         ? Math.abs((parsedData.PeakAcceleration - previousPeakAcceleration) / parsedData.PeakAcceleration)
//         : 0;

//       existingData.push([
//         parsedData.Datestamp, parsedData.Timestamp, parsedData.RPM, parsedData.Temperature, 
//         parsedData.Humidity, parsedData.PeakAcceleration, parsedData.SoundDB, 
//         parsedData.Volts, parsedData.Current, parsedData.Power, 
//         parsedData.MotorID, rateOfChangeSoundDB.toFixed(6), rateOfChangePeakAcceleration.toFixed(6)
//       ]);

//       const updatedWorksheet = XLSX.utils.aoa_to_sheet(existingData);
//       workbook.Sheets['Sheet1'] = updatedWorksheet;
//       XLSX.writeFile(workbook, filePath);

//       console.log('Successfully appended data to Excel');
//     }
//   } catch (error) {
//     console.error('Error in appendToExcel function:', error);
//   }
// };

// // MQTT message handling
// mqttClient.on('message', (topic, message) => {
//   console.log(`Message received on topic ${topic}: ${message.toString()}`);
//   const data = message.toString();

//   // appendToExcel(data);

//   io.emit('mqttData', data);
// });

// mqttClient.on('error', (error) => {
//   console.error('MQTT Client Error:', error);
// });

// const PORT = 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

























require('dotenv').config(); 

const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const socketIo = require('socket.io');
const cors = require('cors');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const {
  MQTT_BROKER,
  MQTT_TOPIC,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  CLIENT_URL,
  PORT = 5000
} = process.env;

const io = socketIo(server, {
  cors: {
    origin: 'https://cbms-k176.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'https://cbms-k176.onrender.com',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// Connect to MQTT broker
const mqttClient = mqtt.connect(MQTT_BROKER, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
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

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: ADMIN_USERNAME,
  password: ADMIN_PASSWORD,
};

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return res.status(200).json({ success: true, isAdmin: true });
  } else {
    return res.status(200).json({ success: true, isAdmin: false });
  }
});

// Parse sensor data function (same regex and parsing as before)
const parseSensorData = (dataString) => {
  const parsedData = {};
  const regex = /RPM:([\d.]+),\s*Temperature:([\d.]+)\u00b0C,\s*Humidity:([\d.]+)%,\s*Peak Acceleration:([\d.-]+)\s*m\/s²,\s*SoundDB:([\d.]+)\s*db,\s*Volts:([\d.]+|nan)\s*V,\s*Current:([\d.]+)\s*A,\s*Power:([\d.]+)\s*W,\s*MotorId:"?([\w]+)"?/;

  const match = dataString.match(regex);
  const timestamp = new Date().toLocaleTimeString();
  const datestamp = new Date().toLocaleDateString();
  console.log('Data received:', dataString);

  if (match) {
    console.log('Full Regex Match:', match);

    parsedData.Datestamp = datestamp;
    parsedData.Timestamp = timestamp;
    parsedData.RPM = parseFloat(match[1]);
    parsedData.Temperature = parseFloat(match[2]);
    parsedData.Humidity = parseFloat(match[3]);
    parsedData.PeakAcceleration = parseFloat(match[4]);
    parsedData.SoundDB = isNaN(parseFloat(match[5])) ? null : parseFloat(match[5]);
    parsedData.Volts = match[6] === 'nan' ? null : parseFloat(match[6]);
    parsedData.Current = parseFloat(match[7]);
    parsedData.Power = parseFloat(match[8]);
    parsedData.MotorID = match[9].replace(/"/g, '');

    console.log('Parsed Sensor Data:', parsedData);

    return parsedData;
  }

  console.error('Failed to parse data. Raw data string:', dataString);
  return null;
};

// Append data to Excel
const appendToExcel = (data) => {
  try {
    const filePath = './CBMS_TVF.xlsx';

    const parsedData = parseSensorData(data);
    if (!parsedData) {
      console.error('Parsing failed for data:', data);
      return;
    }

    let previousSoundDB = null;
    let previousPeakAcceleration = null;

    if (!fs.existsSync(filePath)) {
      const workbook = XLSX.utils.book_new();
      const worksheetData = [
        [
          'Datestamp', 'Timestamp', 'RPM', 'Temperature', 'Humidity', 
          'PeakAcceleration', 'SoundDB', 'Volts', 'Current', 
          'Power', 'MotorID', 'RateOfChangeSoundDB', 'RateOfChangePeakAcceleration'
        ],
        [
          parsedData.Datestamp, parsedData.Timestamp, parsedData.RPM, parsedData.Temperature, 
          parsedData.Humidity, parsedData.PeakAcceleration, parsedData.SoundDB, 
          parsedData.Volts, parsedData.Current, parsedData.Power, 
          parsedData.MotorID, 0, 0
        ]
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, filePath);

      previousSoundDB = parsedData.SoundDB;
      previousPeakAcceleration = parsedData.PeakAcceleration;
    } else {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets['Sheet1'];
      const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const lastRow = existingData[existingData.length - 1];
      previousSoundDB = lastRow[6];
      previousPeakAcceleration = lastRow[5];

      const rateOfChangeSoundDB = previousSoundDB
        ? Math.abs((parsedData.SoundDB - previousSoundDB) / parsedData.SoundDB)
        : 0;
      const rateOfChangePeakAcceleration = previousPeakAcceleration
        ? Math.abs((parsedData.PeakAcceleration - previousPeakAcceleration) / parsedData.PeakAcceleration)
        : 0;

      existingData.push([
        parsedData.Datestamp, parsedData.Timestamp, parsedData.RPM, parsedData.Temperature, 
        parsedData.Humidity, parsedData.PeakAcceleration, parsedData.SoundDB, 
        parsedData.Volts, parsedData.Current, parsedData.Power, 
        parsedData.MotorID, rateOfChangeSoundDB.toFixed(6), rateOfChangePeakAcceleration.toFixed(6)
      ]);

      const updatedWorksheet = XLSX.utils.aoa_to_sheet(existingData);
      workbook.Sheets['Sheet1'] = updatedWorksheet;
      XLSX.writeFile(workbook, filePath);

      console.log('Successfully appended data to Excel');
    }
  } catch (error) {
    console.error('Error in appendToExcel function:', error);
  }
};

// MQTT message handling
mqttClient.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);
  const data = message.toString();

  // Uncomment the next line if you want to save data to Excel
  // appendToExcel(data);

  io.emit('mqttData', data);
});

mqttClient.on('error', (error) => {
  console.error('MQTT Client Error:', error);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
