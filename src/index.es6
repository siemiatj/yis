/*eslint no-console: ["error", { allow: ["log"] }] */
import Bot from 'slackbots';
import { YisDB } from './db_connector';

function find(arr, params) {
  var result = {};

  arr.forEach(function(item) {
    if (Object.keys(params).every(function(key) { return item[key] === params[key]; })) {
      result = item;
    }
  });

  return result;
}

export default class Yis extends Bot {
  constructor(settings) {
    super(settings);

    this.config = settings;
    this.DBConnection = new YisDB();
    this.DBConnection.setConfig(settings, resp => {
      console.log('Config saved: ', resp);
    });
  }

  _getUserById (id) {
    return this.getUsers().then(function(data) {
      return find(data.members, { id: id });
    });
  }

  _isPrivateMessage (message) {
    console.log('_isPrivateMessage', typeof message.channel, message.channel[0], typeof message.channel === 'string' && message.channel[0] === 'D');
    return typeof message.channel === 'string' && message.channel[0] === 'D';
  }

  _isMentioningBot (message) {
    return message.text.toLowerCase().indexOf(this.name) > -1;
  }

  _isFromBot (message) {
    return message.user === this.self.id;
  }

  _isChatMessage (message) {
    return message.type === 'message' && Boolean(message.text);
  }

  _isChannelMessage (message) {
    console.log('channel type: ', message.channel[0]);
    return typeof message.channel === 'string' &&
                  message.channel[0] === 'C';
  }

  _onMessage (message) {
    if (this._isFromBot(message)) { return; }
    if (this._isChatMessage(message) && (this._isMentioningBot(message) || this._isPrivateMessage(message))) {
      this._reply(message);
    }
  }

  _username (channel, slackUsername, ghUsername) {
    ghUsername = ghUsername.join('');
    let message = `Okay ${slackUsername }, setting ${ghUsername} as your GH username.`;

    this.DBConnection.findUser(slackUsername, (res, err) => {
      if (err !== null) {
        this.postMessage(channel, 'I couldn\'t find this user or encountered a DB error.', { as_user: true });
      } else if (res.length) {
        this.DBConnection.updateUser(slackUsername,
          { 'gh_username': ghUsername }, (res, err) => {
            if (err !== null || !res.modifiedCount) {
              this.postMessage(channel, 'I\'ve got a bad feeling about this. Please try again.', { as_user: true });
            } else {
              this.postMessage(channel, message, { as_user: true });
            }
          }
        );
      } else {
        this.DBConnection.insertUser({
          gh_username: ghUsername,
          slack_username: slackUsername,
          settings: {
            repositories: [],
            pull_requests_ping: 8,
            comments_ping: 8
          },
          pull_requests: [],
          comments: [],
          pull_request_last_ping: null,
          comments_last_ping: null
        }, (res, err) => {
          if (err !== null) {
            this.postMessage(channel, 'Stop Dave. Stop Dave. Try again.', { as_user: true });
          } else {
            this.postMessage(channel, message, { as_user: true });
          }
        });
      }
    });
  }

  _remove (channel, slackUsername) {
    this.DBConnection.removeUser(slackUsername, (res, err) => {
      if (!res.deletedCount || err !== null) {
        this.postMessage(channel, 'I\'ve just picked up a fault in the AE35 unit. Error. ', { as_user: true });
      } else {
        let message = `Okay ${slackUsername }, I'm not gonna ping you anymore. You were my favorite...`;
        this.postMessage(channel, message, { as_user: true });
      }
    });
  }

  _me (channel, slackUsername) {
    this.DBConnection.findUser(slackUsername, (res, err) => {
      if (!res.length || err !== null) {
        this.postMessage(channel, 'Without your space helmet, Dave? You\'re going to find that rather difficult.', { as_user: true });
      } else {
        res = res[0];

        let message = `Okay ${slackUsername }, here's what I know about you:
         - github username: ${res.gh_username} as your GH username.
         - repositories you want to get pinged on: ${res.settings.repositories}
         - pull requests ping times (hours): ${res.settings.pull_requests_ping}
         - comments ping times (hours): ${res.settings.comments_ping}`;

        this.postMessage(channel, message, { as_user: true });
      }
    });
  }

  _userPR (channel, slackUsername) {
    this.DBConnection.findUser(slackUsername, (res, err) => {
      if (!res.length || err !== null) {
        this.postMessage(channel, 'Without your space helmet, Dave? You\'re going to find that rather difficult.', { as_user: true });
      } else {
        let user = res[0];
        let message = '';

        if (user.pull_requests.length) {
          message = ['You have ', user.pull_requests, ' pull requests: \n'];
          user.pull_requests.forEach(pr => {
            message.push(pr, '\n');
          });

          message.join('');
        } else {
          message = 'No pull requests for you this time.';
        }

        this.postMessage(channel, message, { as_user: true });
      }
    });
  }

  _addRepo (channel, slackUsername, repos) {
    let reposString = repos.join(', ');
    let message = `Okay, adding ${reposString} to your reminders.`;

    this.DBConnection.updateUsersArrayData(slackUsername, true,
      { 'settings.repositories': repos }, (res, err) => {
        if (err !== null || !res.modifiedCount) {
          this.postMessage(channel, 'My response is, we don\'t have enough fuel for an earlier departure.' +   
            'Try running `yisbot username <your_gh_username>` first.', { as_user: true });
        } else {
          this.postMessage(channel, message, { as_user: true });
        }
      }
    );
  }

  _removeRepo (channel, slackUsername, repos) {
    let reposString = repos.join(', ');
    let message = `Okay, removing ${reposString} from your reminders.`;

    this.DBConnection.updateUsersArrayData(slackUsername, false,
      { 'settings.repositories': repos }, (res, err) => {
        if (err !== null || !res.modifiedCount) {
          this.postMessage(channel, 'This mission is too important for me to allow you to jeopardize it.' +   
            'Try running `yisbot username <your_gh_username>` first.', { as_user: true });
        } else {
          this.postMessage(channel, message, { as_user: true });
        }
      }
    );
  }

  _pr (channel, slackUsername, hour) {
    hour = parseInt(hour[0], 10);
    if (!hour || hour > 72 || hour < 1) {
      this.postMessage(channel, 'Incorrect interval. Supported interval 1-72h', { as_user: true });
    }
    let message = `Okay, I'll ping you about new pull requests every ${hour} hours.`;

    this.DBConnection.updateUser(slackUsername,
      { 'settings.pull_requests_ping': hour }, (res, err) => {
        if (err !== null || !res.modifiedCount) {
          this.postMessage(channel, 'I think you know what the problem is just as well as I do.' +
            'Try running `yisbot username <your_gh_username>` first.', { as_user: true });
        } else {
          this.postMessage(channel, message, { as_user: true });
        }
      }
    );
  }

  _comment (channel, slackUsername, hour) {
    hour = parseInt(hour[0], 10);

    if (!hour || hour > 72 || hour < 1) {
      this.postMessage(channel, 'Incorrect interval. Supported interval 1-72h', { as_user: true });
    }
    let message = `Okay, I'll ping you about new comments every ${hour} hours.`;

    this.DBConnection.updateUser(slackUsername,
      { 'settings.comments_ping': hour }, (res, err) => {
        if (err || !res.modifiedCount) {
          this.postMessage(channel, 'Just what do you think you\'re doing, Dave ?' +   
            'Try running `yisbot username <your_gh_username>` first.', { as_user: true });
        } else {
          this.postMessage(channel, message, { as_user: true });
        }
      }
    );
  }

  _clear (channel, slackUsername) {
    this.DBConnection.updateUser(slackUsername, { 'settings.repositories': [] }, (res, err) => {
      if (err || !res.nModified) {
        this.postMessage(channel, 'Is your user already added to my list ?' +   
          'Try running `yisbot username <your_gh_username>` first.', { as_user: true });
      } else {
        this.postMessage(channel, 'Okay, I\'ll clear your GH reminder repos' , { as_user: true });
      }
    });
  }

  _config (channel) {
    this.DBConnection.getConfig((config, error) => {
      if (error !== null) {
        this.postMessage(channel, 'I\'m sorry, Dave. I\'m afraid I can\'t do that.' , { as_user: true });
      } else {
        config = config[0];
        let message = `Here's my current config:
          - repositories: ${config.repositories}
          - botname: ${config.name}
          - channel: ${config.channel}
          - last gh crawl: ${config.last_run}`;

        this.postMessage(channel, message , { as_user: true });
      }
    });
  }

  _meme (channel, msg) {
    let message = msg || 'Awww yiss, mf\'ing breadcrumbs!';
    this.postMessage(channel, message, { as_user: true });
  }

  _help (channel) {
    let message = 'YISbot commands: \n' +
    '`yisbot ping`: check if bot is alive \n' +
    '`yisbot config`: show configuration the bot was started with \n' +
    '`yisbot username <github username>`: add or change your GitHub username\n' +
    '`yisbot rm`: remove yourself from bot\'s db\n' +
    '`yisbot me`: check user info currently stored in the db\n' +
    '`yisbot prs`: check pull requests currently stored in the db for slack user\n' +
    '`yisbot add <repo name> <repo name>`: add a repos to watch for PR\'s and comments\n' +
    '`yisbot remove <repo name> <repo name>`: remove repos you\'ve previously added\n' +
    '`yisbot clear`: clear all repo\'s\n'+
    '`yisbot pr <hours>`: change ping interval for pull requests (1-72 range)\n' +
    '`yisbot comment <hours>`change ping interval for comments (1-72 range)\n';
    this.postMessage(channel, message, { as_user: true });
  }

  async _reply (originalMessage) {
    let parsedCommand = originalMessage.text.replace(/^yisbot /, '').split(' ');
    let command = parsedCommand.shift();
    let user = await this._getUserById(originalMessage.user);

    switch (command) {
      case 'username': {
        this._username(originalMessage.channel, user.name, parsedCommand);
        break;
      }
      case 'rm': {
        this._remove(originalMessage.channel, user.name);
        break;
      }
      case 'me': {
        this._me(originalMessage.channel, user.name);
        break;
      }
      case 'prs':
        this._userPR(originalMessage.channel, user.name);
        break;
      case 'add':
        this._addRepo(originalMessage.channel, user.name, parsedCommand);
        break;
      case 'remove':
        this._removeRepo(originalMessage.channel, user.name, parsedCommand);
        break;
      case 'clear':
        this._clear(originalMessage.channel, user.name);
        break;
      case 'pr':
        this._pr(originalMessage.channel, user.name, parsedCommand);
        break;
      case 'comment':
        this._comment(originalMessage.channel, user.name, parsedCommand);
        break;
      case 'help':
        this._help(originalMessage.channel);
        break;
      case 'config':
        this._config(originalMessage.channel);
        break;        
      case 'ping':
        this._meme(originalMessage.channel, 'pong');
        break;
      default:
        this._meme(originalMessage.channel);
        break;
    }
  }

  _commentMessage() {
    return 'Messages not supported at the moment.';
  }

  _prMessage(payload) {
    let message = [''];

    if (payload.length) {
      message = ['You have ', payload.length, ' pull requests: \n'];
      payload.forEach(pr => {
        message.push(pr, '\n');
      });
    }

    return message.join('');
  }

  pingUser (slackUsername, prPayload, commentsPayload) {
    let payloadMessage = this._prMessage(prPayload) + this._commentMessage(commentsPayload);
    let message = `Okay @${slackUsername }, this is what I've got for you this time: \n ${payloadMessage}`;

    this.postMessageToUser(slackUsername, message, { as_user: true });
  }
}
