// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */
import 'babel-polyfill';
import { YisDB } from './db_connector';
import { YisGH } from './gh_client';
import CronJob from 'cron';
import Bluebird from 'bluebird';
import moment from 'moment';
// import assert from 'assert';

const DBConnect = new YisDB();
const GHClient = new YisGH('saucelabs');

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

let job = new CronJob.CronJob('00 * * * * *', function () {
  async function getData() {
    let users = null;
    let configRepositories = null;
    let configTime = null;
    let config = null;
    let repositories = {};

    try {
      users = await getUsersData();
      config = await getIntegrationData();
    } catch(error) {
      console.log('ERROR: ', error);
    }
    console.log('FOO');
    console.log('USERS: ', users);
    console.log('SETTINGS: ', config);

    let last_check = config.last_run;

    if (!last_run) {
      // run 
    }

  // timestamp format : '2016-05-07T05:33:32.484Z'
  // GHClient.getCommentsForRepo(timestamp, ret => {
  //   console.log(ret);
  //   console.log('*********************');

  //   DBConnect.getUsers(users => {
  //     console.log('USERS: ', users);
  //   });
  // }, err => {
  //   console.log('There was an error : ', err);
  // });

    // setSearchTimestamp();
  }

  getData();

  // get users from the db
    // turn users into an object with gh_username as key 
    // and another object with comments/pull_requests keys as value
    // {
    //   <user>: {
    //     pull_requests: [],
    //     comments: []
    //   }
    // }
  // get repos that the bot is set to check from the db
  // get timestamp of last API request from the db

  // iterate over repos from config
    // get PR's for each repo and save them
    // {
    //   <repo_name>: {
    //     pull_requests: []
    //   }
    // }
    // get events for each repo limited by timestamp (or from start of the day today if 
      // it's the first run) and save them
      // {
      //   <repo_name>: {
      //     pull_requests: [],
      //     comments: []
      //   }
      // }
  // for each user check new PR's, comments on PR's, comments on commits

  // save current timestamp
}, null, true, 'America/Los_Angeles');