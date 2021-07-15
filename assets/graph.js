
  var stop = false;
  var frameCount = 0;
  var fps, fpsInterval, startTime, now, then, elapsed;
  
  
  // initialize the timer variables and start the animation
  
  function startAnimating(fps) {
      fpsInterval = 1000 / fps;
      then = Date.now();
      startTime = then;
      animate();
  }


  // the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved

function animate() {

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

        frameCount ++ 

        var labels = [0];
 
        if (frameCount % 1000 == 0) {
            labels.push(frameCount)
        }

          var data = {
            labels: labels,
            datasets: [{
              label: '',
              backgroundColor: 'rgb(0,0,0)',
              borderColor: 'rgb(255, 255, 255)',
              data: [],
            }]
          };

        var config = {
            type: 'line',
            data,
            options: {
                parsing: {
                    yAxisKey: 'data.value'
                }
            }
          };
        
        var chart = new Chart(
            document.getElementById('chart'),
            config
          );

    }
}