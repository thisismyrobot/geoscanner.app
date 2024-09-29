# GeoScanner

## What does GeoScanner do?

Nothing! Well, not quite, but nearly. GeoScanner's one job is to appear to
record measurements at locations.

## But why?

GeoScanner is designed to be a prop for **legal** physical security assessment
reconnaissance. If you need to appear like you're wandering around in a field
to take soil-samples, an alley to measure Wi-Fi leakage, or a city street to
measure 5G strength, you can use this app as cover.

## How?

Open this site on an Android phone, allow access to orientation and location,
and it will invent sensor "readings" based on your location and the phone's
angle. Press "Record" to save them to the map as a heatmap. Plug one end of a
cable into your phone and another into the back of whatever "measuring tool"
prop you're using and you're good to go.

## The details

The app maps your orientation and location through trigonometry functions to
create a "random" set of values, but a set that is consistent (i.e., standing
in the same location with the phone at the same angle will give you the same
reading). This allows for credible mapping of readings over an area.

## How do I use it?

Either go to [geoscanner.app](https://geoscanner.app) or - because it's all
static HTML, CSS and JavaScript - host the files in this repository wherever
you'd like.

## TODOs

 - Add random-only fallback modes based on lack of GPS/orientation.
