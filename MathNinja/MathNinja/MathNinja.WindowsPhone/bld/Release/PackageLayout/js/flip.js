(function () {
    "use strict";
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
})();
