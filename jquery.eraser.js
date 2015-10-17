/*
* jQuery.eraser v0.5.1
* makes any image or canvas erasable by the user, using touch or mouse input
* https://github.com/boblemarin/jQuery.eraser
*
* Usage:
*
* $('#myImage').eraser(); // simple way
*
* $(#canvas').eraser( {
*  size: 20, // define brush size (default value is 40)
*  completeRatio: .65, // allows to call function when a erased ratio is reached (between 0 and 1, default is .7 )
*  completeFunction: myFunction // callback function when complete ratio is reached
* } );
*
*
*
* $('#image').eraser('revert'); // Activates revert mode
*
* PLEASE NOTE THAT THE REVERT MODE WON'T BE ACCESSIBLE WITH FOREIGN DOMAIN
* IMAGES FOR SECURITY REASONS. YOU CAN NOT GO "canvas.toDataURL()" IF IMAGES
* ARE NOT ON THE SAME DOMAIN.
*
*
* $('#image').eraser('eraser'); // Goes back to normal mode
*
*
* $('#image').eraser( 'clear' ); // erases all canvas content
*
* $('#image').eraser( 'reset' ); // revert back to original content
*
* $('#image').eraser( 'size', 80 ); // change the eraser size
*
*
* https://github.com/boblemarin/jQuery.eraser
* http://minimal.be/lab/jQuery.eraser/
*
* Copyright (c) 2010 boblemarin emeric@minimal.be http://www.minimal.be
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

(function($){
  var methods = {

    init: function(options) {
      return this.each(function(){
        var $this = $(this),
            data = $this.data('eraser');

        if (!data) {

          var handleImage = function() {
            var $canvas = $('<canvas/>'),
                canvas = $canvas.get(0),
                ctx = canvas.getContext('2d'),

                // calculate scale ratio for high DPI devices
                // http://www.html5rocks.com/en/tutorials/canvas/hidpi/
                devicePixelRatio = window.devicePixelRatio || 1,
                backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio || 1,
                scaleRatio = devicePixelRatio / backingStoreRatio,

                realWidth = $this.width(),
                realHeight = $this.height(),
                width = realWidth * scaleRatio,
                height = realHeight * scaleRatio,
                pos = $this.offset(),
                size = ((options && options.size) ? options.size : 40) * scaleRatio,
                completeRatio = (options && options.completeRatio) ? options.completeRatio : .7,
                completeFunction = (options && options.completeFunction) ? options.completeFunction : null,
                progressFunction = (options && options.progressFunction) ? options.progressFunction : null,
                zIndex = $this.css('z-index') == "auto"?1:$this.css('z-index'),
                parts = [],
                colParts = Math.floor(width / size),
                numParts = colParts * Math.floor(height / size),
                n = numParts,
                that = $this[0],
                preview_image = $this.prev('img').get(0);

            // replace target with canvas
            $this.after($canvas);
            canvas.id = that.id;
            canvas.className = that.className;
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = realWidth.toString() + "px";
            canvas.style.height = realHeight.toString() + "px";
            ctx.drawImage(that, 0, 0, width, height);
            $this.remove();

            // prepare context for drawing operations
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(255,0,0,255)';
            ctx.lineWidth = size;

            ctx.lineCap = 'round';
            // bind events
            $canvas.bind('mousedown.eraser', methods.mouseDown);
            $canvas.bind('touchstart.eraser', methods.touchStart);
            $canvas.bind('touchmove.eraser', methods.touchMove);
            $canvas.bind('touchend.eraser', methods.touchEnd);

            // reset parts
            while(n--) parts.push(1);

            // store values
            data = {
              posX: pos.left,
              posY: pos.top,
              touchDown: false,
              touchID: -999,
              touchX: 0,
              touchY: 0,
              ptouchX: 0,
              ptouchY: 0,
              canvas: $canvas,
              ctx: ctx,
              w: width,
              h: height,
              scaleRatio: scaleRatio,
              orig_image: undefined,
              preview_image: preview_image,
              source: that,
              size: size,
              parts: parts,
              colParts: colParts,
              numParts: numParts,
              ratio: 0,
              complete: false,
              completeRatio: completeRatio,
              completeFunction: completeFunction,
              progressFunction: progressFunction,
              zIndex: zIndex,
              blur: (options && options.blur) ? options.blur : 0
            };
            $canvas.data('eraser', data);

            // listen for resize event to update offset values
            $(window).resize(function() {
              var pos = $canvas.offset();
              data.posX = pos.left;
              data.posY = pos.top;
            });
          }

          if (this.complete && this.naturalWidth > 0) {
            handleImage();
          } else {
            //this.onload = handleImage;
            $this.load(handleImage);
          }
        }
      });
    },

    touchStart: function(event) {
      var $this = $(this),
          data = $this.data('eraser');

      if (!data.touchDown) {
        var t = event.originalEvent.changedTouches[0],
            tx = t.pageX - data.posX,
            ty = t.pageY - data.posY;
        tx *= data.scaleRatio;
        ty *= data.scaleRatio;
        methods.evaluatePoint(data, tx, ty);
        data.touchDown = true;
        data.touchID = t.identifier;
        data.touchX = tx;
        data.touchY = ty;
        event.preventDefault();
      }
    },

    touchMove: function(event) {
      var $this = $(this),
          data = $this.data('eraser');

      if (data.touchDown) {
        var ta = event.originalEvent.changedTouches,
            n = ta.length;
        while (n--) {
          if (ta[n].identifier == data.touchID) {
            var tx = ta[n].pageX - data.posX,
                ty = ta[n].pageY - data.posY;
            tx *= data.scaleRatio;
            ty *= data.scaleRatio;
            methods.evaluatePoint(data, tx, ty);
            data.ctx.beginPath();
            data.ctx.moveTo(data.touchX, data.touchY);

            if (data.blur) {
              data.ctx.shadowBlur = data.blur;
              data.ctx.shadowColor = 'rgb(255, 255, 255)';
            }

            if (data.reverse) {
              data.ctx.shadowBlur = 0;
              data.ctx.shadowColor = 'rgb(255, 255, 255, 0)';
            }


            data.touchX = tx;
            data.touchY = ty;
            data.ctx.lineTo(data.touchX, data.touchY);
            data.ctx.stroke();
            $this.css({"z-index":$this.css('z-index')==data.zIndex?parseInt(data.zIndex)+1:data.zIndex});
            event.preventDefault();
            break;
          }
        }
      }
    },

    touchEnd: function(event) {
      var $this = $(this),
        data = $this.data('eraser');

      if ( data.touchDown ) {
        var ta = event.originalEvent.changedTouches,
          n = ta.length;
        while( n-- ) {
          if ( ta[n].identifier == data.touchID ) {
            data.touchDown = false;
            event.preventDefault();
            break;
          }
        }
      }
    },

    evaluatePoint: function(data, tx, ty) {
      var p = Math.floor(tx/data.size) + Math.floor( ty / data.size ) * data.colParts;

      if ( p >= 0 && p < data.numParts ) {

        // Fixed the progressMethod
        // If we are ERASING, we need to REMOVE the parts
        // else, we add it. Simple as that!
        if (!data.parts[p] && data.reverse) {
          data.parts[p] = 1;
          data.ratio -= data.parts[p];
        } else {
          if (!data.reverse) {
            data.ratio += data.parts[p];
            data.parts[p] = 0;
          }
        }

        if (!data.complete) {
          p = data.ratio/data.numParts;
          if ( p >= data.completeRatio ) {
            data.complete = true;
            if ( data.completeFunction != null ) data.completeFunction();
          } else {
            if ( data.progressFunction != null ) data.progressFunction(p);
          }
        }
      }

    },

    mouseDown: function(event) {
      var $this = $(this),
          data = $this.data('eraser'),
          tx = event.pageX - data.posX,
          ty = event.pageY - data.posY;
      tx *= data.scaleRatio;
      ty *= data.scaleRatio;

      methods.evaluatePoint( data, tx, ty );
      data.touchDown = true;
      data.touchX = tx;
      data.touchY = ty;
      data.ctx.beginPath();

      if (data.blur) {
        data.ctx.shadowBlur = data.blur;
        data.ctx.shadowColor = 'rgb(255, 255, 255)';
      }
      if (data.reverse) {
        data.ctx.shadowBlur = 0;
        data.ctx.shadowColor = 'rgb(255, 255, 255, 0)';
      }

      data.ctx.moveTo(data.touchX-1, data.touchY);
      data.ctx.lineTo(data.touchX, data.touchY);
      data.ctx.stroke();
      $this.bind('mousemove.eraser', methods.mouseMove);
      $(document).bind('mouseup.eraser', data, methods.mouseUp);
      event.preventDefault();
    },

    mouseMove: function(event) {
      var $this = $(this),
          data = $this.data('eraser'),
          tx = event.pageX - data.posX,
          ty = event.pageY - data.posY;
      tx *= data.scaleRatio;
      ty *= data.scaleRatio;

      methods.evaluatePoint( data, tx, ty );
      data.ctx.beginPath();
      data.ctx.moveTo( data.touchX, data.touchY );
      data.touchX = tx;
      data.touchY = ty;

      if (data.blur) {
        data.ctx.shadowBlur = data.blur;
        data.ctx.shadowColor = 'rgb(255, 255, 255)';
      }
      if (data.reverse) {
        data.ctx.shadowBlur = 0;
        data.ctx.shadowColor = 'rgb(255, 255, 255, 0)';
      }

      data.ctx.lineTo( data.touchX, data.touchY );
      data.ctx.stroke();
      $this.css({"z-index":$this.css('z-index')==data.zIndex?parseInt(data.zIndex)+1:data.zIndex});
      event.preventDefault();
    },

    mouseUp: function(event) {
      var data = event.data,
          $this = data.canvas;

      data.touchDown = false;
      $this.unbind('mousemove.eraser');
      $(document).unbind('mouseup.eraser');
      event.preventDefault();
    },

    clear: function() {
      var $this = $(this),
          data = $this.data('eraser');

      if (data) {


        // Assumptions were made in the plugin
        // The easy way of dealing with it is to
        // reset the stage before doing those actions.
        if (data.reverse && data.orig_image) {
          data.preview_image.src = data.orig_image;
          $this.eraser('eraser', function() {
            $this.eraser('clear');
          });

          return this;
        }


        data.ctx.clearRect(0, 0, data.w, data.h);
        var n = data.numParts;
        while(n--) data.parts[n] = 0;
        data.ratio = data.numParts;
        data.complete = true;
        if (data.completeFunction != null) data.completeFunction();
      }
    },

    size: function(value) {
      var $this = $(this),
          data = $this.data('eraser');

      if (data && value) {
        data.size = value;
        data.ctx.lineWidth = value;
      }
    },
    blur: function(value) {
      var $this = $(this),
          data = $this.data('eraser');

      if (data && value) {
        data.blur = value;
        // data.ctx.lineWidth = value;
      }
    },

    /**
    * Eraser whatever you draw on the canvas.
    * This is tricky, so let me explain.
    * The plugin is an ERASER, but uses the DRAW function.
    * Here, we're talking about removing whatever drawing you did,
    * which just looks like painting it back.
    * @return {thisArg}
    */
    revert: function(cb)
    {

      var $this = $(this),
        data = $this.data('eraser');

      // Don't do this twice
      if (data.reverse) {
        return this;
      }
      data.reverse = true;

      // The image as erased (the thing you want to revert...).
      // This saves your ACTUAL drawings.
      console.log(data);
      console.log(data.canvas.get(0));
      var drawn_image = data.canvas.get(0).toDataURL();

      // Source image, the one the canvas replaces (front layer).
      var source = data.source;

      // The image you reveal when you "draw" on the canvas
      // Should become the background layer.
      var img = data.preview_image;
      var background_layer_img = new Image();

      // Keep copy, we'll talk about this later
      data.orig_image = img.src;

      // The source image should now be added as
      // a background to the current canvas
      background_layer_img.src = data.orig_image;

      // Switch the source image to the front image
      // That way, you are reverting the drawing by setting
      // the front layer as a background layer
      img.src = source.src;

      // Get current composition
      var dataUrl = data.canvas.get(0).toDataURL();


      var preload_img = new Image();
      preload_img.onload = function()
      {
        // Prevent the blur when image changes
        if (data.blur) {
          data.ctx.shadowBlur = 0;
          data.ctx.shadowColor = 'rgb(255, 255, 255)';
        }

        if (data.reverse) {
          data.ctx.shadowBlur = 0;
          data.ctx.shadowColor = 'rgb(255, 255, 255, 0)';
        }

        data.ctx.globalCompositeOperation = 'source-over';
        data.ctx.drawImage(background_layer_img, 0, 0, data.w, data.h);
        data.ctx.drawImage(preload_img, 0, 0, data.w, data.h);
        data.ctx.globalCompositeOperation = 'destination-out';

        if (typeof cb == 'function') {
          cb();
        }
      }
      preload_img.src = dataUrl;

      return this;

    },
    /**
    *
    */
    eraser: function(cb) {
      var $this = $(this),
        data = $this.data('eraser');

      // Don't do this twice
      if (!data.reverse || !data.orig_image) {
        return false;
      }
      data.reverse = false;

      // The image as erased (the thing you want to revert...).
      var drawn_image = data.canvas.get(0).toDataURL();

      // Source image, the one we'll add right before.
      var source = data.source;

      var img = data.preview_image;
      var old_img = new Image();


      // Get current composition
      var dataUrl = data.canvas.get(0).toDataURL();

      var preload_img = new Image();
      preload_img.onload = function()
      {
        data.ctx.globalCompositeOperation = 'source-over';
        data.ctx.drawImage(source, 0, 0, data.w, data.h);
        data.ctx.drawImage(preload_img, 0, 0, data.w, data.h);
        data.ctx.globalCompositeOperation = 'destination-out';

        // Switch the source image to the front image
        // That way, you are reverting the drawing.
        img.src = data.orig_image;

        if (typeof cb == 'function') {
          cb();
        }
      }
      preload_img.src = dataUrl;
    },
    reset: function() {
      var $this = $(this),
          data = $this.data('eraser');

      if (data) {
        // Assumptions were made in the plugin
        // The easy way of dealing with it is to
        // reset the stage before doing those actions.
        if (data.reverse && data.orig_image) {
          data.preview_image.src = data.orig_image;
          $this.eraser('eraser', function() {
            $this.eraser('reset');
          });

          return this;
        }
        data.ctx.globalCompositeOperation = 'source-over';
        data.ctx.drawImage( data.source, 0, 0, data.w, data.h);
        data.ctx.globalCompositeOperation = 'destination-out';
        var n = data.numParts;
        while (n--) data.parts[n] = 1;
        data.ratio = 0;
        data.complete = false;
        data.touchDown = false;
      }
    },

    progress: function() {
      var $this = $(this),
          data = $this.data('eraser');

      if (data) {
        return data.ratio/data.numParts;
      }
      return 0;
    }

  };

  $.fn.eraser = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not yet exist on jQuery.eraser');
    }
  };
})(jQuery);
