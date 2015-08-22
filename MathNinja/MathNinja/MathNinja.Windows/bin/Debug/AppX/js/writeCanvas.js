(function () {
    "use strict";

    var inkCanvas;
    var inkContext;

    var inkManager = new Windows.UI.Input.Inking.InkManager();


    var pointerId = -1;
    var pointerDeviceType = null;

    var strokeColor;
    var strokeWidth;


    function get(elementId) {
        return document.getElementById(elementId);
    }

    function initialize() {
        // Set up the UI.
        inkCanvas = get("inkCanvas");
        inkContext = inkCanvas.getContext("2d");

        inkContext.lineCap = "round";
        inkContext.lineKJoin = "round";

        inkCanvas.width = window.innerWidth - 6;
        inkCanvas.height = window.innerHeight * 0.6;

        drawStrokes();

        inkCanvas.addEventListener("pointerdown", onPointerDown, false);
        inkCanvas.addEventListener("pointermove", onPointerMove, false);
        inkCanvas.addEventListener("pointerup", onPointerUp, false);

        get("draw").addEventListener("click", drawStrokes, false);
        get("erase").addEventListener("click", eraseStrokes, false);
    }
    document.addEventListener("DOMContentLoaded", initialize, false);

    function getPointerDeviceType(pId) {
        var pointerDeviceType;
        var pointerPoint = Windows.UI.Input.PointerPoint.getCurrentPoint(pId);
        switch (pointerPoint.pointerDevice.pointerDeviceType) {
            case Windows.Devices.Input.PointerDeviceType.touch:
                pointerDeviceType = "Touch";
                break;

            case Windows.Devices.Input.PointerDeviceType.pen:
                pointerDeviceType = "Pen";
                break;

            case Windows.Devices.Input.PointerDeviceType.mouse:
                pointerDeviceType = "Mouse";
                break;
            default:
                pointerDeviceType = "Undefined";
        }

        return pointerDeviceType;
    }

    // Occurs when the pointer (touch, pen, mouse) is detected by the canvas.
    // Each stroke begins with onPointerDown.
    function onPointerDown(evt) {
        // Get the device type for the pointer input.
        pointerDeviceType = getPointerDeviceType(evt.pointerId);

        // Process pen and mouse (with left button) only. Reserve touch for manipulations.
        if ((pointerDeviceType === "Pen") || ((pointerDeviceType === "Mouse") && (evt.button === 0))) {

            // Process one pointer at a time.
            if (pointerId === -1) {
                var current = evt.currentPoint;

                // Start drawing the stroke.
                inkContext.beginPath();
                inkContext.lineWidth = strokeWidth;
                inkContext.strokeStyle = strokeColor;

                inkContext.moveTo(current.position.x, current.position.y);

                // Add current pointer to the ink manager (begin stroke).
                inkManager.processPointerDown(current);

                // The pointer id is used to restrict input processing to the current stroke.
                pointerId = evt.pointerId;
            }
        }
        else {
            // Process touch input.
        }
    }

    // Mouse: Occurs when the pointer moves.
    // Pen/Touch: Occurs at a steady rate (approx. 100 messages/second) whether the pointer moves or not.
    function onPointerMove(evt) {
        // Process pen and mouse (with left button) only. Reserve touch for manipulations.
        if ((pointerDeviceType === "Pen") || ((pointerDeviceType === "Mouse") && (evt.button === -1))) {
            // The pointer Id is used to restrict input processing to the current stroke.
            // pointerId is updated in onPointerDown().
            if (evt.pointerId === pointerId) {
                var current = evt.currentPoint;

                // Draw stroke in real time.
                inkContext.lineTo(current.rawPosition.x, current.rawPosition.y);
                inkContext.stroke();

                // Add current pointer to the ink manager (update stroke).
                inkManager.processPointerUpdate(current);
            }
        }
        else {
            // Process touch input.
        }
    }

    // Occurs when the pointer (touch, pen, mouse) is lifted from the canvas.
    // Each stroke ends with onPointerUp.
    function onPointerUp(evt) {
        // Process pen and mouse (with left button) only. Reserve touch for manipulations.
        if ((pointerDeviceType === "Pen") || ((pointerDeviceType === "Mouse") && (evt.button === 0))) {
            if (evt.pointerId === pointerId) {
                // Add current pointer to the ink manager (end stroke).
                inkManager.processPointerUp(evt.currentPoint);

                // End live drawing.
                inkContext.closePath();

                // Render strokes using bezier curves.
                renderAllStrokes();

                // Reset pointer Id.
                pointerId = -1;
            }
        }
        else {
            // Process touch input.
        }
    }

    // Render all strokes using bezier curves instead of line segments.
    function renderAllStrokes() {

        // Clear the drawing surface of existing strokes.
        inkContext.clearRect(0, 0, inkCanvas.width, inkCanvas.height);

        // Iterate through each stroke.
        inkManager.getStrokes().forEach(
            function (stroke) {
                inkContext.beginPath();
                if (stroke.selected) {
                    inkContext.lineWidth = stroke.drawingAttributes.size.width * 3;
                    inkContext.strokeStyle = "green";
                } else {
                    inkContext.lineWidth = stroke.drawingAttributes.size.width * 3;
                    inkContext.strokeStyle = "black";
                }

                // Enumerate through each line segment of the stroke.
                var first = true;

                stroke.getRenderingSegments().forEach(
                    function (segment) {
                        // Move to the starting screen location of the stroke.
                        if (first) {
                            inkContext.moveTo(segment.position.x, segment.position.y);
                            first = false;
                        }
                            // Calculate the bezier curve for the segment.
                        else {
                            inkContext.bezierCurveTo(segment.bezierControlPoint1.x,
                                                     segment.bezierControlPoint1.y,
                                                     segment.bezierControlPoint2.x,
                                                     segment.bezierControlPoint2.y,
                                                     segment.position.x, segment.position.y);
                        }
                    }
                );

                // Draw the stroke.
                inkContext.stroke();
                inkContext.closePath();
            }
        );
    }

    // Set up draw mode.
    function drawStrokes() {
        inkManager.mode = Windows.UI.Input.Inking.InkManipulationMode.inking;
        strokeColor = "black";
        strokeWidth = 3;
    }

    // Set up erase mode.
    function eraseStrokes() {
        inkManager.mode = Windows.UI.Input.Inking.InkManipulationMode.erasing;
        strokeColor = "gold";
        strokeWidth = 3;
    }
})();

