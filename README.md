# MMM-PaprikaMenu
This is a module for [MagicMirror](https://github.com/MichMich/MagicMirror/). It displays your weekly menu from [Paprika](https://www.paprikaapp.com/).

# Installation
1. Move to MagicMirror's `modules` directory and clone the repo with<br>
`git clone https://github.com/kaelspencer/MMM-PaprikaMenu.git`
2. cd into `MMM-PaprikaMenu` and run `npm install`

# Config
|Option|Description|
|:--|:--|
|email              |**REQUIRED** The email user account for Paprika<br>Type: *string*|
|password           |**REQUIRED** The password for your Paprika account<br>Type: *string*|
|weekStartsOnSunday |<br>Type: *bool*<br>Default: false|
|fadePriorEntries   |<br>Type: *bool*<br>Default: true|
|showPictures       |<br>Type: *bool*<br>Default: true|
|roundPictureCorners|<br>Type: *bool*<br>Default: false|
|dateFormat         |<br>Type: *string*<br>Default: "dddd"|
|breakfastDisplay   |<br>Type: *string*<br>Default: "Breakfast"|
|lunchDisplay       |<br>Type: *string*<br>Default: "Lunch"|
|dinnerDisplay      |<br>Type: *string*<br>Default: "Dinner"|
|snackDisplay       |<br>Type: *string*<br>Default: "Snack"|
|dateMealSeperator  |<br>Type: *string*<br>Default: " - "|
|mealSortOrder      |<br>Type: *array of int*| <br>Default: [0, 1, 2, 3] 
|updateInterval     |<br>Type: *int*<br>Default: 60|
|updateFadeSpeed    |<br>Type: *int*<br>Default: 500|

Here is an example of an entry in `config.js`
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
