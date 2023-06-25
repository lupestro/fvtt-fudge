rm -Rf ./packs/src2/attributes ./packs/src2/journals ./packs/src2/ff-rules ./packs/src2/ff-skills ./packs/src2/ff-gifts ./packs/src2/ff-faults
fvtt package unpack -n attributes    --outputDirectory ./packs/src2/attributes
fvtt package unpack -n journals      --outputDirectory ./packs/src2/journals
fvtt package unpack -n ff-skills     --outputDirectory ./packs/src2/ff-skills
fvtt package unpack -n ff-gifts      --outputDirectory ./packs/src2/ff-gifts
fvtt package unpack -n ff-faults     --outputDirectory ./packs/src2/ff-faults
fvtt package unpack -n ff-rules      --outputDirectory ./packs/src2/ff-rules
