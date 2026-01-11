"""
Created on Thu Jul 31 08:57:34 2025

@author: rob-moore94
"""
// Author note: Imagery produced by this code should be visually assessed by user
// after export. Edge effects can become apparent in some imagery particulary,
// for county that lie of the the border of multiple Landsat scenes or tiles

// Additionally user should expect missing data due to Scan Line Correct issue with Landsat 7
// hardware after 2003.

// Load county boundary geometry from user-uploaded assets.
// IMPORTANT: Replace the asset path below with the correct path to your own uploaded boundary.
var Cuyahoga_County_Boundary = ee.FeatureCollection("projects/ee-rmoore994/assets/Cuyahoga_County_Boundary");
var COUNTY = Cuyahoga_County_Boundary.geometry();

// Define the temporal range of interest using day-of-year and year filters.
// This example spans the growing season (April 1–October 31, DOY 91–305) across multiple years.
var DATE_RANGE = ee.Filter.dayOfYear(91, 305);
var YEAR_RANGE = ee.Filter.calendarRange(2016, 2018, 'year');

// Define a metadata-based filter to exclude entire Landsat scenes with more than 20% cloud cover.
var CLOUD_FILTER = ee.Filter.lt('CLOUD_COVER', 20);

// Function to mask cloud and cloud shadow pixels using bits 3 and 4 of the QA_PIXEL band.
function cloudMask(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 3)
               .or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(mask.not());
}

// Load Landsat 7 Collection 2, Tier 1, Level-2 surface reflectance imagery.
// Apply spatial, temporal, and cloud metadata filters, cloud masking, and select red/NIR bands.
var collection = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
  .filterBounds(COUNTY)
  .filter(DATE_RANGE)
  .filter(YEAR_RANGE)
  .filter(CLOUD_FILTER)
  .map(cloudMask)
  .select(['SR_B4', 'SR_B3']);  // Band 4 = NIR, Band 3 = Red (pre-NDVI calculation)

// Mask pixels outside of county boundary
var maskToCounty = function(image) {
  return image.clip(COUNTY).updateMask(image.clip(COUNTY).mask());
};

// Define a function to calculate NDVI for each image, following standard corrections and transformations.
var addNDVI = function(image) {
  // Step 1: Apply scale factor and offset to convert raw digital numbers to reflectance values.
  var sr_b4 = image.select('SR_B4').multiply(0.0000275).add(-0.2);  // NIR
  var sr_b3 = image.select('SR_B3').multiply(0.0000275).add(-0.2);  // Red

  // Step 2: Apply OLS-based spectral transformation from Roy et al. (2016)
  // to harmonize Landsat 7 ETM+ data with Landsat 8 OLI for NDVI continuity.
  var nir = sr_b4.multiply(0.8462).add(0.0412);
  var red = sr_b3.multiply(0.9047).add(0.0061);

  // Step 3: Compute NDVI = (NIR - Red) / (NIR + Red)
  var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');

  // Step 4: Construct a pixel-level mask to retain only physically valid NDVI and reflectance values.
  var mask = red.gt(0).and(nir.gt(0)).and(ndvi.gte(-1)).and(ndvi.lte(1));

  // Step 5: Add the masked NDVI band to the original image.
  return image.addBands(ndvi.updateMask(mask));
};

// Apply NDVI calculation to each image in the collection.
var withNDVI = collection.map(addNDVI).map(maskToCounty);

// Output the total number of filtered and processed images.
var count = withNDVI.size();
print('Number of Landsat scenes:', count);

// Sort images by acquisition date for chronological export.
var sortedCollection = withNDVI.sort('system:time_start');

// Convert the collection to a list to allow indexed export operations.
sortedCollection = sortedCollection.toList(count);
var driveFolder = 'NDVI_TS_imagery_2';

// Export each NDVI image as a separate GeoTIFF to Google Drive.
// Filenames will include the acquisition date and Landsat 7 identifier.
for (var i = 0; i < count.getInfo(); i++) {
  var scene = ee.Image(sortedCollection.get(i));
  var acquisitionDate = ee.Date(scene.get('system:time_start')).format('YYMMdd');
  var description = acquisitionDate.getInfo() + 'L7';

  Export.image.toDrive({
    image: scene.select('NDVI'),
    description: description,
    scale: 30,
    region: COUNTY,  // Define export region using the county boundary
    fileFormat: 'GeoTIFF',
    crs: 'EPSG:4326',
    folder: driveFolder,
  });
}

