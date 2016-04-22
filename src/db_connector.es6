/*eslint no-console: ["error", { allow: ["log"] }] */

import MongoClient from 'mongodb';
import assert from 'assert';

// Connection URL
let url = 'mongodb://localhost:27017/yis';

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log('Testing db connection');

  db.close();
});