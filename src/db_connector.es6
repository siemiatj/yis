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

  setRepositories(data, callback) {
    const URL = this.dbUrl;
    const TABLE = 'repositories';
    const insert = function(db) {
      db.collection(TABLE).insert(data, (err, result) => {
        assert.equal(err, null);
        callback(result);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      insert(db, function() {
        db.close();
      });
    });
  }

  getRepositories(data, callback) {
    const URL = this.dbUrl;
    const TABLE = 'repositories';
    const get = function(db) {
      db.collection(TABLE).find({}, (err, result) => {
        assert.equal(err, null);
        callback(result);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      get(db, function() {
        db.close();
      });
    });
  }

  getUsers(callback) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const getAll = function(db) {
      let cursor = db.collection(TABLE).find({});

      cursor.toArray(function(err, doc) {
        assert.equal(null, err);
        db.close();
        callback(doc);
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
    const find = function(db) {
      let cursor = db.collection(TABLE).find( { 'gh_username': username } );

      cursor.toArray(function(err, doc) {
        assert.equal(null, err);
        db.close();
        callback(doc);
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
    const insert = function(db) {
      db.collection(TABLE).insertOne(data, (err, result) => {
        assert.equal(err, null);
        callback(result);
      });
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      insert(db, function() {
        db.close();
      });
    });
  }

  updateUser(username, data) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const update = (db, callback) => {
      db.collection(TABLE).updateOne(
        { gh_username: username },
        {
          $set: data
        }, (err, result) => {
          assert.equal(err, null);
          callback(result);
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

  removeUser(username) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const remove = function(db, callback) {
      db.collection(TABLE).deleteOne(
        { gh_username: username }, (err, result) => {
          assert.equal(err, null);
          callback(result);
        }
      );
    };

    MongoClient.connect(URL, function(err, db) {
      assert.equal(null, err);
      remove(db, function() {
        console.log('User deleted');
        db.close();
      });
    });
  }
}