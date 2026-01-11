# Remote Sensing–Based Canopy and Surface Temperature Analysis

This repository contains code and documentation used to generate and analyze
vegetation and thermal metrics derived from Landsat imagery using a combination
of Google Earth Engine (GEE) and Python-based GIS workflows.

The project focuses on producing spatially aggregated metrics (e.g., NDVI and
Land Surface Temperature) for polygon features such as U.S. Census Blocks, with
an emphasis on reproducibility and transparent geospatial processing.

---

## Project Overview

The analytical workflow is divided into two primary stages:

1. **Remote sensing preprocessing in Google Earth Engine**
   - Generation of NDVI and LST composites from Landsat 7 and Landsat 8
   - Temporal filtering and compositing
   - Export of raster outputs for downstream analysis

2. **Spatial aggregation and analysis in Python**
   - Zonal statistics (mean and pixel count) for polygon features
   - Integration with GIS vector data
   - Preparation of outputs for statistical analysis and mapping

This separation allows scalable cloud-based processing while maintaining
flexibility for local GIS and statistical workflows.
