echo "Updating dependencies"
bower --allow-root install

echo "Moving files"
rm -rf html
mkdir html
mkdir html/src
mv node_modules html/src/elements
cp -r src html/

echo "Done"
