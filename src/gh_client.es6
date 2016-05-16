// module responsible for connecting to github
/*eslint no-console: ["error", { allow: ["log"] }] */
import GitHubApi from 'github4';
import Bluebird from 'bluebird';

export class YisGH {
  constructor(username) {
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
    this.ghUser = username;

    this.client.authenticate({
      type: 'basic',
      username: '',
      password: ''
    });
  }

  test(resolve, reject) {
    const client = this.client;
    const user = this.ghUser;

    return new Bluebird(() => {
      client.activity.getEventsForOrg({org: user, page: 1}, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Activity ***');

        resolve(data);
      });
    });
  }

  // this function should return data from the callback so we can access
  // the data in the cron script
  getPullRequestsForRepo(repository, resolve, reject) {
    const client = this.client;
    const user = this.ghUser;

    return new Bluebird(() => {
      client.pullRequests.getAll({ user: user, repo: repository, page: 1 }, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Pull Requests ***');

        resolve(data);
      });
    });
  }

  getCommentsForRepo(timestamp, resolve, reject) {
    const client = this.client;
    const user = this.ghUser;

    return new Bluebird(() => {
      client.pullRequests.getCommentsForRepo({ user: user, 
        repo: 'encore', since: timestamp }, function(err, data) {
        if (err) {
          reject(err);
        }
        console.log('*** Comments for repo ***');

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
