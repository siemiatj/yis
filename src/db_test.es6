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