"""
Created on Thu Jul 31 08:59:35 2025

@author: rob-moore94
"""

// Author note: Imagery produced by this code should be visually assessed by user
// after export. Edge effects can become apparent in some imagery particulary,
// for county that lie of the the border of multiple Landsat scenes or tiles

// Load county boundary geometry from user-uploaded assets.
// IMPORTANT: Replace the asset path with your own if needed.
var Cuyahoga_County_Boundary = ee.FeatureCollection("projects/ee-rmoore994/assets/Cuyahoga_County_Boundary");
var COUNTY = Cuyahoga_County_Boundary.geometry();

// Define the temporal range of interest using day-of-year and year filters.
// This example spans the growing season: April 2 – October 31 (DOY 92–305).
var DATE_RANGE = ee.Filter.dayOfYear(92, 305);
var YEAR_RANGE = ee.Filter.calendarRange(2016, 2018, 'year');

// Exclude entire scenes with more than 20% cloud cover using metadata.
var CLOUD_FILTER = ee.Filter.lt('CLOUD_COVER', 20);

// Cloud and cloud-shadow masking function using bits 3 and 4 of the QA_PIXEL band.
function cloudMask(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 3)
               .or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(mask.not());
}

// Load Landsat 8 Collection 2, Tier 1, Level-2 surface reflectance data.
// Apply spatial, temporal, and cloud filters, then apply pixel-level cloud masking.
var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(COUNTY)
  .filter(DATE_RANGE)
  .filter(YEAR_RANGE)
  .filter(CLOUD_FILTER)
  .map(cloudMask)
  .select(['SR_B5', 'SR_B4']); // NIR (Band 5), Red (Band 4) for NDVI

// Define NDVI calculation function with physical and spectral corrections.
var addNDVI = function(image) {
  // Step 1: Apply scale factor and digital offset to convert to surface reflectance.
  var red = image.select('SR_B4').multiply(0.0000275).add(-0.2);
  var nir = image.select('SR_B5').multiply(0.0000275).add(-0.2);

  // Step 2: Calculate NDVI = (NIR - Red) / (NIR + Red)
  var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');

  // Step 3: Build mask to retain only valid reflectance values and theoretical NDVI range.
  var mask = red.gt(0).and(nir.gt(0)).and(ndvi.gte(-1)).and(ndvi.lte(1));

  // Step 4: Add masked NDVI band to original image.
  return image.addBands(ndvi.updateMask(mask));
};

// Apply NDVI function across the filtered and masked image collection.
var withNDVI = collection.map(addNDVI);

// Print total number of scenes after filtering and masking.
var count = withNDVI.size();
print('Number of Landsat 8 scenes:', count);

// Sort collection chronologically by acquisition date.
var sortedCollection = withNDVI.sort('system:time_start');
sortedCollection = sortedCollection.toList(count);  // Convert to list for exporting

// Set the name of the Google Drive folder where images will be exported.
var driveFolder = 'NDVI_TS_imagery_2';

// Loop through each scene and export the NDVI band as a separate GeoTIFF.
for (var i = 0; i < count.getInfo(); i++) {
  var scene = ee.Image(sortedCollection.get(i));
  var acquisitionDate = ee.Date(scene.get('system:time_start')).format('YYMMdd');
  var description = acquisitionDate.getInfo() + 'L8';

  Export.image.toDrive({
    image: scene.select('NDVI'),
    description: description,
    scale: 30,
    region: COUNTY,  // Define export region using county boundary
    fileFormat: 'GeoTIFF',
    crs: 'EPSG:4326',
    folder: driveFolder,
  });
}

// Print the list of acquisition dates in readable format for tracking exports.
withNDVI.aggregate_array('system:time_start').evaluate(function(dates){
  print('Acquisition Dates:', dates.map(function(date){
    return ee.Date(date).format('YYYY-MM-dd');
  }));
});
