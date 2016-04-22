// module responsible for connecting to github
/*eslint no-console: ["error", { allow: ["log"] }] */
import github from 'github';

export class YisGH {
  constructor() {
    this.client = new github({ version: '3.0.0' });
  }

  getAll() {
    this.client.pullRequests.getAll({ user: 'saucelabs', repo: 'yis' }, function(err, data) {
      if (err) { throw err; }
      console.log('*** Pull Requests ***');
      console.log(data);
      console.log('*********************');
    });
  }

  getFromRepo() {
    this.client.events.getFromRepo({ user: 'saucelabs', repo: 'yis' }, function(err, data) {
      console.log('*** Events ***');
      // let eventTypes = { event}
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
      console.log(events);
      console.log('*********************');
    });
  }
}
