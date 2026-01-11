# Zonal Statistics for Landsat Raster Aggregation

## Overview

These scripts process Landsat imagery by aggregating raster values into GIS polygon
features. Specifically, the code calculates the **average value of all pixels contained
within each polygon boundary** (e.g., U.S. Census Blocks).

In this case study, the scripts are used to compute:
- Average Normalized Difference Vegetation Index (NDVI)
- Average Land Surface Temperature (LST)

The scripts also calculate the **number of pixels contributing to each average**, which
is critical for assessing data quality when working with cloud-masked or incomplete
imagery.

---

## Preprocessing Notes

Before running the scripts, ensure the following requirements are met:

- A directory containing raster images (`.tif`), where the **band of interest is the first band**
- A polygon shapefile (`.shp`) that spatially overlaps the raster extent
- A **consistent coordinate reference system (CRS)** across all raster and vector data  
  (e.g., UTM Zone 17N or EPSG:4326)
- Raster filenames should include a **date or unique identifier** so output columns
  can be named correctly in the exported shapefile

---

## Usage

### Python Version

- Python **3.11.3**  
  (Packaged by conda-forge | Clang 14.0.6 | Created July 2025)

### Required Python Packages

- `rasterio`
- `geopandas`
- `rasterstats`

---

## Recommended Projection

For spatial consistency across all inputs and outputs, it is recommended to use:

- **EPSG:4326**

---

## Script Description

The scripts perform the following steps:

1. Loop through all `.tif` raster files in a specified directory
2. Compute zonal **mean** and **pixel count** statistics for each raster using an input
   polygon shapefile
3. Append the resulting statistics as new columns in the shapefile
4. Export the updated shapefile to a user-defined output location

Each output column corresponds to a raster filename, with:
- `_z` appended for **mean values**
- `_C` appended for **pixel counts**

These fields store the aggregated raster statistics for each polygon feature.
