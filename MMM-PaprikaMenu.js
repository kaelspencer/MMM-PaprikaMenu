Module.register("MMM-PaprikaMenu", {
    /*
    This module uses the Nunjucks templating system introduced in
    version 2.2.0 of MagicMirror.  If you're seeing nothing on your
    display where you expect this module to appear, make sure your
    MagicMirror version is at least 2.2.0.
    */
    requiresVersion: "2.2.0",

    defaults: {
        user: "",
        pass: "",
        updateInterval: 10
    },

    getScripts: function() {
        return ["moment.js"];
    },

    getStyles: function () {
       return ["MMM-PaprikaMenu.css"];
    },

    /*
    Data object provided to the Nunjucks template. The template does not
    do any data minipulation; the strings provided here are displayed as-is.
    The only logic in the template are conditional blocks that determine if
    a certain section should be displayed, and simple loops for the hourly
    and daily forecast.
    */
    getTemplateData: function () {
        return {
            phrases: {
                loading: this.translate("LOADING")
            },
            loading: this.formattedMenuData == null ? true : false,
            config: this.config,
            forecast: this.formattedMenuData,
            identifier: this.identifier,
            timeStamp: this.dataRefreshTimeStamp
        };
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        this.formattedMenuData = null;

        var self = this;
        setInterval(function() {
            self.getData();
        }, this.config.updateInterval * 1000); //convert to milliseconds

        this.getData();
    },

    getData: function() {
        console.log("MMM-PaprikaMenu: getData, sending notification");
        this.sendSocketNotification("PAPRIKA_MENU_GET", {
            user: this.config.user,
            pass: this.config.pass,
            instanceId: this.identifier
        });
    },

    socketNotificationReceived: function(notification, payload) {
        console.log("MMM-PaprikaMenu: socketNotificationReceived (" + notification + ")");
        if (notification == "PAPRIKA_MENU_DATA" && payload.instanceId == this.identifier) {
            this.dataRefreshTimeStamp = moment().format("x");

            this.updateDom(500);
        }
    },

})
