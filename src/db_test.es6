/*eslint no-console: ["error", { allow: ["log"] }] */
import { YisDB } from './db_connector';

const newDBConn = new YisDB();

console.log('Test connection: ');
newDBConn.testConnection();

console.log('Find user: ');
newDBConn.findUser('test1', u => {
  console.log('ARGS: ', u[0]);
});

console.log('Fail finding user: ');
newDBConn.findUser('fakeuser', u => {
  console.log('Fail: ', u);
});

let time = new Date().getTime();
let data = {
  slack_username: ''+time
};
console.log('Update user with: ', data);
newDBConn.updateUser('test2', data, u => {
  console.log('User: ', u);
});

console.log('Add user');
let time2 = new Date().getTime();
let data2 = {
  slack_username: time2,
  gh_username: 'foo',
  pull_requests: []
};
newDBConn.insertUser(data2, u => {
  console.log('User: ', u);
});