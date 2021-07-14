const canvas = document.getElementById("dash");
/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

var droppedFrames = 0;

var dataOut = {};

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
    } else {
      ctx.fillText("Paused", 10, 100);
    }
    ctx.font = "12px Arial";
    ctx.fillText(
      `${droppedFrames} Dropped frames (${Math.round(
        droppedFrames * (1000 / 33)
      )}ms)`,
      10,
      window.innerHeight - 20
    );
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
