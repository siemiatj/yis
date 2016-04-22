// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */

// import request from 'request-promise';
import { YisDB } from './db_connector';
import { YisGH } from './gh_client';

const DBConnect = new YisDB();
const GHClient = new YisGH();

console.log('APIS: ', DBConnect, GHClient);

// export default class Yis {
//   constructor() {
//     request('https://google.com')
//     .then(() => {
//       console.log('YES');
//       return 0;
//     })
//     .catch(err => {
//       console.log('ERR: ', err);
//     });
//   }
// }