MyWednesdayFix
==============

Version: 0.6 (01-DEC-2013)

MyWednesdayFix is an app currently under development. It will be available as a web app, and as a native app for iOS and Android devices.

The app is for comic book nerds by a comic book nerd. Its purpose is to provide said nerds with a look at new comic books in stores this Wednesday (or some other day this week for those odd books that go on sale on, like, Friday), as well as a look further into the future at books that are coming soon. It will also provide a simple way to lookup the closest comic book store in the nerd's area.

The app is built using:

 * [jQuery](http://jquery.com) for all sorts of JavaScript hackery
 * [Bootstrap](http://getbootstrap.com) for UI components
 * The [ComicVine API](http://comicvine.com/api) for book data
 * The [Google Places API and JavaScript library](https://developers.google.com/maps/documentation/javascript/places) for store lookup
 * [PhoneGap](http://phonegap.com) for iOS and Android native apps

TODOs
-----

 * Find a way to filter out issues that are not for a U.S. audience (e.g. all of the Japanese Manga and European comics with cover prices in GBP)
 * Find a way to filter out digital comics
 * Find a way to sort issues alphabetically, or at least in some more logical order than the default sort
 * Determine if its actually worth having "Coming Soon" -- it looks like, at most, a search for future store_date values returns 5 or 6 comics, and of those, most if not all appear to either be foreign comics or comics with bad data in ComicVine
 * Make sure columns have consistent heights in list views
 * Don't reload a view if it is already active, just scroll to top
 * Fix bug with trimOnPunctuation for sentences containing strings like "Mr." or "F.B.I."