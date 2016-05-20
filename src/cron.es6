// module running tasks : github, db operation, slack pinging
/*eslint no-console: ["error", { allow: ["log"] }] */
import 'babel-polyfill';
import { YisDB } from './db_connector';
import { YisGH } from './gh_client';
import Yis from './index';
import cron from 'node-cron';
import Bluebird from 'bluebird';
import moment from 'moment';
import { contains } from 'underscore-node';

const DBConnect = new YisDB();
/*
 * change gh_org to your github organization name
 */
const GHClient = new YisGH('gh_org');
/*
 * Bot settings:
 * token: slack bot token
 * channel: name of the channel where bot should join
 * repositories: what repositories within the organization bot should crawl using GitHub API
 */
const BOTNAME = 'yisbot';
const botSettings = {
  token: '',
  name: BOTNAME,
  channel: '',
  repositories: [],
  last_run: null
};
let YISbot = new Yis(botSettings);
YISbot.on('start', params => {
  YISbot.postMessageToChannel(botSettings.channel, 'aww yis', params);
});
YISbot.on('message', data => {
  YISbot._onMessage(data);
});

let getUsersData = function(filterNotEmpty) {
  return new Bluebird((resolve, reject) => {
    DBConnect.getUsers((users, error) => {
      if (error !== null) reject(error);
      resolve(users);
    }, filterNotEmpty);
  });
};

let resetUsersTimers = async function(usersArray) {
  let timeStamp = new Date().getTime();
  let updateSingleUser = function(username) {
    return new Bluebird((resolve, reject) => {
      let data = {
        pull_requests: [],
        comments: [],
        pull_request_last_ping: timeStamp,
        comments_last_ping: timeStamp
      };
      DBConnect.updateUser(username, data, (config, error) => {
        if (error !== null) reject(error);
        resolve(config);
      });
    });
  };
  let resetPromises = [];
  for (var i=0, l=usersArray.length; i<l; i+=1) {
    resetPromises.push(updateSingleUser.call(null, usersArray[i]));
  }

  return Bluebird.all(resetPromises);
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
    let time = new Date().toISOString();

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

// this function should run quite often
cron.schedule('*/20 * * * *', function () {
  async function checkPing() {
    let usersData = null;
    let usersToUpdate = [];
    let timeNow = moment(new Date());

    try {
      // this could probably already filter out users without any prs/comments
      usersData = await getUsersData(true);
    } catch(error) {
      console.log('Error getting data from the DB: ', error);
      return;
    }

    for (let data of Object.values(usersData)) {
      let timediff = null;
      if (data.pull_request_last_ping) {
        timediff = timeNow.diff(moment(data.pull_request_last_ping), 'hours');
      }

      // check if it's time to ping - if yes, ping user
      if (data.pull_requests.length && (!data.pull_request_last_ping || timediff >= data.settings.pull_requests_ping)) {
        YISbot.pingUser(data.slack_username, data.pull_requests, data.comments);
        // save user that gets updated to clear his pull_request/comments arrays and reset ping timestamps later
        usersToUpdate.push(data.gh_username);
      }
    }

    //update users in the db
    if (usersToUpdate.length) {
      await resetUsersTimers(usersToUpdate);
    }
  }

  checkPing();
});

// this function should only run every hour or so
cron.schedule('0 * * * *', function () {
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
    let assignee = null;
    let username;
    for (repoName in pullRequests) {
      if (pullRequests.hasOwnProperty(repoName)) {
        prs = pullRequests[repoName];
        prs.forEach(pr => {
          assignee = pr.assignee;
          if (assignee) {
            username = assignee.login;

            if (users[username] && contains(users[username].settings.repositories, repoName)) {
              users[username].pull_requests.push(pr.html_url);
            }
          }
        });
      }
    }

    // check comments
      // this is going to be tricky, as we need to parse the whole discussion over a PR
      // and find comments where our user's name was mentioned. And if it was mentioned, we
      // need to see if our user responded to that later, or not

    // save info about user's prs/comments in the db
    for (let [usr, usrData] of Object.entries(users)) {
      // save prs/comments in the DB for the pinging function to use
      // TODO: use updateUsersArrayData instead !!
      DBConnect.updateUser(usr, usrData);
    }

    setSearchTimestamp();
  }

  getData();
});