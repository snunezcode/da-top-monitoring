#Clone Repository
source $HOME/.bash_profile
cd /tmp
sudo rm -rf da-top-monitoring
git clone https://github.com/GitHubRepository/da-top-monitoring.git
cd da-top-monitoring
sudo cp -r server frontend /aws/apps

#React Application Installation
cd /aws/apps/frontend/; npm install; npm run build;

#Copy build content to www folder
cp -r /aws/apps/frontend/build/* /aws/apps/frontend/www/

#NodeJS API Core Installation
cd /aws/apps/server/; npm install;

cat /aws/apps/frontend/public/version.json
echo "Restarting the API Service..."
sleep 10

#Re-Start API Services
sudo service api.core restart

