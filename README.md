# MMM-PaprikaMenu
This is a module for [MagicMirror](https://github.com/MichMich/MagicMirror/). It displays your weekly menu from [Paprika](https://www.paprikaapp.com/).

# Installation
1. Move to MagicMirror's `modules` directory and clone the repo with<br>
`git clone https://github.com/kaelspencer/MMM-PaprikaMenu.git`
2. cd into `MMM-PaprikaMenu` and run `npm install`

# Config
<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Descriptio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>apikey</code></td>
      <td><strong>REQUIRED</strong> API Key from Google<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>origin</code></td>
      <td><strong>REQUIRED</strong> The starting point for your commute.  Usually this is your home address.<br><br><strong>Type:</strong> <code>string</code><br>This is as you would see it Google Maps.  Example:  <code>65 Front St W, Toronto, ON M5J 1E6</code></td>
    </tr>
    <tr>
      <td><code>startTime</code></td>
      <td>The start time of the window during which this module wil be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>00:00</code> (i.e.: midnight)</td>
    </tr>
    <tr>
      <td><code>endTime</code></td>
      <td>The end time of the window during which this module wil be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>23:59</code> (i.e.: one minute before midnight).</td>
    </tr>
    <tr>
      <td><code>hideDays</code></td>
      <td>A list of numbers representing days of the week to hide the module.<br><br><strong>Type:</strong> <code>array</code><br>Valid numbers are 0 through 6, 0 = Sunday, 6 = Saturday.<br>e.g.: <code>[0,6]</code> hides the module on weekends.</td>
    </tr>
    <tr>
      <td><code>showSummary</code></td>
      <td>Whether to show a brief summary of the route<br><br><strong>Type:</strong> <code>boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>colorCodeTravelTime</code></td>
      <td>Whether to colour-code the travel time red, yellow, or green based on traffic.<br><br><strong>Type:</strong> <code>boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>travelTimeFormat</code></td>
      <td>How the module should format your total travel time.<br><br><strong>Type:</strong> <code>string</code><br>Defaults to <code>m [min]</code> (e.g. 86 min).  Some other examples are <code>h[h] m[m]</code> (e.g.: 1h 26min), <code>h:mm</code> (e.g. 1:26).  This uses the <code>moment-duration-format</code> plugin's templating feature.  https://github.com/jsmreese/moment-duration-format#template</td>
    </tr>
    <tr>
      <td><code>travelTimeFormatTrim</code></td>
      <td>How to handle time tokens that have no value.  For example, if you configure <code>travelTimeFormat</code> as <code>"hh:mm"</code> but the actual travel time is less than an hour, by default only the minute portion of the duration will be rendered.  Set <code>travelTimeFormatTrim</code> to <code>false</code> to preserve the <code>hh:</code> portion of the format (e.g.: <code>00:21</code>).  Valid options are <code>"left"</code>, <code>"right"</code> (e.g.: <code>2:00</code> renders as <code>2</code>), or <code>false</code> (e.g.: do not trim).<br><br><strong>Type:</strong> <code>String</code> or <code>false</code><br>Defaults to <code>"left"</code>.</td>
    </tr>
    <tr>
      <td><code>moderateTimeThreshold</code></td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured yellow<br><br><strong>Type:</strong> <code>float</code><br>Defaults to <code>1.1</code> (i.e.: 10% longer than fastest time)</td>
    </tr>
    <tr>
      <td><code>poorTimeThreshold</code></td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured red<br><br><strong>Type:</strong> <code>float</code><br>Defaults to <code>1.3</code> (i.e.: 30% longer than fastest time)</td>
    </tr>
    <tr>
      <td><code>nextTransitVehicleDepartureFormat</code></td>
      <td>For any transit destinations where <code>showNextVehicleDeparture</code> is true, this dictates how to format the next arrival time.<br><br><strong>Type:</strong> <code>string</code><br>Defaults to <code>[next at] h:mm a</code>.</td>
    </tr>
    <tr>
      <td><code>pollFrequency</code></td>
      <td>How frequently, in milliseconds, to poll for traffic predictions.<br><strong>BE CAREFUL WITH THIS!</strong>  We're using Google's free API which has a maximum of 2400 requests per day.  Each entry in the destinations list requires its own request so if you set this to be too frequent, it's pretty easy to blow your request quota.<br><br><strong>Type:</strong> <code>number</code>.<br>Defaults to <code>10 * 60 * 1000</code> (i.e.: 600000ms, or every 10 minutes)</td>
    </tr>
    <tr>
      <td><code>destinations</code></td>
      <td>An array of destinations to which you would like to see commute times.<br><br><strong>Type:</strong> <code>array</code> of objects.<br>See below for destination options.</td>
    </tr>
  </tbody>
</table>

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
