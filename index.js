const dgram = require("dgram");
const server = dgram.createSocket("udp4");
const fs = require("fs");

const express = require("express");
const app = express();

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
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
  };

  fs.writeFileSync("./data.json", JSON.stringify(dataOut, null, 4));
});

server.bind(3343);

app.listen(3334, () => {
  console.log(
    "Webserver listening on port 3334, UDP server running on port 3343"
  );
});

app.use("/assets", express.static("./assets"));

app.get("/", (req, res) => {
  res.sendFile("/assets/home.html", { root: "." });
});

app.get("/data", (req, res) => {
  res.sendFile("/data.json", { root: "." });
});
