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
        showPictures: true,
        dateFormat: "dddd",
        updateInterval: 60,
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
        setInterval(function() {
            self.getData();
        }, this.config.updateInterval * 60 * 1000); // Convert minutes to milliseconds

        this.getData();
    },

    getData: function() {
        this.sendSocketNotification("PAPRIKA_MENU_GET", {
            instanceId: this.identifier,
            email: this.config.email,
            password: this.config.password,
            weekStartsOnSunday: this.config.weekStartsOnSunday,
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification == "PAPRIKA_MENU_DATA" && payload.instanceId == this.identifier) {
            this.dataRefreshTimeStamp = moment().format("x");

            this.formattedMenuData = { meals: this.formatMeals(payload.meals) };

            console.log(this.formattedMenuData);
            this.updateDom(this.config.updateFadeSpeed);
        }
    },

    formatMeals: function(meals) {
        // Sort by date, ascending.
        meals.sort(function(a, b) { return (moment(a.date).isBefore(b.date) ? -1 : 1); });
        today = moment().startOf('day');

        var formatted = [];
        for (var m of meals) {
            formatted.push({
                name: m.name,
                date: moment(m.date).format(this.config.dateFormat),
                photo_url: m.photo_url,
                is_today: today.isSame(m.date)
            });
        }

        return formatted;
    },
})
