## Start

There's a lot of good tutorials on the internet (including Amazon's) on how to setup basic EC2 instance (and configure access to it),
so we won't cover this here. For this bot to run, you'll need the smallest T1 EC2 instance, preferably with Ubuntu installed on it.

## Install required basic packages
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get update && sudo apt-get install -y build-essential g++ tmux make git
```

## Install MongoDB
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

## Install node global packages
```
npm install -g gulp
npm install -g pm2
```

## Start MongoDB
```
mongod
```

## Start YIS node process
```
pm2 start dist/cron.js
```
