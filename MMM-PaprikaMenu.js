Module.register("MMM-PaprikaMenu", {
    /*
    This module uses the Nunjucks templating system introduced in
    version 2.2.0 of MagicMirror.  If you're seeing nothing on your
    display where you expect this module to appear, make sure your
    MagicMirror version is at least 2.2.0.
    */
    requiresVersion: "2.2.0",

    defaults: {
        email: "",
        passwoord: "",
        updateInterval: 30,
        updateFadeSpeed: 500
    },

    getScripts: function() {
        return ["moment.js"];
    },

    getStyles: function () {
       return ["MMM-PaprikaMenu.css"];
    },

    getTemplate: function () {
        return "MMM-PaprikaMenu.njk";
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
            menu: this.formattedMenuData,
            identifier: this.identifier,
            timeStamp: this.dataRefreshTimeStamp
        };
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        this.formattedMenuData = null;

        var self = this;
        // setInterval(function() {
        //     self.getData();
        // }, this.config.updateInterval * 60 * 1000); // Convert minutes to milliseconds

        this.getData();
    },

    getData: function() {
        this.sendSocketNotification("PAPRIKA_MENU_GET", {
            email: this.config.email,
            password: this.config.password,
            instanceId: this.identifier
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification == "PAPRIKA_MENU_DATA" && payload.instanceId == this.identifier) {
            this.dataRefreshTimeStamp = moment().format("x");
            console.log(payload);

            this.formattedMenuData = this.filterMenu(payload.meals);

            // this.formattedMenuData = {
            //     items: [
            //         { title: "Fish tacos" },
            //         { title: "Chili & cornbread" }
            //     ]
            // };

            this.updateDom(this.config.updateFadeSpeed);
        }
    },

    filterMenu: function(raw) {
        // raw is array of:
        // { uid: '8d95f33c-2fb9-4c1a-814f-b64fe9e50bca',
        //   type_uid: null,
        //   order_flag: 45,
        //   recipe_uid: null,
        //   date: '2018-12-16 00:00:00',
        //   type: 2,
        //   name: 'Breakfast quesadilla' }

        // menuItems = [];

        // raw.forEach(function(item) {
        //     menuItems.push({

        //     });
        // });

        return { items: raw };
    }
})
