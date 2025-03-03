if [ $# -gt 0 ]
then
  rm -Rf ./$1/*
  fvtt package unpack -n attributes    --outputDirectory ./$1/attributes
  fvtt package unpack -n journals      --outputDirectory ./$1/journals
  fvtt package unpack -n ff-skills     --outputDirectory ./$1/ff-skills
  fvtt package unpack -n ff-gifts      --outputDirectory ./$1/ff-gifts
  fvtt package unpack -n ff-faults     --outputDirectory ./$1/ff-faults
  fvtt package unpack -n ff-rules      --outputDirectory ./$1/ff-rules
fi