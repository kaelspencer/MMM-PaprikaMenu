# MMM-PaprikaMenu
This is a module for [MagicMirror](https://github.com/MichMich/MagicMirror/). It displays your weekly menu from [Paprika](https://www.paprikaapp.com/).

![Screen Shot](/MMM-PaprikaMenu-screenshot.png?raw=true "Screen Shot")

# Installation
1. Move to MagicMirror's `modules` directory and clone the repo with<br>
`git clone https://github.com/kaelspencer/MMM-PaprikaMenu.git`
2. cd into `MMM-PaprikaMenu` and run `npm install`

# Config
At a minimum, you need a Paprika cloud sync account. Provide that email and password in the config.

|Option|Description|
|:--|:--|
|email              |**REQUIRED**<br>The email/user account for Paprika<br><br>Type: *string*|
|password           |**REQUIRED**<br>The password for your Paprika account<br><br>Type: *string*|
|weekStartsOnSunday |The modules shows the current week's menu. If true, the first day of the week will be Sunday. If false, Monday.<br><br>Type: `bool`<br>Default: `false`|
|showPriorDays      |Should previous days of this current week be display. If false, only today until the end of the week are shown.<br><br>Type: `bool`<br>Default: `true`|
|fadePriorEntries   |Should entries from previous days in the current week be faded.<br><br>Type: `bool`<br>Default: `true`|
|showPictures       |Show pictures corresponding to that days meal.<br><br>Type: `bool`<br>Default: `true`|
|roundPictureCorners|Round the meal picture corners.<br><br>Type: `bool`<br>Default: `false`|
|dateFormat         |Display format for the date; uses [moment.js format string](https://momentjs.com/docs/#/displaying/format/).<br><br>Type: `string`<br>Default: `"dddd"`|
|breakfastDisplay   |Paprika has a meal type where 0 corresponds to "Breakfast". You can change the word that is displayed.<br><br>Type: `string`<br>Default: `"Breakfast"`|
|lunchDisplay       |Paprika has a meal type where 1 corresponds to "Lunch". You can change the word that is displayed.<br><br>Type: `string`<br>Default: `"Lunch"`|
|dinnerDisplay      |Paprika has a meal type where 2 corresponds to "Dinner". You can change the word that is displayed.<br><br>Type: `string`<br>Default: `"Dinner"`|
|snackDisplay       |Paprika has a meal type where 3 corresponds to "Snack". You can change the word that is displayed.<br><br>Type: `string`<br>Default: `"Snack"`|
|dateMealSeperator  |Above each menu item, the date and meal type are displayed. For example, by default you'll see "Tuesday - Dinner". This setting controls the characters separating `dateFormat` and the meal display.<br><br>Type: `string`<br>Default: `" - "`|
|mealSortOrder      |The default sort order is breakfast (0), lunch (1), dinner (2), and lunch (3). You can change this sort order. For example, if you want dinner first: [2, 0, 1, 3]. The numbers correspond to the \*Display options above. Note: each number 0-3 must appear exactly once in the array.<br><br>Type: `array of int`| <br>Default: `[0, 1, 2, 3`]
|updateInterval     |How often, in minutes, to query Paprika.<br><br>Type: `int`<br>Default: `60` minutes|
|updateFadeSpeed    |How quickly to fade out and back in the module upon update.<br><br>Type: `int`<br>Default: `500`|

Here is an example of an entry in `config.js`. Take note of `snackDisplay` and `mealSortOrder`. Here, we use the snack entries as a reminder of things we need to do to prepare for future meals, e.g., thaw meat. `snackDisplay` changes what appears, and `mealSortOrder` moves the snack entries to the top of the list for that day.
```
{
    module: "MMM-PaprikaMenu",
    header: "Dinner Menu",
    position: "top_left",
    classes: "default everyone",
    config: {
        email: "yourpaprikaemail@email.com",
        password: "Secret!",
        weekStartsOnSunday: true,
        roundPictureCorners: true,
        snackDisplay: "Meal preparation reminder",
        mealSortOrder: [3, 0, 1, 2]
    }
},
```

## Dependencies
This package depends on the following:
- [paprika-api](https://www.npmjs.com/package/paprika-api)
- [moment](https://www.npmjs.com/package/moment)
