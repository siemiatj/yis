/*eslint no-console: ["error", { allow: ["log", "dir"] }] */

import { MongoClient } from 'mongodb';
import assert from 'assert';

export class YisDB {
  constructor(url, table) {

    // Connection URL
    this.dbUrl = url || 'mongodb://localhost:27017/yis';
    this.dbTable = table || 'users';
  }

  testConnection() {
    const URL = this.dbUrl; 
    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      console.log('Testing db connection');
      db.close();
    });
  }

  dropConfig(callback) {
    const URL = this.dbUrl;
    const TABLE = 'config';
    const drop = db => {
      db.collection(TABLE).drop(res => {
        callback(res);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      drop(db, function() {
        db.close();
      });
    });
  }

  setConfig(data, callback) {
    const URL = this.dbUrl;
    const TABLE = 'config';
    const insert = db => {
      db.collection(TABLE).findOneAndUpdate({}, { $set: data }, err => {
        callback(err);
      }, { upsert: true });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      insert(db, function() {
        db.close();
      });
    });
  }

  getConfig(callback) {
    const URL = this.dbUrl;
    const TABLE = 'config';
    const getConfig = db => {
      let cursor = db.collection(TABLE).find({});

      cursor.toArray(function(err, doc) {
        db.close();

        callback(doc, err);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      getConfig(db, function() {
        db.close();
      });
    });
  }

  getUsers(callback, usersWithData) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const getAll = db => {
      let cursor = null;
      if (usersWithData) {
        cursor = db.collection(TABLE).find({
          $or: [
            { pull_requests: { $gt: [] } },
            { comments: { $gt: [] } }
          ]
        });
      } else {
        cursor = db.collection(TABLE).find({});
      } 

      cursor.toArray((err, doc) => {
        db.close();
        callback(doc, err);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      getAll(db);
    });
  }

  findUser(username, callback) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const find = db => {
      let cursor = db.collection(TABLE).find({ $or: [{ gh_username: username }, { slack_username: username }] });

      cursor.toArray(function(err, doc) {
        assert.equal(null, err);
        db.close();
        callback(doc, err);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      find(db);
    });
  }

  insertUser(data, callback) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const insert = db => {
      db.collection(TABLE).insertOne(data, (err, result) => {
        assert.equal(err, null);
        callback(result, err);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      insert(db, function() {
        db.close();
      });
    });
  }

  // used for updating ping times, and resetting prs/comments
  updateUser(username, data, callback) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const update = db => {
      db.collection(TABLE).updateOne(
        { $or: [{ gh_username: username }, { slack_username: username }] },
        {
          $set: data
        }, (err, result) => {
          assert.equal(err, null);
          if (callback) {
            callback(result, err);
          }
        }
      );
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      update(db, function() {
        db.close();
      });
    });
  }

  // used for updating repos, pull requests, comments etc
  updateUsersArrayData(username, insert, data, callback) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const update = db => {
      // TODO: add support for adding multiple fields at once,
      // ie prs and comments at the same time
      let arrayData = {};
      let operation = {};
      for (let [key, value] of Object.entries(data)) {
        arrayData[key] = {
          $each : value
        };
      }

      if (insert) {
        operation = { $addToSet: arrayData };
      } else {
        operation = { $pullAll: data };
      }

      db.collection(TABLE).updateOne(
        { $or: [{ gh_username: username }, { slack_username: username }] },
        operation, (err, result) => {
          assert.equal(err, null);
          if (callback) {
            callback(result, err);
          }
        }
      );
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      update(db, function() {
        db.close();
      });
    });
  }

  removeUser(username, callback) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const remove = db => {
      db.collection(TABLE).deleteOne(
        { $or: [{ gh_username: username }, { slack_username: username }] },
        (err, result) => {
          assert.equal(err, null);
          callback(result, err);
        }
      );
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      remove(db, function() {
        db.close();
      });
    });
  }
}