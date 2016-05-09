// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */

import { YisDB } from './db_connector';
import { YisGH } from './gh_client';
import CronJob from 'cron';

const DBConnect = new YisDB();
const GHClient = new YisGH();

let job = new CronJob.CronJob('00 * * * * *', function () {
  // this won't work as we'd only get publicly accessible data
  // GHClient.getNotificationsForUser(ret => {
  //   console.log(ret);
  //   console.log('*********************');
  // }, err => {
  //   console.log('There was an error : ', err);
  // });

  // GHClient.getEventsForRepo(ret => {
  GHClient.getCommentsForRepo(ret => {
    console.log(ret);
    console.log('*********************');

    DBConnect.getUsers(users => {
      console.log('USERS: ', users);
    });
  }, err => {
    console.log('There was an error : ', err);
  });

  // this one works but returns a lot of noise
  // GHClient.getEventsForUser(ret => {
  //   console.log(ret);
  //   console.log('*********************');
  // }, err => {
  //   console.log('There was an error : ', err);
  // });
}, null, true, 'America/Los_Angeles');