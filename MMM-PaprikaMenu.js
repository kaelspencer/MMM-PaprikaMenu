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
        password: "",
        weekStartsOnSunday: false,
        priorDayLimit: 7,
        priorEntryLimit: 50,
        fadePriorEntries: true,
        showPictures: true,
        roundPictureCorners: false,
        dateFormat: "dddd",
        breakfastDisplay: "Breakfast",
        lunchDisplay: "Lunch",
        dinnerDisplay: "Dinner",
        snackDisplay: "Snack",
        dateMealSeperator: " - ",
        mealSortOrder: [0, 1, 2, 3],
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

        // Validate mealSortOrder.
        if (!(
            Array.isArray(this.config.mealSortOrder) &&
            this.config.mealSortOrder.length == 4 &&
            this.config.mealSortOrder.includes(0) &&
            this.config.mealSortOrder.includes(1) &&
            this.config.mealSortOrder.includes(2) &&
            this.config.mealSortOrder.includes(3))) {
            Log.error("mealSortOrder should be an array of four elements. 0, 1, 2, 3 should appear exactly once in the desired sort order.");
            return;
        }

        if (this.config.priorDayLimit < 0) {
            this.config.priorDayLimit = 0;
            Log.warn("priorDayLimit should be 0+. Setting to 0.");
        }

        if (this.config.priorEntryLimit < 0) {
            this.config.priorEntryLimit = 0;
            Log.warn("priorEntryLimit should be 0+. Setting to 0.");
        }

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
        // Sort by date, ascending, then by meal type, a user defined order.
        var mealSortOrder = this.config.mealSortOrder;
        meals.sort(function(a, b) {
            if (moment(a.date).isSame(b.date)) {
                // Same date, sort by type.
                return mealSortOrder.indexOf(a.type) - mealSortOrder.indexOf(b.type);
            } else {
                return (moment(a.date).isBefore(b.date) ? -1 : 1);
            }
        });
        today = moment().startOf('day');

        var formatted = [];
        for (var m of meals) {
            formatted.push({
                name: m.name,
                raw_date: m.date,
                date: moment(m.date).format(this.config.dateFormat),
                meal: this.typeToMealDisplay(m.type),
                photo_url: m.photo_url,
                is_today: today.isSame(m.date),
                should_fade: this.config.fadePriorEntries && today.isAfter(m.date)
            });
        }

        filtered = this.filterDaysAndEntries(formatted);
        return filtered;
    },

    filterDaysAndEntries: function(sortedMenu) {
        var reversed = sortedMenu.reverse();
        var filtered = [];
        var today = moment().startOf('day');
        var entriesBeforeTodayCount = 0;

        for (var m of reversed) {
            var days = moment(m.raw_date).diff(today, 'days');

            // If days < 0, this is a previous entry. The config may limit how many of these we show.
            if (days < 0) {
                entriesBeforeTodayCount++;
            }

            // days is the number of days between today and this menu items date; a negative value for past items.
            // Add it to our result set if it is 0+ (today or in the future), and if this.config.priorDayLimit + days is 0+.
            // days >= 0 can just be rolled into the priorDayLimit check.
            // Example: priorDayLimit: 3, menu two days ago -> days: -2, 3 + -2 = 1, add it to the result.
            //
            // Additionally, only show max this.config.priorEntryLimit.
            if (this.config.priorDayLimit + days >= 0 && this.config.priorEntryLimit >= entriesBeforeTodayCount) {
                filtered.push(m);
            }
        }

        return filtered.reverse();
    },

    typeToMealDisplay: function(type) {
        switch (type) {
            case 0:
                return this.config.breakfastDisplay;
            case 1:
                return this.config.lunchDisplay;
            case 2:
                return this.config.dinnerDisplay;
            case 3:
                return this.config.snackDisplay;
            default:
                return "Unknown meal type"
        }
    }
})
