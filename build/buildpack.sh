
if %1 == "unpack" then
fvtt package unpack -n %2 --outputDirectory ./packs/src/%2
endif
else if %1 == "pack" then
fvtt package pack -n %2 --inputDirectory ./packs/src/%2 --outputDirectory ./packs
fvtt package pack --nedb -n %2 --inputDirectory ./packs/src/%2 --outputDirectory ./packs
#TODO: sort ./packs/ff-skills by name
else 
fvtt package pack -n %1 --inputDirectory ./packs/src/%1 --outputDirectory ./packs
fvtt package pack --nedb -n %1 --inputDirectory ./packs/src/%1 --outputDirectory ./packs
#TODO: sort ./packs/ff-skills by name
endif
