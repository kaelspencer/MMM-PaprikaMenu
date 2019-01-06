var NodeHelper = require("node_helper");
var PaprikaApi = require("paprika-api");
console.log(PaprikaApi);
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
            }
            else if (payload.password == null || payload.password == "") {
                console.log( "[MMM-PaprikaMenu] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** No password set." );
            }
            else {
                if (this.paprikaApi == null) {
                    this.paprikaApi = new PaprikaApi.PaprikaApi(payload.email, payload.password);
                }

                var self = this;

                this.paprikaApi.meals().then((meals) => {
                    resp = {
                        instanceId: payload.instanceId,
                        meals: meals
                    };
                    self.sendSocketNotification("PAPRIKA_MENU_DATA", resp);
                });
            }
        }
    },
});
