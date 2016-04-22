/*eslint no-console: ["error", { allow: ["log", "dir"] }] */

import { MongoClient } from 'mongodb';
import assert from 'assert';

export class YisDB {
  constructor(url) {

    // Connection URL
    this.dbUrl = url || 'mongodb://localhost:27017/yis';
  }

  testConnection() {
    const url = this.dbUrl; 
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log('Testing db connection');

      db.close();
    });
  }

  findUser(username) {
    const url = this.dbUrl;
    const findUser = function(db, callback) {
      let cursor = db.collection('users').find( { 'username': username } );
      
      cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
          console.dir(doc);
        } else {
          callback();
        }
      });
    };

    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      findUser(db, function() {
        console.log('User not found');
        db.close();
      });
    });
  }

  addUser() {

  }

  updateUser() {

  }

  deleteUser() {

  }
}