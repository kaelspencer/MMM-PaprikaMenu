var NodeHelper = require("node_helper");
var PaprikaApi = require("paprika-api");
var moment = require("moment");

// Example result from recipe API.
// { rating: 5,
//   photo_hash: 'a0c49a4d8f87f498bc62fb6e7ba1dca502b024feb5130fd1718efed7c5340c39',
//   on_favorites: false,
//   photo: 'a4b27526-fc28-4787-a92c-4f9eba55500e.jpg',
//   uid: '70c2cbb1-b5d4-4733-96e0-d34adb4ee4ab',
//   scale: null,
//   ingredients: '<snip>',
//   is_pinned: null,
//   source: '',
//   total_time: null,
//   hash: 'fae77a1b76cc1595349d043bb6243460c119897277d69de3c09ae892d7e71de5',
//   description: null,
//   source_url: '',
//   difficulty: 'Easy',
//   on_grocery_list: null,
//   in_trash: null,
//   directions: '<snip>',
//   categories:
//    [ '024de9ac-ab33-49e3-848a-5215f58b2c6b',
//      '3cc4d1d7-98d3-4c64-a18f-03db76f242e3' ],
//   photo_url: 'http://uploads.paprikaapp.com.s3.amazonaws.com/197977/a4b27526-fc28-4787-a92c-4f9eba55500e.jpg?Signature=egeTV%2FP2e94R4oGN%2BXbaJkMs9JA%3D&Expires=1547059689&AWSAccessKeyId=AKIAJA4A42FBJBMX5ARA',
//   cook_time: '',
//   name: 'Kael\'s Thai Peanut Sauce & Tofu Marinade',
//   created: '2019-01-06 09:09:39',
//   notes: '<snip>',
//   photo_large: null,
//   image_url: null,
//   prep_time: '',
//   servings: '',
//   nutritional_info: '' }
//
// Example results from meals API:
//
// This is a hand-edited entry that does not correspond to a recipe.
// { uid: 'd95f33c-2fb9-4c1a-814f-b64fe9e50bca',
//   type_uid: null,
//   order_flag: 45,
//   recipe_uid: null,
//   date: '2018-12-16 00:00:00',
//   type: 2,
//   name: 'Breakfast quesadilla' }
//
// This corresponds to a recipe.
// { meal_uid: '6c4fab7a-4868-4a6f-8833-a9b934ccf503',
//   type_uid: null,
//   order_flag: 58,
//   recipe_uid: '70c2cbb1-b5d4-4733-96e0-d34adb4ee4ab',
//   date: '2019-01-08 00:00:00',
//   type: 2,
//   name: null,
//   photo_url: null }

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
        var meals = [];

        // Get the full list of meals from Paprika.
        return this.paprikaApi.meals()
        .then((rawMeals) => {
            // Filter the whole list down to just our current weak timespan.
            return self.filterMealsByDate(rawMeals, weekStartsOnSunday);
        })
        .then((filteredMeals) => {
            // We have a filtered set of meals. Now, query Paprika for recipe information as appropriate.
            // Some meal entries may not have an associated recipe. For example, you entered "Leftovers" on one day.
            var recipeUids = [];

            filteredMeals.forEach(function(rawMeal) {
                var meal = self.constructMealObject(rawMeal);
                meals.push(meal);

                if (meal.recipe_uid != null) {
                    // Need to fetch this recipe from Paprika.
                    recipeUids.push(meal.recipe_uid);
                };
            });

            let uniqueRecipeUids = [...new Set(recipeUids)];
            var recipePromises = [];

            for (const uid of uniqueRecipeUids) {
                recipePromises.push(self.paprikaApi.recipe(uid));
            }

            console.log('MMM-PaprikaMenu: Waiting on ' + uniqueRecipeUids.length + ' Paprika recipe calls.');

            return Promise.all(recipePromises);
        })
        .then(function(recipes) {
            console.log('MMM-PaprikaMenu: All recipe queries returned.');
            for (const recipeResult of recipes) {
                self.findAndUpdateMealObject(meals, recipeResult);
            }

            return meals;
        });
    },

    filterMealsByDate: function(raw, weekStartsOnSunday) {
        meals = [];
        var startOfWeek = this.getFirstDayOfWeek(weekStartsOnSunday);
        var nextWeek = startOfWeek.clone().add(7, 'days');
        var lastDayOfWeek = nextWeek.clone().subtract(1, 'days');

        console.log('MMM-PaprikaMenu: Week starts: ' + startOfWeek.format('YYYY-MM-DD') + ', next week starts: ' + nextWeek.format('YYYY-MM-DD'));

        raw.forEach(function(item) {
            var itemDate = moment(item.date);
            if (!(itemDate.isBefore(startOfWeek) || itemDate.isAfter(lastDayOfWeek))) {
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
            photo_url: null,
        };
    },

    updateMealObjectFromRecipe: function(meal, recipeFromApi) {
        meal.name = recipeFromApi.name;
        meal.photo_url = recipeFromApi.photo_url;
    },

    findAndUpdateMealObject: function(mealList, recipeFromApi) {
        // Find all meals in mealList that use this recipe. There may be more than one.
        for (var meal of mealList) {
            if (meal.recipe_uid == recipeFromApi.uid) {
                console.log('MMM-PaprikaMenu: Updating recipe');
                this.updateMealObjectFromRecipe(meal, recipeFromApi);
            }
        }
    },
});
