// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */
import 'babel-polyfill';
import { YisDB } from './db_connector';
import { YisGH } from './gh_client';
import Yis from './index';
import CronJob from 'cron';
import Bluebird from 'bluebird';
import moment from 'moment';
// import assert from 'assert';

const DBConnect = new YisDB();
const GHClient = new YisGH('saucelabs');
const botSettings = {
  token: '',
  name: '',
  repositories: [],
  last_run: null
};
let YISbot = new Yis(botSettings);
YISbot.on('start', params => {
  YISbot.postMessageToChannel('yis', 'aww yis', params);
});
YISbot.on('message', data => {
  YISbot._onMessage(data);
});

let getUsersData = function() {
  return new Bluebird((resolve, reject) => {
    DBConnect.getUsers((users, error) => {
      if (error !== null) reject(error);
      resolve(users);
    });
  });
};

let getIntegrationData = function() {
  return new Bluebird((resolve, reject) => {
    DBConnect.getConfig((config, error) => {
      if (error !== null) reject(error);
      resolve(config);
    });
  });
};

let setSearchTimestamp = () => {
  return new Bluebird((resolve, reject) => {
    let time = new Date().getTime();

    DBConnect.setConfig({ last_run: time }, error => {
      if (error !== null) reject(error);
      resolve();
    });
  });
};

// this function runs only a few times a day max (so that it won't exceed )
let collectData = new CronJob.CronJob('00 * * * * *', function () {
  async function getData() {
    let usersData = null;
    let users = {};
    let configRepositories = null;
    let configTime = null;
    let config = null;
    let repositories = {};


    try {
      // get users from the db
      usersData = await getUsersData();
      // get config (with repositories and last check timestamp)
      config = await getIntegrationData();
    } catch(error) {
      console.log('ERROR: ', error);
    }
    console.log('USERS: ', usersData);
    console.log('SETTINGS: ', config);

    // get timestamp of last API request from the db
    config = config[0];
    configTime = config.last_run;
    // get repos that the bot is set to check from the db
    configRepositories = config.repositories;

    // turn users into an object with gh_username as key 
    // and another object with comments/pull_requests keys as value
    usersData.forEach(usr => {
      users[usr.gh_username] = {
        pull_requests: [],
        comments: [],
        slack_username: usr.slack_username
      };
    });

    console.log('USERS STRUCT: ', users);

    // iterate over repos from config
    configRepositories.forEach(repo => {
      console.log('REPO: ', repo.name);

      // get PR's for each repo and check if users from our list
      // are assigned. If yes - save that in `pull_requests` field in `users` object

      // GHClient.getPullRequestsForRepo(repo, ret => {
      //   console.log(ret);
      //   console.log('*********************');
      // }, err => {
      //   console.log('There was an error : ', err);
      // });

      // get events for each repo limited by timestamp (or from start of the day today if 
      // it's the first run) and save them
      // {
      //   <repo_name>: {
      //     comments: []
      //   }
      // }
    });

  // for each user 
    // check comments
      // this is going to be tricky, as we need to parse the whole discussion over a PR
      // and find comments where our user's name was mentioned. And if it was mentioned, we
      // need to see if our user responded to that later, or not

  // timestamp format : '2016-05-07T05:33:32.484Z'
  // setSearchTimestamp();
  }

  getData();
}, null, true, 'America/Los_Angeles');