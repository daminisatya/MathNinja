// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };
    function initialize() {
        WinJS.UI.processAll();
    }

    document.addEventListener("DOMContentLoaded", initialize(), false);
    var array = [
       { type: "item", picture: "../images/1.png" },
       { type: "item", picture: "../images/2.png" },
       { type: "item", picture: "../images/3.jpg" },
       { type: "item", picture: "../images/4.png" },
       { type: "item", picture: "../images/5.png" }
    ];
    var bindingList = new WinJS.Binding.List(array);

    WinJS.Namespace.define("DefaultData", {
        bindingList: bindingList,
        array: array
    });

    var e = DefaultData.bindingList.dataSource;
    var page = WinJS.UI.Pages.define("../writeModule.html", {
        processed: function (element, options) {
        }
    });
    app.start();
})();