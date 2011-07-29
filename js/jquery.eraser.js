/*
* jQuery.eraser
* https://github.com/boblemarin/jQuery.eraser
* http://minimal.be/lab/jQuery.eraser/ (demo)
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

/*
TODO:
- listen to window resize events and update offset
*/

(function( $ ){
	var methods = {
		init : function( options ) {
			return this.each(function(){
				var $this = $(this),
					data = $this.data('eraser');

					if ( !data ) {
					var width = $this.width(),
						height = $this.height(),
						pos = $this.offset(),
						$canvas = $("<canvas/>"),
						canvas = $canvas.get(0),
						ctx = canvas.getContext("2d");
						
					// replace target with canvas
					$this.after( $canvas );
					canvas.id = this.id;
					canvas.className = this.className;
					canvas.width = width;
					canvas.height = height;
					ctx.drawImage( this, 0, 0 );
					$this.remove();
					// prepare context for drawing operations
					ctx.globalCompositeOperation = "destination-out";
					ctx.strokeStyle = 'rgba(255,0,0,255)';
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
						h:height,
						source: this
					});
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
		},
		
		clear: function() {
			var $this = $(this),
				data = $this.data('eraser');
			if ( data )
			{
				data.ctx.clearRect( 0, 0, data.w, data.h );
			}
		},
		
		reset: function() {
			var $this = $(this),
				data = $this.data('eraser');
			if ( data )
			{
				data.ctx.globalCompositeOperation = "source-over";
				data.ctx.drawImage( data.source, 0, 0 );
				data.ctx.globalCompositeOperation = "destination-out";
			}
			
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