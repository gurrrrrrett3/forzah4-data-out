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
    timestamp: msg.readUInt32LE(4), //8
    //rpm
    maxRPM: msg.readFloatLE(8), //12
    idleRPM: msg.readFloatLE(12), //16
    currentRPM: msg.readFloatLE(16), //20
    //accel
    accelX: msg.readFloatLE(20), //24
    accelY: msg.readFloatLE(24), //28
    accelZ: msg.readFloatLE(28), //32
    //vel
    velX: msg.readFloatLE(32), //36
    velY: msg.readFloatLE(36), //40
    velZ: msg.readFloatLE(40), //44
    //angvel
    angX: msg.readFloatLE(44), //48
    angY: msg.readFloatLE(48), //52
    angZ: msg.readFloatLE(52), //56
    //ang
    yaw: msg.readFloatLE(56), //60
    pitch: msg.readFloatLE(60), //64
    roll: msg.readFloatLE(64), //68

    //ignoring tech stuff i don't care about, skip 144 bytes

    carID: msg.readInt32LE(212), //216
    carClass: msg.readInt32LE(216), //220
    carPreform: msg.readInt32LE(220), //224
    dtType: msg.readInt32LE(224), //228
    numCyl: msg.readInt32LE(228), //232

    //v2 info

    //pos
    posX: msg.readFloatLE(244), //236
    posY: msg.readFloatLE(248), //240
    posZ: msg.readFloatLE(252), //244

    //spd

    speed: msg.readFloatLE(256), //248
    power: msg.readFloatLE(260), //252
    torque: msg.readFloatLE(264), //256

    flTemp: msg.readFloatLE(268),
    frTemp: msg.readFloatLE(272),
    blTemp: msg.readFloatLE(276),
    brTemp: msg.readFloatLE(280),

    boost: msg.readFloatLE(284),
    fuel: msg.readFloatLE(288), 
    travel: msg.readFloatLE(292), 
    bestLap: msg.readFloatLE(296), 
    lastLap: msg.readFloatLE(300), 
    currentLap: msg.readFloatLE(304), 
    currentRaceTime: msg.readFloatLE(308), 

    lapNumber: msg.readInt16LE(312), 
    racePos: msg.readUInt8(314), 

    accel: msg.readUInt8(315), //304
    brake: msg.readUInt8(316), //305
    clutch: msg.readUInt8(317), //306
    handBrake: msg.readUInt8(318), //307
    gear: msg.readUInt8(319), //308
    steer: msg.readInt8(320), //309
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
