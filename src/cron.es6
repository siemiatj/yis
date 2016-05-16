// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */
import 'babel-polyfill';
import { YisDB } from './db_connector';
import { YisGH } from './gh_client';
import Yis from './index';
import CronJob from 'cron';
import Bluebird from 'bluebird';
import { contains } from 'underscore-node';

const DBConnect = new YisDB();
const GHClient = new YisGH('saucelabs');
const botSettings = {
  token: '',
  name: 'yisbot',
  repositories: ['yis'],
  last_run: null
};
let YISbot = new Yis(botSettings);
YISbot.on('start', params => {
  YISbot.postMessageToChannel('yis', 'aww yis', params);
});
YISbot.on('message', data => {
  YISbot._onMessage(data);
});

let getUsersData = function() {
  return new Bluebird((resolve, reject) => {
    DBConnect.getUsers((users, error) => {
      if (error !== null) reject(error);
      resolve(users);
    });
  });
};

let getIntegrationData = function() {
  return new Bluebird((resolve, reject) => {
    DBConnect.getConfig((config, error) => {
      if (error !== null) reject(error);
      resolve(config);
    });
  });
};

let setSearchTimestamp = () => {
  return new Bluebird((resolve, reject) => {
    let time = new Date().getTime();

    DBConnect.setConfig({ last_run: time }, error => {
      if (error !== null) reject(error);
      resolve();
    });
  });
};

let getPullRequests = repository => {
  return new Bluebird((resolve, reject) => {
    GHClient.getPullRequestsForRepo(repository, ret => {
      resolve(ret);
    }, err => {
      console.log('There was an error : ', err);
      reject(err);
    });
  });
};

// this function runs only a few times a day max (so that it won't exceed )
let collectData = new CronJob.CronJob('00 * * * * *', function () {
  async function getData() {
    let usersData = null;
    let users = {};
    let configRepositories = null;
    let configTime = null;
    let config = null;
    let pullRequests = {};
    // let comments = {};

    try {
      // get users from the db
      usersData = await getUsersData();
      // get config (with repositories and last check timestamp)
      config = await getIntegrationData();
    } catch(error) {
      console.log('Error getting data from the DB: ', error);
    }

    // get timestamp of last API request from the db
    config = config[0];
    configTime = config.last_run;
    // get repos that the bot is set to check from the db
    configRepositories = config.repositories;

    // turn users into an object with gh_username as key 
    // and another object with comments/pull_requests keys as value
    usersData.forEach(usr => {
      users[usr.gh_username] = {
        pull_requests: [],
        comments: [],
        slack_username: usr.slack_username,
        settings: usr.settings
      };
    });

    let prs = null;
    let repoName;
    // let events = null;
    // iterate over repos from config
    for (let i = 0, l = configRepositories.length; i<l; i+=1) {
      repoName = configRepositories[i];
      prs = await getPullRequests(repoName);
      pullRequests[repoName] = prs;
      

      // get events for each repo limited by timestamp (or from start of the day today if 
      // it's the first run) and save them
      // {
      //   <repo_name>: {
      //     comments: []
      //   }
      // }
      // events = await getEvents(repo);
      // comments.push(events);
    }

    // get PR's for each repo and check if users from our list
    // are assigned. If yes - save that in `pull_requests` field in `users` object
    let username = null;
    for (repoName in pullRequests) {
      if (pullRequests.hasOwnProperty(repoName)) {
        prs = pullRequests[repoName];

        prs.forEach(pr => {
          username = pr.assignee.login;
          if (users[username] && contains(users[username].settings.pull_requests, repoName)) {
            users[username].pull_requests.push(pr.html_url);
          }
        });
      }  
    }

    // for each user
    for (let [usr, usrData] of Object.entries(users)) {
      // check prs
      if (usrData.pull_requests.length || usrData.comments.length) {
        YISbot.pingUser(usrData.slack_username, usrData.pull_requests, usrData.comments);
      }
      // check comments
        // this is going to be tricky, as we need to parse the whole discussion over a PR
        // and find comments where our user's name was mentioned. And if it was mentioned, we
        // need to see if our user responded to that later, or not

      // save prs/comments in the DB for the pinging function to use
    }

  // timestamp format : '2016-05-07T05:33:32.484Z'
  // setSearchTimestamp();
  }

  getData();
}, null, true, 'America/Los_Angeles');