// module responsible for connecting to github
/*eslint no-console: ["error", { allow: ["log"] }] */
import GitHubApi from 'github4';
import Bluebird from 'bluebird';

export class YisGH {
  constructor() {
    // this.client = new github({ version: '3.0.0' });
    this.client = new GitHubApi({
        // optional
        debug: true
        // protocol: 'https',
        // host: "github.my-GHE-enabled-company.com", // should be api.github.com for GitHub
        // pathPrefix: "/api/v3", // for some GHEs; none for GitHub
        // timeout: 5000,
        // headers: {
        //     'user-agent': 'YIS bot' // GitHub is happy with a unique user agent
        // }
    });

    this.client.authenticate({
      type: 'basic',
      username: '',
      password: ''
    });
  }

  test(resolve, reject) {
    const client = this.client;

    return new Bluebird(() => {
      client.activity.getEventsForOrg({org: 'saucelabs', page: 1}, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Activity ***');

        resolve(data);
      });
    });
  }

  // test function 
  // _test(resolve, reject) {
  //   const client = this.client;

  //   return new Bluebird(() => {
  //     client.repos.getAll({}, function(err, data) {
  //       if (err) {
  //         reject(err);
  //       }
  //       console.log('*** Repositories ***');

  //       resolve(data);
  //     });
  //   });
  // }

  // this gets events form an org. Huuge amount of data.
  // __test(resolve, reject) {
  //   const client = this.client;

  //   return new Bluebird(() => {
  //     client.events.getFromOrg({org: 'saucelabs', page: 1}, function(err, data) {
  //       if (err) {
  //         reject(err);
  //       }
  //       console.log('*** Repositories ***');

  //       resolve(data);
  //     });
  //   });
  // }

  // getNotificationsForUser(resolve, reject) {
  //   const client = this.client;

  //   return new Bluebird(() => {
  //     client.pullRequests.getAll({ user: 'saucelabs', repo: 'yis' }, function(err, data) {
  //       if (err) {
  //         reject(err);
  //       }
  //       console.log('*** Notifications ***');

  //       resolve(data);
  //     });
  //   });
  // }

  getCommentsForRepo(resolve, reject) {
    const client = this.client;

    return new Bluebird(() => {
      client.pullRequests.getCommentsForRepo({ user: 'saucelabs', 
        repo: 'yis', since: '2016-05-07T05:33:32.484Z' }, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Comments for repo ***');

        resolve(data);
      });
    });
  }

  getEventsForRepo(resolve, reject) {
    const client = this.client;

    return new Bluebird(() => {
      client.activity.getEventsForRepo({ user: 'saucelabs', repo: 'yis' }, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Events for repo ***');

        resolve(data);
      });
    });
  }

  // this one works, but returns only publicly available data
  // getEventsForUser(resolve, reject) {
  //   const client = this.client;

  //   return new Bluebird(() => {
  //     client.activity.getEventsForUser({ user: 'saucelabs' }, function(err, data) {
  //       if (err) {
  //         reject(err);
  //       }
  //       console.log('*** Events for user ***');

  //       resolve(data);
  //     });
  //   });
  // }

  // this function should return data from the callback so we can access
  // the data in the cron script
  // getAll(resolve, reject) {
  //   const client = this.client;

  //   return new Bluebird(() => {
  //     client.pullRequests.getAll({ user: 'saucelabs', repo: 'yis', state: 'open' }, function(err, data) {
  //       if (err) {
  //         reject(err);
  //       }
  //       console.log('*** Pull Requests ***');

  //       resolve(data);
  //     });
  //   });
  // }

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
