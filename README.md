MyWednesdayFix
==============

Version: 0.19.4 (08-MAR-2015)

MyWednesdayFix is an app currently under development. It will be available as a web app, and as a native app for iOS and Android devices.

The app is for comic book nerds by a comic book nerd. Its purpose is to provide said nerds with a look at new comic books in stores each Wednesday. It also provides a simple way to lookup the closest comic book store in the nerd's area.

The app is built using:

 * [jQuery](http://jquery.com) for all sorts of JavaScript hackery
 * [Bootstrap](http://getbootstrap.com) for UI components
 * The [ComicVine API](http://comicvine.com/api) for book data
 * The [Google Places API and JavaScript library](https://developers.google.com/maps/documentation/javascript/places) for store lookup
 * [PhoneGap](http://phonegap.com) for packaging native apps
 * [TiCons](http://ticons.fokkezb.nl) for creating native app icons and splash screens

TODOs
-----

 * Fix bug with trimOnPunctuation for sentences containing strings like "Mr." or "F.B.I."
 * Use -webkit-touch-callout: none to prevent iOS from showing Open dialog when user holds down on a link
 * Prevent header from jumping on iOS when margin-top is adjusted
 * Style InAppBrowser