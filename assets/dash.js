const canvas = document.getElementById("dash");
/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

var droppedFrames = 0;

var dataOut = {};

var accelArray = [];

const constData = {
  /**
   *
   * @param {Number} c
   * @returns
   */
  class: (c) => {
    var ret;
    if (c < 501) {
      ret = "D";
    } else if (c > 500 && c < 601) {
      ret = "C";
    } else if (c > 600 && c < 701) {
      ret = "B";
    } else if (c > 700 && c < 801) {
      ret = "A";
    } else if (c > 800 && c < 901) {
      ret = "S1";
    } else if (c > 900 && c < 999) {
      ret = "S2";
    } else if (c == 999) {
      ret = "X";
    } else {
      ret = "Invalid Class";
    }

    return ret;
  },
  place: (v) => {
    if (v == 0) {
      return "";
    } else if (v == 1) {
      return "1st";
    } else if (v == 2) {
      return "2nd";
    } else if (v == 3) {
      return "3rd";
    } else {
      return `${v}th`;
    }
  },
};

document.body.style.overflow = "hidden";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

startAnimating(30);

// initialize the timer variables and start the animation

async function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  await animate();
}

// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved

async function animate() {
  // request another frame

  requestAnimationFrame(animate);

  // calc elapsed time since last loop

  now = Date.now();
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame

  if (elapsed > fpsInterval) {
    // Get ready for next frame by setting then=now, but also adjust for your
    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
    then = now - (elapsed % fpsInterval);

    //drawing code time!

    ctx.fillStyle = "#fff";
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = "#fff";

    frameCount ++ 

    try {
      await fetch("/data")
        .then((response) => response.json())
        .then((data) => (dataOut = data));
    } catch (error) {
      console.log("Error, skipping frame...");
      droppedFrames++;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = "72px Arial";

    if (dataOut.gameOn == 1) {
      ctx.fillText(
        `${Math.round(dataOut.speed * 2.237)} MPH`,
        110,
        window.innerHeight - 200
      );

      ctx.font = "24px Arial";

      ctx.fillText(
        `${localStorage.getItem("speed")} MPH`,
        110,
        window.innerHeight - 180
      );

      DrawSlider(
        ctx,
        20,
        window.innerHeight - 60,
        250,
        (dataOut.steer / 127) * 100,
        "#fff",
        true
      );

      DrawVertSlider(
        ctx,
        20,
        window.innerHeight - 320,
        250,
        (dataOut.accel / 255) * 100,
        "#0f0",
        false
      );
      DrawVertSlider(
        ctx,
        50,
        window.innerHeight - 320,
        250,
        (dataOut.brake / 255) * 100,
        "#fff",
        false
      );

      DrawVertSlider(
        ctx,
        80,
        window.innerHeight - 320,
        250,
        (dataOut.currentRPM / dataOut.maxRPM) * 100,
        "#f00",
        false
      );

      DrawSlider(ctx, window.innerWidth - 300, window.innerHeight - 50, 250, (dataOut.drivingLine / 127) * 100, "#fff", true )
      DrawSlider(ctx, window.innerWidth - 300, window.innerHeight - 80, 250, (dataOut.brakeDifference / 127) * 100, "#fff", true )

      ctx.font = "24px Arial";
      ctx.fillText(`Gear ${dataOut.gear}`, 110, window.innerHeight - 300);
      ctx.fillText(
        `${Math.round(dataOut.travel / 160.9) / 10} Miles`,
        20,
        window.innerHeight - 340
      );
      ctx.fillText(
        `Class ${constData.class(dataOut.carPreform)} | ${dataOut.carPreform}`,
        110,
        window.innerHeight - 80
      );
      ctx.fillText(Math.round(dataOut.boost), 110, window.innerHeight - 270);
      ctx.fillText(`ID: ${dataOut.carID}`, 110, window.innerHeight - 100);
      ctx.fillText(
        constData.place(dataOut.racePos),
        20,
        window.innerHeight - 370
      );
      ctx.fillText(
        `X: ${Math.round(dataOut.posX)}`,
        20,
        window.innerHeight - 650
      );
      ctx.fillText(
        `Y: ${Math.round(dataOut.posY)}`,
        20,
        window.innerHeight - 620
      );
      ctx.fillText(
        `Z: ${Math.round(dataOut.posZ)}`,
        20,
        window.innerHeight - 590
      );

      ctx.fillText(
        `Race Time: ${msToTime(dataOut.currentRaceTime * 1000)}`,
        20,
        window.innerHeight - 390
      );

      ctx.fillText(`Best Lap: ${msToTime(dataOut.bestLap * 1000)}`, 20, window.innerHeight - 480)
      ctx.fillText(`Last Lap: ${msToTime(dataOut.lastLap * 1000)}`, 20, window.innerHeight - 450)
      ctx.fillText(`Current Lap: ${msToTime(dataOut.currentLap * 1000)}`, 20, window.innerHeight - 420)

      //brake Lights

      ctx.save()
      ctx.lineWidth = 5
        ctx.strokeStyle = "#F00"
        ctx.fillStyle = "#F00"
        ctx.beginPath()
      ctx.arc(window.innerWidth - 50, 200, 25, 0, 2 * Math.PI)
      if (dataOut.brakeDifference > 25) {
          ctx.fill()
      } else {
          ctx.stroke()
      }

      ctx.strokeStyle = "#FFF"
        ctx.fillStyle = "#FFF"
        ctx.beginPath()
      ctx.arc(window.innerWidth - 50, 260, 25, 0, 2 * Math.PI)
      if (dataOut.brakeDifference < 25 && dataOut.brakeDifference > -25) {
          ctx.fill()
      } else {
          ctx.stroke()
      }

      ctx.strokeStyle = "#0F0"
      ctx.fillStyle = "#0F0"
      ctx.beginPath()
    ctx.arc(window.innerWidth - 50, 320, 25, 0, 2 * Math.PI)
    if (dataOut.brakeDifference < -25) {
        ctx.fill()
    } else {
        ctx.stroke()
    }

      ctx.restore()

      if (dataOut)

      //Accel Array management

      if (accelArray.length < 256) {
        accelArray.push({
          x: dataOut.accelX,
          y: dataOut.accelY,
          z: dataOut.accelZ,
        });
      } else {
        accelArray.shift();
        accelArray.push({
          x: dataOut.accelX,
          y: dataOut.accelY,
          z: dataOut.accelZ,
        });
      }

      ctx.save();
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.strokeStyle = "#FF0000";
      accelArray.forEach((e, i) => {
        ctx.lineTo((i / 256) * window.innerWidth, e.x + 70);
      });
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "#00FF00";
      accelArray.forEach((e, i) => {
        ctx.lineTo((i / 256) * window.innerWidth, e.y + 70);
      });
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "#0000FF";
      accelArray.forEach((e, i) => {
        ctx.lineTo((i / 256) * window.innerWidth, e.z + 70);
      });
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillText("Paused", 10, 100);
    }
    ctx.font = "12px Arial";
    ctx.fillText(
      `${droppedFrames} Dropped frames (${Math.round(
        droppedFrames * (1000 / 33)
      )}ms, ${Math.round((droppedFrames / frameCount) * 1000) / 10}%)`,
      10,
      window.innerHeight - 20
    );
  }


  if (localStorage.getItem("speed") == null) {
    localStorage.setItem("speed", 0)
  }
  
  const storedSpeed = Number.parseFloat(localStorage.getItem("speed"))
  const speed = Math.round(dataOut.speed * 2.237)
  
  if (speed > storedSpeed) {
  
  
    localStorage.setItem("speed", speed)
  
  
  }


}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} val
 * @param {String} color
 * @param {Boolean} centered
 */

function DrawSlider(ctx, x, y, width, val, color, centered) {
  ctx.save();
  ctx.strokeStyle = "ffffff";
  ctx.strokeRect(x, y, width, 20);

  ctx.fillStyle = color;

  if (centered) {
    ctx.fillRect(x + width / 2, y, (val / 100) * (width / 2), 20);
  } else ctx.fillRect(x, y, (val / 100) * width, 20);
  ctx.restore();
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x
 * @param {Number} y
 * @param {Number} height
 * @param {Number} val
 * @param {String} color
 * @param {Boolean} centered
 */

function DrawVertSlider(ctx, x, y, height, val, color, centered) {
  ctx.save();
  ctx.strokeStyle = "ffffff";
  ctx.strokeRect(x, y, 20, height);

  ctx.fillStyle = color;

  if (centered) {
    ctx.fillRect(x, y + height / 2, 20, (val / 100) * (height / 2));
  } else ctx.fillRect(x, y + height, 20, 0 - (val / 100) * height);
  ctx.restore();
}

function ConText(ctx, text, x, y, val, yColor, nColor) {
  ctx.save();

  if (val == true || val == 1) {
    ctx.fillColor = yColor;
  } else {
    ctx.fillColor = nColor;
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

function msToTime(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }


function SetLEDColor(hex) {

  fetch("http://10.0.0.82:3333/", {
    method: "POST",
    mode: "no-cors",
    headers: {
      Accept: "application/json",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ hex: hex }),
  });
}


//top data

