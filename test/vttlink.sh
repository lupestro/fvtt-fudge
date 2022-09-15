#/bin/bash
if [ -z $1 ]; then
  echo "Usage: vttlink [Foundry User Data Path]"
  exit -1
fi
clonedir="$(dirname $(cd "$(dirname "$0")"; pwd -P))"
targetdir=$(cd "$(dirname "$1"/data/systems/fudge/modules/fudge.mjs)"; pwd -P)
echo From repo in: $clonedir
echo To module in: $targetdir
# Replace system.json and template.json with links
rm $targetdir/system.json
ln -s $clonedir/system.json $targetdir/system.json
rm $targetdir/template.json
ln -s $clonedir/template.json $targetdir/template.json
# Replace javascript in root directory with link
for file in $clonedir/*.mjs
do 
  echo $(basename $file)
  rm $targetdir/$(basename $file)
  ln -s $file $targetdir/$(basename $file)
done
if [ ! -d $targetdir/test ]; then
  mkdir $targetdir/test
fi
# Replace javascript in test directory with link
for file in $clonedir/test/*.mjs
do
  echo test/$(basename $file)
  if [ -f "$targetdir/test/$(basename $file)" ]; then
    rm $targetdir/test/$(basename $file)
  fi
  ln -s $file $targetdir/test/$(basename $file)
done
# Replace dbs in packs directory with link
for file in $clonedir/packs/*.db
do
  echo test/$(basename $file)
  if [ -f "$targetdir/packs/$(basename $file)" ]; then
    rm $targetdir/packs/$(basename $file)
  fi
  ln -s $file $targetdir/packs/$(basename $file)
done
# Replace CSS in styles directory with link
for file in $clonedir/styles/*.css
do 
  echo $(basename $file)
  rm $targetdir/styles/$(basename $file)
  ln -s $file $targetdir/styles/$(basename $file)
done
# Replace translation strings in lang directory with link
for file in $clonedir/lang/*.json
do
  echo test/$(basename $file)
  if [ -f "$targetdir/lang/$(basename $file)" ]; then
    rm $targetdir/lang/$(basename $file)
  fi
  ln -s $file $targetdir/lang/$(basename $file)
done
# Replace templates in templates directory with link
for file in $clonedir/templates/*.hbs
do
  echo test/$(basename $file)
  if [ -f "$targetdir/templates/$(basename $file)" ]; then
    rm $targetdir/templates/$(basename $file)
  fi
  ln -s $file $targetdir/templates/$(basename $file)
done
