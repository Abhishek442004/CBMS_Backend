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

























// require('dotenv').config(); 

// const express = require('express');
// const http = require('http');
// const mqtt = require('mqtt');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const XLSX = require('xlsx');
// const fs = require('fs');

// const app = express();
// const server = http.createServer(app);

// const {
//   MQTT_BROKER,
//   MQTT_TOPIC,
//   MQTT_USERNAME,
//   MQTT_PASSWORD,
//   ADMIN_USERNAME,
//   ADMIN_PASSWORD,
//   CLIENT_URL,
//   PORT = 5000
// } = process.env;

// const io = socketIo(server, {
//   cors: {
//     origin: 'https://cbms-k176.onrender.com',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// app.use(cors({
//   origin: 'https://cbms-k176.onrender.com',
//   methods: ['GET', 'POST'],
//   credentials: true,
// }));

// app.use(express.json());

// // Connect to MQTT broker
// const mqttClient = mqtt.connect(MQTT_BROKER, {
//   username: MQTT_USERNAME,
//   password: MQTT_PASSWORD,
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

// // Admin credentials
// const ADMIN_CREDENTIALS = {
//   username: ADMIN_USERNAME,
//   password: ADMIN_PASSWORD,
// };

// // Login API
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

// // Parse sensor data function (same regex and parsing as before)
// const parseSensorData = (dataString) => {
//   const parsedData = {};
//   const regex = /RPM:([\d.]+),\s*Temperature:([\d.]+)\u00b0C,\s*Humidity:([\d.]+)%,\s*Peak Acceleration:([\d.-]+)\s*m\/s²,\s*SoundDB:([\d.]+)\s*db,\s*Volts:([\d.]+|nan)\s*V,\s*Current:([\d.]+)\s*A,\s*Power:([\d.]+)\s*W,\s*MotorId:"?([\w]+)"?/;

//   const match = dataString.match(regex);
//   const timestamp = new Date().toLocaleTimeString();
//   const datestamp = new Date().toLocaleDateString();
//   console.log('Data received:', dataString);

//   if (match) {
//     console.log('Full Regex Match:', match);

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

//     console.log('Parsed Sensor Data:', parsedData);

//     return parsedData;
//   }

//   console.error('Failed to parse data. Raw data string:', dataString);
//   return null;
// };

// // Append data to Excel
// const appendToExcel = (data) => {
//   try {
//     const filePath = './CBMS_TVF.xlsx';

//     const parsedData = parseSensorData(data);
//     if (!parsedData) {
//       console.error('Parsing failed for data:', data);
//       return;
//     }

//     let previousSoundDB = null;
//     let previousPeakAcceleration = null;

//     if (!fs.existsSync(filePath)) {
//       const workbook = XLSX.utils.book_new();
//       const worksheetData = [
//         [
//           'Datestamp', 'Timestamp', 'RPM', 'Temperature', 'Humidity', 
//           'PeakAcceleration', 'SoundDB', 'Volts', 'Current', 
//           'Power', 'MotorID', 'RateOfChangeSoundDB', 'RateOfChangePeakAcceleration'
//         ],
//         [
//           parsedData.Datestamp, parsedData.Timestamp, parsedData.RPM, parsedData.Temperature, 
//           parsedData.Humidity, parsedData.PeakAcceleration, parsedData.SoundDB, 
//           parsedData.Volts, parsedData.Current, parsedData.Power, 
//           parsedData.MotorID, 0, 0
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
//       previousSoundDB = lastRow[6];
//       previousPeakAcceleration = lastRow[5];

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

//   // Uncomment the next line if you want to save data to Excel
//   // appendToExcel(data);

//   io.emit('mqttData', data);
// });

// mqttClient.on('error', (error) => {
//   console.error('MQTT Client Error:', error);
// });

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server running on ${PORT}`);
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
  CLIENT_URL, // make sure this is set correctly in your .env file
  PORT = 5000
} = process.env;

// ✅ Use CLIENT_URL from .env or fallback to known frontend URL
const allowedOrigin = CLIENT_URL || "https://cbms-k176.onrender.com";

// Enable CORS for both Express and Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
});

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error(`❌ Failed to subscribe to topic ${MQTT_TOPIC}`, err);
    } else {
      console.log(`📡 Subscribed to topic ${MQTT_TOPIC}`);
    }
  });
});

// Admin login endpoint
const ADMIN_CREDENTIALS = {
  username: ADMIN_USERNAME,
  password: ADMIN_PASSWORD,
};

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

// Parse incoming JSON data
// const parseSensorData = (jsonString) => {
//   try {
//     const data = JSON.parse(jsonString);
//     const timestamp = new Date().toLocaleTimeString();
//     const datestamp = new Date().toLocaleDateString();

//     return {
//       Datestamp: datestamp,
//       Timestamp: timestamp,
//       RPM: data.RPM,
//       Current_PhaseA: data.Current_PhaseA,
//       Current_PhaseB: data.Current_PhaseB,
//       Current_PhaseC: data.Current_PhaseC,
//       Voltage_PhaseA: data.Voltage_PhaseA,
//       Voltage_PhaseB: data.Voltage_PhaseB,
//       Voltage_PhaseC: data.Voltage_PhaseC,
//       Temperature: data.Temperature,
//       Vibration_X: data.Vibration_X,
//       Vibration_Y: data.Vibration_Y,
//       Vibration_Z: data.Vibration_Z,
//       Acoustic: data.Acoustic
//     };
//   } catch (err) {
//     console.error("❌ Failed to parse JSON:", jsonString);
//     return null;
//   }
// };

const parseSensorData = (rawString) => {
  try {
    const data = {};
    const timestamp = new Date().toLocaleTimeString();
    const datestamp = new Date().toLocaleDateString();

   
    const pairs = rawString.split(',');

    pairs.forEach((pair) => {
      let [key, value] = pair.split(':');


      value = value.replace(/[^\d.-]/g, ''); // keep only numbers, dot, and minus sign

      // Convert to float if numeric
      data[key.trim()] = isNaN(value) ? value.trim() : parseFloat(value);
    });

    return {
      Datestamp: datestamp,
      Timestamp: timestamp,
      RPM: data.RPM,
      Current_PhaseA: data.Current, // Map as needed
      Current_PhaseB: data.Current,
      Current_PhaseC: data.Current,
      Voltage_PhaseA: data.Volts,
      Voltage_PhaseB: data.Volts,
      Voltage_PhaseC: data.Volts,
      Temperature: data.Temperature,
      Vibration_X: data['Peak Acceleration'],
      Vibration_Y: data['Peak Acceleration'],
      Vibration_Z: data['Peak Acceleration'],
      Acoustic: data.SoundDB
    };
  } catch (err) {
    console.error("❌ Failed to parse sensor data string:", rawString);
    return null;
  }
};



// Append to Excel
const appendToExcel = (parsedData) => {
  try {
    const filePath = './CBMS_TVF.xlsx';
    let prevX = null, prevY = null, prevZ = null;

    if (!fs.existsSync(filePath)) {
      const workbook = XLSX.utils.book_new();
      const worksheetData = [
        [
          'Datestamp', 'Timestamp', 'RPM', 'Current_PhaseA', 'Current_PhaseB', 'Current_PhaseC',
          'Voltage_PhaseA', 'Voltage_PhaseB', 'Voltage_PhaseC', 'Temperature',
          'Vibration_X', 'Vibration_Y', 'Vibration_Z',
          'RateOfChange_VibX', 'RateOfChange_VibY', 'RateOfChange_VibZ'
        ],
        [
          parsedData.Datestamp, parsedData.Timestamp, parsedData.RPM,
          parsedData.Current_PhaseA, parsedData.Current_PhaseB, parsedData.Current_PhaseC,
          parsedData.Voltage_PhaseA, parsedData.Voltage_PhaseB, parsedData.Voltage_PhaseC,
          parsedData.Temperature,
          parsedData.Vibration_X, parsedData.Vibration_Y, parsedData.Vibration_Z,
          0, 0, 0
        ]
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, filePath);
    } else {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets['Sheet1'];
      const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const lastRow = existingData[existingData.length - 1];
      prevX = lastRow[10];
      prevY = lastRow[11];
      prevZ = lastRow[12];

      const rateX = prevX ? Math.abs((parsedData.Vibration_X - prevX) / parsedData.Vibration_X) : 0;
      const rateY = prevY ? Math.abs((parsedData.Vibration_Y - prevY) / parsedData.Vibration_Y) : 0;
      const rateZ = prevZ ? Math.abs((parsedData.Vibration_Z - prevZ) / parsedData.Vibration_Z) : 0;

      existingData.push([
        parsedData.Datestamp, parsedData.Timestamp, parsedData.RPM,
        parsedData.Current_PhaseA, parsedData.Current_PhaseB, parsedData.Current_PhaseC,
        parsedData.Voltage_PhaseA, parsedData.Voltage_PhaseB, parsedData.Voltage_PhaseC,
        parsedData.Temperature,
        parsedData.Vibration_X, parsedData.Vibration_Y, parsedData.Vibration_Z,
        rateX.toFixed(6), rateY.toFixed(6), rateZ.toFixed(6)
      ]);

      const updatedWorksheet = XLSX.utils.aoa_to_sheet(existingData);
      workbook.Sheets['Sheet1'] = updatedWorksheet;
      XLSX.writeFile(workbook, filePath);
    }

    console.log('✅ Data saved to Excel.');
  } catch (error) {
    console.error('❌ Error saving to Excel:', error);
  }
};

// Handle incoming MQTT messages
mqttClient.on('message', (topic, message) => {
  console.log(`📥 MQTT message on topic ${topic}: ${message.toString()}`);

  const parsedData = parseSensorData(message.toString());
  if (parsedData) {
    io.emit('mqttData', parsedData);  
    appendToExcel(parsedData);        
  }
});

mqttClient.on('error', (error) => {
  console.error('❌ MQTT Client Error:', error);
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
