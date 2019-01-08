var NodeHelper = require("node_helper");
var PaprikaApi = require("paprika-api");
var moment = require("moment");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node_helper for module [" + this.name + "]");
        this.paprikaApi = null;
        this.outstandingRequest = false;
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

                if (this.outstandingRequest == true) {
                    console.log('MMM-PaprikaMenu: Outstanding request, not trying again.');
                    return;
                }

                var self = this;

                this.getMeals(payload.weekStartsOnSunday)
                .then((meals) => {
                    resp = {
                        instanceId: payload.instanceId,
                        meals: meals
                    };
                    self.sendSocketNotification("PAPRIKA_MENU_DATA", resp);
                })
                .catch((error) => {
                    console.log('MMM-PaprikaMenu: Caught an exception during sync.');
                    console.log(error);
                })
                .then(() => {
                    self.outstandingRequest = false;
                });
            }
        }
    },

    getMeals: function(weekStartsOnSunday) {
        var self = this;

        // Get the full list of meals from Paprika.
        return this.paprikaApi.meals()
        .then((meals) => {
            // Filter the whole list down to just our current weak timespan.
            return self.filterMealsByDate(meals, weekStartsOnSunday);
        })
        .then((filteredMeals) => {
            // We have a filtered set of meals. Now, query Paprika for recipe information as appropriate.
            // Some meal entries may not have an associated recipe. For example, you entered "Leftovers" on one day.
            var recipePromises = [];

            filteredMeals.forEach(function(meal) {
                if (meal.recipe_uid == null) {
                    // This is a hand-edited meal. No recipe to fetch.
                } else {
                    // Fetch the recipe from Paprika.
                }
            });
            return filteredMeals;
        });
    },

    filterMealsByDate: function(raw, weekStartsOnSunday) {
        // raw is array of:
        // { uid: 'd95f33c-2fb9-4c1a-814f-b64fe9e50bca',
        //   type_uid: null,
        //   order_flag: 45,
        //   recipe_uid: 'e5293519-8492-4643-b741-3d46f0a9714b',
        //   date: '2018-12-16 00:00:00',
        //   type: 2,
        //   name: 'Breakfast quesadilla' }

        meals = [];
        var startOfWeek = this.getFirstDayOfWeek(weekStartsOnSunday);
        var nextWeek = startOfWeek.clone().add(7, 'days');

        console.log('MMM-PaprikaMenu: Week starts: ' + startOfWeek.format('YYYY-MM-DD') + ', next week starts: ' + nextWeek.format('YYYY-MM-DD'));

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

    constructMealObject: function(mealFromApi) {
        return {
            // Fields from the raw Paprika Meal API
            meal_uid: mealFromApi.uid,
            type_uid: mealFromApi.type_uid,
            order_flag: mealFromApi.order_flag,
            recipe_uid: mealFromApi.recipe_uid,
            date: mealFromApi.date,
            type: mealFromApi.type,
            name: mealFromApi.name,
            // Fields we care about from the Recipe API.
            image_url: null,
        }
    };
});
