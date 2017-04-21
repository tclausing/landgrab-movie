(function() {

  chrome.runtime.sendMessage({
    active: true
  });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.run) {
        LandGrabMovie([], request.options);
      }
    });

  var storage = chrome.storage.local;
  storage.get(['uris', 'options'], function(items) {
    if (items.uris) {
      LandGrabMovie(items.uris, items.options);
    }
  });

  function LandGrabMovie(uris, options) {
    console.info('script.js');
    var el = document.getElementById('imgdiv');

    // domtoimage.toJpeg(el, {
    //     quality: 0.95
    //   })
    domtoimage.toPixelData(el)
      .then(function(pixels) {

        var width = el.offsetWidth,
          height = el.offsetHeight;

        var encoder = new WebPEncoder();
        // http://libwebpjs.appspot.com/v0.1.3/
        encoder.WebPEncodeConfig({
          method: options.method
        });
        var out = {};
        encoder.WebPEncodeRGBA(pixels, width, height, width * 4, options.quality, out);
        var b64 = btoa(out.output);
        uris.push('data:image/webp;base64,' + b64);

        var btn = document.querySelector('#forward_one_btn');
        if (btn.getAttribute('btn_disabled') === 'true') {
          // debugger;
          storage.remove('uris');
          createVideo(uris, width, height, options);
        } else {
          storage.set({
            uris: uris
          }, function() {
            btn.click();
          });
        }
      });
  }


  function createVideo(uris, width, height, options) {
    /* adapted from http://techslides.com/demos/image-video/create.html */

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    // https://github.com/antimatter15/whammy
    var video = new Whammy.Video(options.framerate);

    function next() {
      if (uris.length) {
        // process(uris.shift(), canvas, context, video, next);
        // debugger;
        video.add(uris.shift());
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
