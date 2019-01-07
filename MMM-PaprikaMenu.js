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
        weekStartsOnSunday: false,
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

            this.formattedMenuData = this.filterMenu(payload.meals);

            console.log(this.formattedMenuData);
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

        menuItems = [];
        var startOfWeek = this.getFirstDayOfWeek();
        var nextWeek = startOfWeek.clone().add(7, 'days');

        console.log('Week starts: ' + startOfWeek.format('YYYY-MM-DD') + ', next week starts: ' + nextWeek.format('YYYY-MM-DD'));

        raw.forEach(function(item) {
            var itemDate = moment(item.date);
            if (!(itemDate.isBefore(startOfWeek) || itemDate.isAfter(nextWeek))) {
                menuItems.push(item);
            }
        });

        return { items: menuItems };
    },

    getFirstDayOfWeek: function() {
        var today = moment();
        var firstDayOfWeek = moment();

        // moment.isoWeekday() returns 1 for Monday, 7 for Sunday.
        if (this.config.weekStartsOnSunday) {
            var weekday = today.isoWeekday();

            if (weekday == 7) {
                firstDayOfWeek = today;
            } else {
                firstDayOfWeek = today.subtract(weekday, 'days');
            }
        } else {
            var weekStartedDaysAgo = today.isoWeekday() - 1;
            firstDayOfWeek = today.subtract(weekStartedDaysAgo, 'days');
        }

        return firstDayOfWeek.startOf('day');
    },
})
