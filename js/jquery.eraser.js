/*
jQuery.eraser
by boblemarin

https://github.com/boblemarin/jQuery.eraser
http://minimal.be/lab/jQuery.eraser/ (demo)

TODO:
	- add support for firefox ?
	- fix the load event problem for all platforms :/
	- listen to window resize to update target's offset
*/

(function( $ ){
	var methods = {
		init : function( options ) {
			return this.each(function(){
				var $this = $(this),
					img = this,
					data = $this.data('eraser'),
					p = navigator.platform,
					ua = navigator.userAgent.toLowerCase();

				function initImage() {
					if ( !data ) {
						var width = $this.width(),
							height = $this.height(),
							pos = $this.offset(),
							$canvas = $("<canvas/>"),
							canvas = $canvas.get(0),
							ctx = canvas.getContext("2d");
							
						// replace target with canvas
						$this.after( $canvas );
						canvas.id = img.id;
						canvas.className = img.className;
						canvas.width = width;
						canvas.height = height;
						ctx.drawImage( img, 0, 0 );
						$this.remove();
						/*
						ctx.globalCompositeOperation = "source-over";
						ctx.fillStyle = 'rgba(0,0,0,255)';
						ctx.fillRect( 0, 0, width, height );
						*/
						// prepare context for drawing operations
						ctx.globalCompositeOperation = "source-out";
						ctx.strokeStyle = 'rgba(255,255,255,0)';
						ctx.lineWidth = 40;
						ctx.lineCap = "round";
						// bind events
						$canvas.bind('mousedown.eraser', methods.mouseDown);
						$canvas.bind('touchstart.eraser', methods.touchStart);
						$canvas.bind('touchmove.eraser', methods.touchMove);
						$canvas.bind('touchend.eraser', methods.touchEnd);
						// store values
						$canvas.data('eraser', {
							posX:pos.left,
							posY:pos.top,
							touchDown: false,
							touchID:-999,
							touchX: 0,
							touchY: 0,
							ptouchX: 0,
							ptouchY: 0,
							canvas: $canvas,
							ctx: ctx,
							w:width,
							h:height
						});
					}
				}
				
				if ( p == "iPad" || p == "iPod" || p == "iPhone" || ua.indexOf("android") > -1 || ua.indexOf("firefox") > -1 ) 
				{
					initImage();
				}
				else
				{
					$this.load( initImage );
				}
			});
		},
		touchStart: function( event ) {
			var $this = $(this),
				data = $this.data('eraser');
				
			if ( !data.touchDown ) {
				var t = event.originalEvent.changedTouches[0];
				data.touchDown = true;
				data.touchID = t.identifier;
				data.touchX = t.pageX - data.posX;
				data.touchY = t.pageY - data.posY;
				event.preventDefault();
			}
		},
		touchMove: function( event ) {
			var $this = $(this),
				data = $this.data('eraser');
				
			if ( data.touchDown ) {
				var ta = event.originalEvent.changedTouches,
					n = ta.length;
				while( n-- ) 
					if ( ta[n].identifier == data.touchID ) {
						data.ctx.beginPath();
						data.ctx.moveTo( data.touchX, data.touchY );
						data.touchX = ta[n].pageX - data.posX;
						data.touchY = ta[n].pageY - data.posY;
						data.ctx.lineTo( data.touchX, data.touchY );
						data.ctx.stroke();
						event.preventDefault();
						break;
					}
			}
		},
		touchEnd: function( event ) {
			var $this = $(this),
				data = $this.data('eraser');
				
			if ( data.touchDown ) {
				var ta = event.originalEvent.changedTouches,
					n = ta.length;
				while( n-- )
					if ( ta[n].identifier == data.touchID ) {
						data.touchDown = false;
						event.preventDefault();
						break;
					}
			}
		},
		
		
		mouseDown: function( event ) {
			var $this = $(this),
				data = $this.data('eraser');
				
			data.touchDown = true;
			data.touchX = event.pageX - data.posX;
			data.touchY = event.pageY - data.posY;
			data.ctx.beginPath();
			data.ctx.moveTo( data.touchX-1, data.touchY );
			data.ctx.lineTo( data.touchX, data.touchY );
			data.ctx.stroke();
			$this.bind('mousemove.eraser', methods.mouseMove);
			$this.bind('mouseup.eraser', methods.mouseUp);
			event.preventDefault();
		},
		
		mouseMove: function( event ) {
			var $this = $(this),
				data = $this.data('eraser');
				
			data.ctx.beginPath();
			data.ctx.moveTo( data.touchX, data.touchY );
			data.touchX = event.pageX - data.posX;
			data.touchY = event.pageY - data.posY;
			data.ctx.lineTo( data.touchX, data.touchY );
			data.ctx.stroke();
			event.preventDefault();
		},
		
		mouseUp: function( event ) {
			var $this = $(this),
				data = $this.data('eraser');
				
			data.touchDown = false;
			$this.unbind('mousemove.eraser');
			$this.unbind('mouseup.eraser');
			event.preventDefault();
		}
	};

	$.fn.eraser = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.eraser' );
		}
	};
})( jQuery );