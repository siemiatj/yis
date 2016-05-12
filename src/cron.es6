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

let getReposData = function() {
  // FIXME
  return new Bluebird((resolve, reject) => {
    DBConnect.getRepositories((repos, error) => {
      if (error !== null) reject(error);
      resolve(repos);
    });
  });
};

function getIntegrationData() {
  //IMPLEMENT ME
  console.log('CONFIG');
}

let job = new CronJob.CronJob('00 * * * * *', function () {
  let users = null;
  let repositories = null;
  let config = null;

  async function getDBData() {
    try {
      users = await getUsersData();
      repositories = await getReposData();
      config = await getIntegrationData();
    } catch(error) {
      console.log('ERROR: ', error);
    }
    console.log('FOO');
    console.log('USERS: ', users);
    console.log('REPOS: ', repositories);
    console.log('SETTINGS: ', config);
  }

  getDBData();

  // get users from the db
  // get repos that the bot is set to check from the db

  // get timestamp of last API request from the db

  // get PR's for each repo

  // get events for each repo limited by timestamp

  // for each user check new PR's, comments on PR's, comments on commits

  // save current timestamp


  // GHClient.getCommentsForRepo(ret => {
  //   console.log(ret);
  //   console.log('*********************');

  //   DBConnect.getUsers(users => {
  //     console.log('USERS: ', users);
  //   });
  // }, err => {
  //   console.log('There was an error : ', err);
  // });
}, null, true, 'America/Los_Angeles');