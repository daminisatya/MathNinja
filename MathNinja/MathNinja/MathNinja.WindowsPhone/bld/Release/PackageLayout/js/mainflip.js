(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("../page.html", {
        processed: function (element, options) {
            // WinJS.UI.processAll() is automatically called by the Pages infrastructure by the time this
            // function gets called, and it has processed the div with data-win-control="WinJS.UI.FlipView"
        }
    });
})();