// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */

import { YisDB } from './db_connector';
import { YisGH } from './gh_client';
import CronJob from 'cron';
import moment from 'moment';

const DBConnect = new YisDB();
const GHClient = new YisGH('saucelabs');

let job = new CronJob.CronJob('00 * * * * *', function () {
  // get users from the db
  // get repos that the bot is set to check from the db

  // get timestamp of last API request from the db

  // get PR's for each repo

  // get events for each repo limited by timestamp

  // for each user check new PR's, comments on PR's, comments on commits

  // save current timestamp


  GHClient.getCommentsForRepo(ret => {
    console.log(ret);
    console.log('*********************');

    DBConnect.getUsers(users => {
      console.log('USERS: ', users);
    });
  }, err => {
    console.log('There was an error : ', err);
  });
}, null, true, 'America/Los_Angeles');