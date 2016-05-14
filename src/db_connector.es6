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
    const drop = function(db) {
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
    const insert = function(db) {
      db.collection(TABLE).insert(data, err => {
        callback(err);
      });
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
    const getConfig = function(db) {
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

  getUsers(callback) {
    const URL = this.dbUrl;
    const TABLE = this.dbTable;
    const getAll = function(db) {
      let cursor = db.collection(TABLE).find({});

      cursor.toArray(function(err, doc) {
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