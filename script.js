(function() {

  chrome.runtime.sendMessage({
    active: true
  });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.run) {
        LandGrabMovie({
          uris: []
        }, request.options);
      }
    });

  var storage = chrome.storage.local;
  storage.get(['state', 'options'], function(items) {
    if (items.state) {
      LandGrabMovie(items.state, items.options);
    }
  });

  function LandGrabMovie(state, options) {
    console.info('script.js');

    var el = document.getElementById('imgdiv');
    doSteps(state, options, el, function() {

      var btn = document.querySelector('#forward_one_btn');
      if (isBtnDisabled(btn)) {
        storage.remove('state');
        createVideo(state.uris, el.offsetWidth, el.offsetHeight, options);
      } else {
        storage.set({
          state: state
        }, function() {
          btn.click();
        });
      }
    });
  }

  function isBtnDisabled(btn) {
    return btn.getAttribute('btn_disabled') === 'true';
  }

  function Pool(size, onmessage) {
    this.workers = [];
    while(size --) {
      var worker = new Worker(chrome.runtime.getURL('worker.js'));
      this.workers.push(worker);
      worker.onmessage = onmessage;
    }
    this.i = 0;
  }

  Pool.prototype.postMessage = function(data) {
    if (++this.i == this.workers.length) this.i = 0;
    this.workers[this.i].postMessage(data);
  };

  function doSteps(state, options, el, next) {

    var btn = document.querySelector('#action_continue');

    var count = 0, ind = 0, mainThreadDone = false;
    var pool = new Pool(3, function(e) {
      // console.log('Message from worker: ' + event.data);
      state.uris[e.data.ind] = e.data.uri;
      count--;
      console.info('Receive: ' + count);
      if (!count && mainThreadDone) {
        next();
      }
    });

    function nextStep() {
      if (isBtnDisabled(btn)) {
        mainThreadDone = true;
        if (!count) {
          next();
        }
      } else {
        btn.click();
        setTimeout(step, 20);
      }
    }

    function step() {
      var action = document.querySelector('#history_action_div').innerHTML;
      if (action.indexOf('Conquered territory') != -1) {
        // domtoimage.toJpeg(el, {
        //     quality: 0.95
        //   })
        domtoimage.toPixelData(el)
          .then(function(pixels) {

            console.info('Send: ' + count);
            pool.postMessage({
              ind: ind,
              options: options,
              pixels: pixels,
              width: el.offsetWidth,
              height: el.offsetHeight
            });
            count++;
            ind++;

            nextStep();
          });
      } else {
        nextStep();
      }
    }

    step();
  }

  function createVideo(uris, width, height, options) {
    /* adapted from http://techslides.com/demos/image-video/create.html */

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    // https://github.com/antimatter15/whammy
    var video = new Whammy.Video();
    var duration = 1000.0 / options.framerate;

    function next() {
      if (uris.length) {
        // process(uris.shift(), canvas, context, video, next);
        // debugger;
        video.add(uris.shift(), duration);
        if (uris.length === 1) {
          video.add(uris.shift(), 20000);
        }
        next();
      } else {
        finalizeVideo(video);
      }
    }

    next();
  }

  function process(dataUri, canvas, context, video, next) {

    var img = new Image();

    //load image and drop into canvas
    img.onload = function() {

      //a custom fade in and out slideshow
      context.globalAlpha = 0.2;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      video.add(context);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.globalAlpha = 0.4;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      video.add(context);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.globalAlpha = 0.6;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      video.add(context);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.globalAlpha = 0.8;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      video.add(context);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.globalAlpha = 1;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      //this should be a loop based on some user input
      video.add(context);
      video.add(context);
      video.add(context);
      video.add(context);
      video.add(context);
      video.add(context);
      video.add(context);

      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.globalAlpha = 0.8;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      video.add(context);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.globalAlpha = 0.6;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      video.add(context);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.globalAlpha = 0.4;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      video.add(context);

      next();
    };

    img.src = dataUri;
  }

  function finalizeVideo(video) {
    // var start_time = +new Date;
    video.compile(false, function(output) {

      // var end_time = +new Date;
      var url = URL.createObjectURL(output);

      var link = document.createElement('a');
      link.download = 'landgrab.webm';
      link.href = url;
      link.click();
      // debugger;
      var div = document.createElement('div');
      div.innerHTML = '<video controls autoplay loop></video>';
      var videoEl = div.childNodes[0];
      document.body.insertBefore(videoEl, document.body.firstChild);
      videoEl.src = url;
      // document.getElementById('status').innerHTML = "Compiled Video in " + (end_time - start_time) + "ms, file size: " + Math.ceil(output.size / 1024) + "KB";
    });
  }
})();
