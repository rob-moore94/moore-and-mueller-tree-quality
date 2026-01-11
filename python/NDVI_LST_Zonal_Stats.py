#!/usr/bin/env python
# coding: utf-8

# In[1]:


# Created on Thu Jul 31 09:01:54 2025
# @author: rob-moore94
# Python version: 3.11.3 | packaged by conda-forge | (main, Apr  6 2023, 09:05:00) [Clang 14.0.6 ]

# Calculate zonal stats average on time series rasters and add them to a shapefile
# This script assumes you have a folder containing multiple .tif raster files
# Important ensure source data have same coordinate reference system

import os
import re
import rasterio
from rasterstats import zonal_stats
import geopandas as gpd

# Path to the folder containing raster files
raster_folder = "insert path to folder containing raster .tif files"

# Open shapefile
shapefile = gpd.read_file("insert path to folder containing .shp file")

# Function to extract zonal statistics for a single raster file
def calculate_zonal_stats(shapefile, raster_file):
    with rasterio.open(raster_file) as src:
        affine = src.transform
        band1 = src.read(1)
        nodata_value = src.nodata
        stats = zonal_stats(shapefile.geometry, band1, affine=affine, nodata=nodata_value, stats=['mean'])

        # Use filename without .tif as column name
        column_name = os.path.splitext(os.path.basename(raster_file))[0]+"_z"
        shapefile[column_name] = [s['mean'] for s in stats]


# Loop through each raster file in the folder
for filename in os.listdir(raster_folder):
    if filename.endswith(".tif"):
        raster_file = os.path.join(raster_folder, filename)
        calculate_zonal_stats(shapefile, raster_file)

# Export the updated shapefile
output_shapefile = "insert path of desired output location.shp"
shapefile.to_file(output_shapefile)


# In[2]:


# Created on Thu Jul 31 09:01:54 2025
# @author: rob-moore94
# Python version: 3.11.3 | packaged by conda-forge | (main, Apr  6 2023, 09:05:00) [Clang 14.0.6 ]

# Calculate zonal stats average on time series rasters and add them to a shapefile
# This script assumes you have a folder containing multiple .tif raster files
# Important ensure source data have same coordinate reference system

import os
import rasterio
from rasterstats import zonal_stats
import geopandas as gpd

# Path to the folder containing raster files
raster_folder = "insert path to folder containing raster .tif files"

# Open shapefile
shapefile = gpd.read_file("insert path to folder containing .shp file")

# Function to extract zonal statistics for a single raster file (count pixels)
def calculate_pixel_counts(shapefile, raster_file):
    with rasterio.open(raster_file) as src:
        affine = src.transform
        band1 = src.read(1)
        nodata_value = src.nodata
        stats = zonal_stats(shapefile.geometry, band1, affine=affine, nodata=nodata_value, stats=['count'])

        # Use filename without .tif as column name
        column_name = os.path.splitext(os.path.basename(raster_file))[0] + "_C"
        shapefile[column_name] = [s['count'] for s in stats]

# Loop through each raster file in the folder
for filename in os.listdir(raster_folder):
    if filename.endswith(".tif"):
        raster_file = os.path.join(raster_folder, filename)
        calculate_pixel_counts(shapefile, raster_file)

# Export the updated shapefile
output_shapefile = "insert path of desired output location.shp"
shapefile.to_file(output_shapefile)


# In[1]:





# In[ ]:




