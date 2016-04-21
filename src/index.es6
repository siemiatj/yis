import request from 'request-promise';

export default class Yis {
  constructor(foo) {
    request(foo)
    .then(() => {})
    .catch(() => {});
  }
}