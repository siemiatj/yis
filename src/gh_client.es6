// module responsible for connecting to github
/*eslint no-console: ["error", { allow: ["log"] }] */
import github from 'github';
import Bluebird from 'bluebird';

export class YisGH {
  constructor() {
    this.client = new github({ version: '3.0.0' });

    this.client.authenticate({
      type: 'basic',
      username: '',
      password: ''
    });
  }

  test(resolve, reject) {
    const client = this.client;

    return new Bluebird(() => {
      client.repos.getAll({}, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Repositories ***');

        resolve(data);
      });
    });
  }

  // this function should return data from the callback so we can access
  // the data in the cron script
  getAll(resolve, reject) {
    const client = this.client;

    return new Bluebird(() => {
      client.pullRequests.getAll({ user: 'saucelabs', repo: 'yis' }, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Pull Requests ***');

        resolve(data);
      });
    });
  }

  getFromRepo(resolve, reject) {
    const client = this.client;

    return new Bluebird(() => {
      client.events.getFromRepo({ user: 'saucelabs', repo: 'yis' }, function(err, data) {
        if (err) {
          reject(err);
        }

        console.log('*** Events ***');
        let events = {};
        let commitComment = { type: 'CommitCommentEvent' };
        let issueComment = { type: 'IssueCommentEvent' };
        let prComment = { type: 'PullRequestReviewCommentEvent' };

        data.forEach(function(event) {
          if (Object.keys(commitComment).every(function(key) { return event[key] === commitComment[key]; })) {
            events = event;
          }
        });
        data.forEach(function(event) {
          if (Object.keys(issueComment).every(function(key) { return event[key] === issueComment[key]; })) {
            events = event;
          }
        });
        data.forEach(function(event) {
          if (Object.keys(prComment).every(function(key) { return event[key] === prComment[key]; })) {
            events = event;
          }
        });

        resolve(events);
      });
    });
  }
}
