#echo "Reading config"
#source config.cfg

#OLD_ROOT="http://localhost:8082/"
#OLD_ROLE="http://127.0.0.1:8073/"
#OLD_Y="http://yjs.dbis.rwth-aachen.de:5079"

echo "Updating dependencies"
bower --allow-root install

echo "Moving files"
rm -rf html
mkdir html
mkdir html/src
mv bower_components html/src/elements
cp -r src html/

#NEW_LAS=${LAS%/}
#NEW_Y=${Y%/}
#echo "Adjusting paths"
#grep -rl $OLD_ROOT html/src | xargs sed -i '' s@$OLD_ROOT@$ROOT@g
#grep -rl $OLD_ROLE html/src | xargs sed -i '' s@$OLD_ROLE@$ROLE@g
#grep -rl $OLD_Y html/src | xargs sed -i '' s@$OLD_Y@$NEW_Y@g

echo "Done"
