# Data and third-party notices

Snapshot assembled October 6, 2026. The packaged directory is a partial food-place extract, not a complete listing or a quality endorsement.

## OpenStreetMap

© OpenStreetMap contributors. The data in `public/data/starter.json` and `data-sources/*-osm.json` is adapted from OpenStreetMap and is offered under the [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). See [copyright and attribution](https://www.openstreetmap.org/copyright). Fields have been selected, category labels normalized, and some way coordinates derived from their mapped nodes. Each public place record links back to its OSM element. The transformed database and source extracts are included to make the adapted data available under ODbL.

Yangon, Bangkok, Singapore, Tokyo and Sydney: small named-food-place queries from `https://overpass-api.de/api/interpreter`, using amenity restaurant/cafe/fast_food/food_court/ice_cream and shop bakery/confectionery. Radius 1.2–2.2 km around the included starter centers; capped at 100 or 140 entries. Those caps do not represent the total number of venues.

Mandalay, London and New York City: small bounding-box map extracts from `https://api.openstreetmap.org/api/0.6/map`, filtered to named food places. Original query URLs are retained in source metadata. Unrelated map features are omitted. Way centers are approximate averages of their mapped nodes.

The original OSM IDs, raw selected-element tags and available source timestamps are preserved in `data-sources`. The public representation uses `public/core.js` → `fromOSM`. Rebuild it with `node scripts/build-starter.mjs` after intentionally replacing the source extracts.

No Google Places records or Google venue photos were copied into this open dataset. No venue ratings, prices or live open/closed claims were inferred.

## GeoNames

City coordinates/names and region names are adapted from [GeoNames](https://www.geonames.org/) `cities15000.zip`, USA rows from `cities500.zip`, and `admin1CodesASCII.txt`, downloaded from [GeoNames export](https://download.geonames.org/export/dump/). Licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Fields selected: id, name, ASCII name, country code, region name, coordinates, population and a shortened alias list preserving selected non-Latin scripts. USA rows are shown first, with population ordering within each group. Data is supplied as is; boundaries, names and populations may be incomplete or disputed.

`public/data/cities.json` stores compact arrays in that field order. The worldwide base uses cities15000. The USA supplement uses cities500 (population above 500 or qualifying administrative seats), not every settlement. USA postal state codes and editorial OBX/KDH aliases are added separately in location-aliases.json. Attribution is shown in the footer. Changes are field selection, alias selection, region-name substitution, JSON conversion and sorting.

## Libraries

Leaflet is distributed in `public/vendor/leaflet` with its license. TIFF conversion uses UTIF and pako; license files are in `public/vendor/tiff`. Firebase Web SDK 12.19.0 is loaded from Google's official CDN only for cloud features. Firebase packages and their own licenses apply separately.

## Artwork and original source

The logo, favicon, hero bowl and category icons were made specifically for this rebuild as SVG. Category artwork is illustrative, not a photograph of the listed venue. Owner-supplied photos remain subject to the uploader's rights and permissions.

The user's original app source is retained in `legacy/original-public` for reference. It is outside the hosting directory and not part of the active application. This project does not assert a license over third-party assets referenced by the original app.

## v1.1 Outer Banks update

Additional bounded restaurant/café/bakery extracts were retrieved on October 6, 2026 for Kill Devil Hills, Kitty Hawk, Nags Head, Southern Shores, Manteo, Avon, Buxton, Hatteras and Ocracoke. Most use a 3.5 km Overpass query around the GeoNames center; fallbacks use small OSM API bounding boxes whose exact URLs are preserved in the extract metadata. Nearby areas overlap; the Outer Banks combined view deduplicates by OSM element ID. This is a partial collection of those nine towns, not a claim to cover every Outer Banks community or establishment.

OBX is treated as an Outer Banks area shortcut, KDH as Kill Devil Hills, and NC as the North Carolina state filter. Area membership was checked against the [Outer Banks Visitors Bureau town guide](https://www.outerbanks.org/plan-your-trip/explore/towns-and-villages/). The abbreviation mapping is a search aid, not a geocoding result.

## v1.2 food vocabulary

`public/food.js` contains editorial Burmese/English search vocabulary, not a menu database. Cuisine-based matches are labelled as related places to ask. No restaurant's dish availability has been invented. Administrator menu descriptions and links remain subject to the contributor's rights and responsibility.
