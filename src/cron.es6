import request from 'request-promise';

export default class Yis {
  constructor() {
    request('https://google.com')
    .then(() => {
      console.log('YES');
    })
    .catch((err) => {
      console.log('ERR: ', err);
    });
  }
}