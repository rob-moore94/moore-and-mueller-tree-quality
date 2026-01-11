"""
Created on Thu Jul 31 09:01:54 2025

@author: rob-moore94
"""

// Load county boundary geometry from user-uploaded assets.
// IMPORTANT: Replace with your own asset path
var Cuyahoga_County_Boundary = ee.FeatureCollection("projects/ee-rmoore994/assets/Cuyahoga_County_Boundary");
var COUNTY = Cuyahoga_County_Boundary.geometry();

// Define the growing season using day-of-year filter (DOY 92–334 = April 2 to Nov 30).
var DATE_RANGE = ee.Filter.dayOfYear(92, 334);
// Define the range of years to analyze.
var YEAR_RANGE = ee.Filter.calendarRange(2016, 2018, 'year');

// Optional display toggle for visualization.
var DISPLAY = true;

// Set basemap and center view on study area (Cleveland, OH).
Map.setOptions('SATELLITE');
Map.setCenter(-81.681290, 41.505493);

// Define Landsat 8 band names for surface temperature and QA.
var LC08_bands = ['ST_B10', 'QA_PIXEL'];  // ST_B10 = thermal band, QA_PIXEL = quality mask

// Function to mask cloud and shadow pixels using bits 3 and 4 from QA_PIXEL.
function cloudMask(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 3)
               .or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(mask.not());
}

// Load Landsat 8 Collection 2, Tier 1, Level-2 data.
// Apply spatial and temporal filters, select bands, and apply cloud mask.
var L8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .select('ST_B10', 'QA_PIXEL')
  .filterBounds(COUNTY)
  .filter(DATE_RANGE)
  .filter(YEAR_RANGE)
  .map(cloudMask);

// Further filter out scenes with >20% cloud cover using scene-level metadata.
var filtered_L8 = L8.filter(ee.Filter.lt('CLOUD_COVER', 20));

// Preview filtered collection.
print(filtered_L8, 'Landsat 8 ST (Raw)');

// Function to apply scale factors to convert thermal band to degrees Celsius.
// Scale and offset from USGS Landsat Collection 2 documentation.
// Kelvin = DN * 0.00341802 + 149.0; Celsius = Kelvin - 273.15
function applyScaleFactors(image) {
  var thermal_C = image.select('ST_B10')
                       .multiply(0.00341802)
                       .add(149.0)
                       .subtract(273.15);  // Convert to °C
  return image.addBands(thermal_C, null, true);
}

// Apply scaling function across collection to get temperature in °C.
var landsatST = filtered_L8.map(applyScaleFactors);

// Calculate the pixel-wise mean surface temperature across all valid scenes.
var mean_LandsatST = landsatST.mean();

// Clip to study area boundary.
var clip_mean_ST = mean_LandsatST.clip(COUNTY);

// Print result for inspection.
print(clip_mean_ST, 'Mean LST (°C) clipped to county');

// Select just the temperature band for display/export.
var values_ST = clip_mean_ST.select("ST_B10");

// Visualization parameters for mapping (°C scale).
Map.addLayer(clip_mean_ST, {
  bands: "ST_B10",
  min: 20,
  max: 45,
  palette: ['blue','white','red']
}, "Mean Surface Temperature (°C)", DISPLAY);

// Export the clipped LST raster to Google Drive.
Export.image.toDrive({
  image: clip_mean_ST,
  description: 'LST_cuyahoga_2017',
  scale: 30,
  region: COUNTY,
  crs: 'EPSG:4326',
  fileFormat: 'GeoTIFF'
});

// Print number of scenes included in the mean composite.
print('Number of images after filtering:', filtered_L8.size());

// Print acquisition dates of all filtered scenes.
filtered_L8.aggregate_array('system:time_start').evaluate(function(dates){
  print('Acquisition Dates:', dates.map(function(date){
    return ee.Date(date).format('YYYY-MM-dd');
  }));
});
