echo "Updating dependencies"
bower --allow-root install

echo "Moving files"
rm -rf html
mkdir html
mkdir html/src
mv bower_components html/src/elements
cp -r src html/

echo "Done"
