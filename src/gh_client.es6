// module responsible for connecting to github
/*eslint no-console: ["error", { allow: ["log"] }] */
import GitHubApi from 'github4';
import Bluebird from 'bluebird';

export class YisGH {
  constructor(username) {
    this.client = new GitHubApi({
      debug: false
    });
    this.ghUser = username;

    /*
     * GitHub integration settings:
     * username: username of GitHub user with access rights
     * password: github application token [https://help.github.com/articles/creating-an-access-token-for-command-line-use/]
     */
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
      client.activity.getEventsForOrg({ org: user, page: 1 }, function(err, data) {
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
}
