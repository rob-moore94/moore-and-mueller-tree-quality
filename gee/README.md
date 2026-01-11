# Google Earth Engine Processing for NDVI and LST

## Overview

These Google Earth Engine (GEE) scripts generate time-series composites of
Normalized Difference Vegetation Index (NDVI) and Land Surface Temperature (LST)
using Landsat surface reflectance data.

The workflow integrates:
- Landsat 7 ETM+ (Enhanced Thematic Mapper Plus)
- Landsat 8 OLI (Operational Land Imager)
- Landsat 8 TIRS (Thermal Infrared Sensor)

The case study focuses on **Cuyahoga County, Ohio**.

NDVI composites are generated using **growing-season imagery (April–October,
2016–2018)** to align with 2017 high-resolution land cover data from the
Cuyahoga County Planning Commission.

LST composites are generated using imagery from **May–September** over the same
time period.

---

## Preprocessing Notes

To improve compatibility between Landsat 7 and Landsat 8 datasets, band-level
transformations described in **Roy et al. (2016)** are applied to Landsat 7
surface reflectance data.

**Reference:**

Roy, D. P., et al. (2016).  
*Characterization of Landsat-7 to Landsat-8 reflective wavelength and normalized
difference vegetation index continuity.*  
Remote Sensing of Environment.  
https://doi.org/10.1016/j.rse.2015.12.024

---

## Usage

- These scripts must be run within the **Google Earth Engine Code Editor**
- Earth Engine-hosted datasets are accessed directly within the platform
- Users must be authenticated to export imagery

When exporting raster outputs, it is recommended to use:
- **UTM Zone 17N**, or
- **EPSG:4326**

to maintain consistency with downstream GIS and Python workflows.

---

## Data Sources

- **USGS Landsat 7 Level 2, Collection 2, Tier 1**  
  https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LE07_C02_T1_L2

- **USGS Landsat 8 Level 2, Collection 2, Tier 1**  
  https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2

- **Landsat Level 2, Collection 2 Documentation**  
  https://www.usgs.gov/media/files/landsat-8-9-olitirs-collection-2-level-2-data-format-control-book

