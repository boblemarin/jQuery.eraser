#jQuery.eraser v0.2
jQuery plugin that makes an image erasable (with mouse or touch movements)

this plugin replaces the targeted image by an interactive canvas that can be erased
using touch ou mouse moves.


#Check this :

This plug-in works with image or canvas elements.
The images must be fully loaded before calling eraser().


My conclusions are that the following code works in :

#Safari, Chrome and Firefox on OS X and Windows
#Mobile Safari on iOS
#Android stock browser
#BlackBerry Tablet Browser


	function init ( event ) {
		$("#image").eraser();
	}
	addEventListener( "load", init, false );



#Usage :


To transform an image or canvas into an erasable canvas, just use this syntax :

	$('#yourImage').eraser();

	
To specify a brush size, add some options (default value is 40) :

	$('#yourImage').eraser( { size: 30 } );


You can reset the canvas (back to the original image) with this code :

	$('#yourImage').eraser('reset');


And you can erase all the canvas' content by calling :

	$('#yourImage').eraser('clear');
	
	
To get a callback when 50% of the image has been erased, use this :
	
	$('#yourImage').eraser( {
		completeRatio: .5,
		completeFunction: showResetButton
	});


	
#URLs :

	* https://github.com/boblemarin/jQuery.eraser
	* http://minimal.be/lab/jQuery.eraser/


by @boblemarin -> emeric@minimal.be