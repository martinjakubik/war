#!/bin/bash

inkscape resources/card-batanimo.svg -i layer38 -j -C --export-png=build/border.png
inkscape resources/card-batanimo.svg -i layer39 -j -C --export-png=build/shadow.png

for layerId in {1..37}; do
    label=$(xmllint --xpath "string(/*[local-name() = 'svg']/*[local-name() = 'g'][@*[local-name() = 'id'] = 'layer${layerId}']/@*[local-name() = 'label'])"  resources/card-batanimo.svg)
    inkscape resources/card-batanimo.svg -i layer${layerId} -j -C --export-png=build/card${label}.png
    convert -background none -page +0+0 build/shadow.png  -page +0+0 build/border.png -page +0+0 build/card${label}.png  -layers merge +repage build/card-batanimo-${label}-bo-sh.png
done