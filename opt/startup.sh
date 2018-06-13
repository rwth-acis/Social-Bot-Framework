#!/bin/sh
# Permissions
chmod +x /ROLE/role-m10-sdk/bin/start.sh
chmod +x /opt/yjs/start.sh
chmod -R 777 /ROLE/role-m10-sdk/

# Make sure service is running
touch /var/run/supervisor.sock
chmod 777 /var/run/supervisor.sock
supervisord -c /etc/supervisor/supervisord.conf
screen -S 9000 -d -m supervisorctl -c /etc/supervisor/supervisord.conf
mysqld_safe --skip-grant-tables &
sleep 5
echo "CREATE DATABASE LAS2PEERMON" | mysql -u root 
mysql -u root LAS2PEERMON < /mobsos-data-processing/etc/create_database_MySQL.sql

### Bootstrap node
cd /mobsos-data-processing
screen -S 9011 -d -m java -cp "lib/*" i5.las2peer.tools.L2pNodeLauncher -p 9011 -s ./service/ uploadStartupDirectory startService\(\'i5.las2peer.services.mobsos.dataProcessing.MonitoringDataProcessingService@0.7.0\',\'processing\'\) interactive
sleep 5

### IP
myIP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1')

### success modeling
cd ../mobsos-success-modeling
screen -S 9013 -d -m java -cp "lib/*" i5.las2peer.tools.L2pNodeLauncher -p 9013 -b ${myIP}:9011 -s ./service/ "uploadStartupDirectory" "startService('i5.las2peer.services.mobsos.successModeling.MonitoringDataProvisionService@0.7.0')" interactive
sleep 5

### Noracle Backend
cd ../Distributed-Noracle-Backend
sed -i -e "s/\[bootstrap\]/\[bootstrap\]\n${myIP}:9011/g" launcher-configuration.ini
sed -i -e "s/false/true/g" launcher-configuration.ini
mv launcher-configuration.ini etc/launcher-configuration.ini
screen -S 9012 -d -m sh start-local.sh
sleep 5

### SBF Manager
cd ../Social-Bot-Manager
screen -S 9014 -d -m java -cp "lib/*" i5.las2peer.tools.L2pNodeLauncher -p 9014 -b ${myIP}:9011 -o -s ./service/ "uploadStartupDirectory" "startService('i5.las2peer.services.socialBotManagerService.SocialBotManagerService@1.0')" interactive
sleep 5

### l2p t2t
cd ../las2peer-TensorFlow-TextToText
screen -S 9015 -d -m java -cp "lib/*" i5.las2peer.tools.L2pNodeLauncher -p 9015 -b ${myIP}:9011 -o -s ./service/ "uploadStartupDirectory" "startService('i5.las2peer.services.tensorFlowTextToText.TensorFlowTextToText@1.0')" interactive
sleep 5

### l2p classifier
cd ../las2peer-TensorFlow-Classifier
screen -S 9016 -d -m java -cp "lib/*" i5.las2peer.tools.L2pNodeLauncher -p 9016 -b ${myIP}:9011 -o -s ./service/ "uploadStartupDirectory" "startService('i5.las2peer.services.tensorFlowClassifier.TensorFlowClassifier@1.0')" interactive
sleep 5

### Noracle Frontend
cd ../Distributed-Noracle-Frontend
sed -i -e 's/ng serve/ng serve --host 0.0.0.0/g' package.json
sed -i -e 's/9082/8080/g' src/environments/environment.ts
screen -S 4200 -d -m npm run start
cd ../ 

mv /widgets/html /source/syncmeta/html/methodselector

bash