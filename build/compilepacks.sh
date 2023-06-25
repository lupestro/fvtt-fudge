rm -Rf ./packs/attributes ./packs/journals ./packs/ff-rules ./packs/ff-skills ./packs/ff-gifts ./packs/ff-faults 
npx fvtt package pack --outputDirectory ./packs -n attributes    --inputDirectory ./packs/src/attributes
npx fvtt package pack --outputDirectory ./packs -n journals      --inputDirectory ./packs/src/journals
npx fvtt package pack --outputDirectory ./packs -n ff-rules      --inputDirectory ./packs/src/ff-rules
npx fvtt package pack --outputDirectory ./packs -n ff-skills     --inputDirectory ./packs/src/ff-skills
npx fvtt package pack --outputDirectory ./packs -n ff-gifts      --inputDirectory ./packs/src/ff-gifts
npx fvtt package pack --outputDirectory ./packs -n ff-faults     --inputDirectory ./packs/src/ff-faults
