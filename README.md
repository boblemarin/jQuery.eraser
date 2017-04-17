# jQuery.eraser v0.5.2

a jQuery plugin that makes an image erasable (with mouse or touch movements)

This plugin replaces the targeted image by an interactive canvas that can be erased using touch or mouse inputs. You can specify a callback for completion and set the brush size.

Please note that I don't claim that the completion detection process is ultimately accurate. In fact you should rather use a completeRatio around 0.8 if you want a near-complete erase process.

# What's new in 0.5.2

Added the 'enable/disable/enabled' methods (see details in the Usage section)


# What's new in 0.5.1

Added a 'progress' method (see details in the Usage section)


### What was new in 0.5.0

Eraser now takes care of checking if the target image is already loaded. If not, it registers a callback on the load event and waits for the bitmap data to be available.

You don't have to worry anymore about anything but erasing.


# Usage :


To transform an image or canvas into an erasable canvas, just use this syntax :

	$('#yourImage').eraser();


To specify a brush size, add some options (default value is 40) :

	$('#yourImage').eraser( { size: 30 } );
	// and you can also change the size later :
	// $('#yourImage').eraser( 'size', 30 } );


You can reset the canvas (back to the original image) with this code :

	$('#yourImage').eraser('reset');


And you can erase all the canvas' content by calling :

	$('#yourImage').eraser('clear');


You can change whether erasing is enabled or disabled by calling the enable or disable methods :

	$('#yourImage').eraser('enable');
	$('#yourImage').eraser('disable');

And you can check whether erasing is enabled or disabled by calling :

	$('#yourImage').eraser('enabled');

To get a callback when 50% of the image has been erased, use the following options :

	$('#yourImage').eraser( {
		completeRatio: .5,
		completeFunction: showResetButton
	});

If you need to manually query the progress of the user, use the progress method :

	var progress = $('#yourImage').eraser('progress'); // returns a value between 0 and 1

There is also a `progressFunction` option where you can provide a function that will be called each time the user erases a new area. It receives as argument the normalized progress value (0.0 to 1.0).

	$('#yourImage').eraser( {
		progressFunction: function(p) {
			console.log(Math.round(p * 100) + '%');
		}
	});


# URLs :

	* https://github.com/boblemarin/jQuery.eraser
	* http://minimal.be/lab/jQuery.eraser/


Created by @boblemarin
