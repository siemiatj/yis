// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */

import request from 'request-promise';

export default class Yis {
  constructor() {
    request('https://google.com')
    .then(() => {
      console.log('YES');
      return 0;
    })
    .catch(err => {
      console.log('ERR: ', err);
    });
  }
}