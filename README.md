# CoverFlow Widget

## Quick start

    include coverFlow.css
        <link rel="stylesheet" href="coverFlow.css">

    include jQuery
        <script src="jquery.min.js"></script>

    include coverFlow.min.js
        <script src="coverFlow.min.js"></script>

    create empty div element and in your code, write
        $(element).coverFlow({ data: dataArray });

where dataArray is an array filled with image URLs


## Features

### Options
    available options
        $(element).coverFlow({
            data: dataArray,                // URLs array
            reflection: true/false          // switch on/off reflection
            infinite: true/false            // not ready in 0.1.1
            perspective: integer,           // sets perspective, not ready in 0.1.1
            buttons: true/false             // shows buttons for sliding back & forward
        });

### UI
    supports
        - wheel scrolling
        - dragging (not ready in 0.1.1)
        - touch scrolling (not ready in 0.1.1)
        - infinite loop (not ready in 0.1.1)


## Version

### changes
        0.1.1 - option for switching reflection on/off + buttons styling
        0.1.0 - initial version


## Author

Dusan Bartos http://doodeec.com
doodeec@gmail.com


## Licence

Released under MIT licence