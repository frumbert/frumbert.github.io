#!/bin/bash

echo "Compiling H5P source to zip ..."

rm src.zip
cd src
zip -r ../src.zip . -x ".*" -x "__MACOSX"
cd ..

