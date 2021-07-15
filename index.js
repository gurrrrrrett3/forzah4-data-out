const dgram = require("dgram");
const server = dgram.createSocket("udp4");
const fs = require("fs");
const fetch = require("node-fetch");

const {
  udp_port,
  web_port,
  light_controller_mode,
  light_controller_address,
  data_file_path,
} = require("./config.json");

//light controller modes

//-1 = off
//0 = accel
//1 = driveLine
//2 = RPM

var Rainbow = require("rainbowvis.js");
var red = new Rainbow();
var green = new Rainbow();
var line = new Rainbow();
var rpm = new Rainbow();

red.setSpectrum("#000000", "#FF0000");
green.setSpectrum("#000000", "#00FF00");
line.setSpectrum("#0000FF", "#0000FF", "#FFFF00", "#FF0000");
rpm.setSpectrum("#FFFFFF", "#00FF00", "#FFFF00", "#FF0000", "#FF0000");

red.setNumberRange(0, 255);
green.setNumberRange(0, 255);
line.setNumberRange(-127, 127);

const express = require("express");
const app = express();

var frameCount = 0;

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  frameCount++;

  var dataOut = {
    gameOn: msg.readInt32LE(0), //4
    timestamp: msg.readUInt32LE(4), //4
    //rpm
    maxRPM: msg.readFloatLE(8), //4
    idleRPM: msg.readFloatLE(12), //4
    currentRPM: msg.readFloatLE(16), //4
    //accel
    accelX: msg.readFloatLE(20), //4
    accelY: msg.readFloatLE(24), //4
    accelZ: msg.readFloatLE(28), //4
    //vel
    velX: msg.readFloatLE(32), //4
    velY: msg.readFloatLE(36), //4
    velZ: msg.readFloatLE(40), //4
    //angvel
    angX: msg.readFloatLE(44), //4
    angY: msg.readFloatLE(48), //4
    angZ: msg.readFloatLE(52), //4
    //ang
    yaw: msg.readFloatLE(56), //4
    pitch: msg.readFloatLE(60), //4
    roll: msg.readFloatLE(64), //4

    //ignoring tech stuff i don't care about, skip 144 bytes

    carID: msg.readInt32LE(212), //4
    carClass: msg.readInt32LE(216), //4
    carPreform: msg.readInt32LE(220), //4
    dtType: msg.readInt32LE(224), //4
    numCyl: msg.readInt32LE(228), //4

    //v2 info

    //pos
    posX: msg.readFloatLE(244), //4
    posY: msg.readFloatLE(248), //4
    posZ: msg.readFloatLE(252), //4

    //spd

    speed: msg.readFloatLE(256), //4
    power: msg.readFloatLE(260), //4
    torque: msg.readFloatLE(264), //4

    flTemp: msg.readFloatLE(268), //4
    frTemp: msg.readFloatLE(272), //4
    blTemp: msg.readFloatLE(276), //4
    brTemp: msg.readFloatLE(280), //4

    boost: msg.readFloatLE(284), //4
    fuel: msg.readFloatLE(288), //4
    travel: msg.readFloatLE(292), //4
    bestLap: msg.readFloatLE(296), //4
    lastLap: msg.readFloatLE(300), //4
    currentLap: msg.readFloatLE(304), //4
    currentRaceTime: msg.readFloatLE(308), //4

    lapNumber: msg.readInt16LE(312), //2
    racePos: msg.readUInt8(314), //1

    accel: msg.readUInt8(315), //1
    brake: msg.readUInt8(316), //1
    clutch: msg.readUInt8(317), //1
    handBrake: msg.readUInt8(318), //1
    gear: msg.readUInt8(319), //1
    steer: msg.readInt8(320), //1

    drivingLine: msg.readInt8(321), //1
    brakeDifference: msg.readInt8(322), //1
  };
  try {
    fs.writeFileSync(data_file_path, JSON.stringify(dataOut, null, 4));
  } catch (error) {

    console.log(`Error writing to data file, make sure you typed the correct path, or create a file here: ${data_file_path}. Error listed below.`)
    console.error(error)

  }

  if (frameCount % 4 == 0) {
    switch (light_controller_mode) {
      case 0:
        if (dataOut.brake > 0) {
          SetLEDColor(red.colorAt(dataOut.brake));
        } else if (dataOut.accel > 0) {
          SetLEDColor(green.colorAt(dataOut.accel));
        } else if (dataOut.gameOn == 0) {
          SetLEDColor("FFFFFF");
        } else {
          SetLEDColor("000000");
        }
        break;

      case 1:
        if (dataOut.gameOn == 1) {
          SetLEDColor(line.colorAt(dataOut.brakeDifference));
        } else {
          SetLEDColor("FFFFFF");
        }
        break;

      case 2:
        rpm.setNumberRange(0, dataOut.maxRPM + 1);

        if (dataOut.gameOn == 1) {
          SetLEDColor(rpm.colorAt(dataOut.currentRPM));
        } else {
          SetLEDColor("FFFFFF");
        }
        break;

      default:
        break;
    }
  }
});

server.bind(udp_port);

app.listen(web_port, () => {
  console.log(
    `Webserver listening on port ${web_port}, UDP server running on port ${udp_port}\nYou can open the web dashboard by going to http://localhost:${web_port}/`
  );
});

app.use("/assets", express.static("./assets"));

app.get("/", (req, res) => {
  res.sendFile("/assets/home.html", { root: "." });
});

app.get("/data", (req, res) => {
  res.sendFile(data_file_path.slice(1), { root: "." });
});

function SetLEDColor(color) {
  fetch(light_controller_address, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hex: color }),
  });
}
