// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */

import { YisDB } from './db_connector';
import { YisGH } from './gh_client';
import CronJob from 'cron';

const DBConnect = new YisDB();
const GHClient = new YisGH();

let job = new CronJob.CronJob('00 * * * * *', function () {
  GHClient.getAll(ret => {
    console.log(ret);
    console.log('*********************');
  }, err => {
    console.log('There was an error : ', err);
  });
}, null, true, 'America/Los_Angeles');