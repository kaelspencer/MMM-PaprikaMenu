var NodeHelper = require("node_helper");
var PaprikaApi = require("paprika-api");
var moment = require("moment");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node_helper for module [" + this.name + "]");
        this.paprikaApi = null;
    },

    socketNotificationReceived: function(notification, payload){
        if (notification === "PAPRIKA_MENU_GET") {
            if (payload.email == null || payload.email == "") {
                console.log( "[MMM-PaprikaMenu] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** No email set." );
            } else if (payload.password == null || payload.password == "") {
                console.log( "[MMM-PaprikaMenu] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** No password set." );
            } else {
                if (this.paprikaApi == null) {
                    this.paprikaApi = new PaprikaApi.PaprikaApi(payload.email, payload.password);
                }

                var self = this;

                this.paprikaApi.meals().then((meals) => {
                    filtered = self.filterMealsByDate(meals, payload.weekStartsOnSunday);
                    resp = {
                        instanceId: payload.instanceId,
                        meals: filtered
                    };
                    self.sendSocketNotification("PAPRIKA_MENU_DATA", resp);
                });
            }
        }
    },

    filterMealsByDate: function(raw, weekStartsOnSunday) {
        // raw is array of:
        // { uid: '8d95f33c-2fb9-4c1a-814f-b64fe9e50bca',
        //   type_uid: null,
        //   order_flag: 45,
        //   recipe_uid: null,
        //   date: '2018-12-16 00:00:00',
        //   type: 2,
        //   name: 'Breakfast quesadilla' }

        meals = [];
        var startOfWeek = this.getFirstDayOfWeek(weekStartsOnSunday);
        var nextWeek = startOfWeek.clone().add(7, 'days');

        console.log('Week starts: ' + startOfWeek.format('YYYY-MM-DD') + ', next week starts: ' + nextWeek.format('YYYY-MM-DD'));

        raw.forEach(function(item) {
            var itemDate = moment(item.date);
            if (!(itemDate.isBefore(startOfWeek) || itemDate.isAfter(nextWeek))) {
                meals.push(item);
            }
        });

        return meals;
    },

    getFirstDayOfWeek: function(weekStartsOnSunday) {
        var today = moment();
        var firstDayOfWeek = moment();

        // moment.isoWeekday() returns 1 for Monday, 7 for Sunday.
        if (weekStartsOnSunday) {
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
});
