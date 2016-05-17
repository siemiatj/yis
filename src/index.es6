/*eslint no-console: ["error", { allow: ["log"] }] */
// import request from 'request-promise';
import Bot from 'slackbots';
import { YisDB } from './db_connector';

// Add init step, when running bot for the first time.
// require a list of repositories, or get all of them from
// the gh api. Save them in DB as we'll be traversing data
// per repository
// * allow altering the list of repositories
// We also need an organization name (the owner of the repositories)

function find(arr, params) {
  var result = {};

  arr.forEach(function(item) {
    if (Object.keys(params).every(function(key) { return item[key] === params[key];})) {
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
    this.DBConnection.dropConfig(() => {
      this.DBConnection.setConfig(settings, resp => {
        console.log('Config saved: ', resp);
      });
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
    let message = `Okay ${slackUsername }, setting ${ghUsername} as your GH username.`;

    this.DBConnection.insertUser({
      gh_username: ghUsername,
      slack_username: slackUsername,
      settings: {
        repositories: [],
        pull_requests_ping: 8,
        comments_ping: 8
      },
      pull_requests: [],
      comments: []
    }, (res, err) => {
      if (err) {
        this.postMessage(channel, 'I failed badly. Try again.', { as_user: true });
      } else {
        this.postMessage(channel, message, { as_user: true });
      }
    });
  }

  _addRepo (channel, slackUsername, repos) {
    let reposString = repos.join(',');
    let message = `Okay, adding ${reposString} to your reminders.`;

    this.DBConnection.updateUsersArrayData(slackUsername,
      { 'settings.repositories': repos }, (res, err) => {
        if (err) {
          this.postMessage(channel, 'Is your user already added to my list.' +   
            'Try running `yisbot username <your_gh_username>` first.', { as_user: true });
        } else {
          this.postMessage(channel, message, { as_user: true });
        }
      }
    );
  }

  _removeRepo (channel, slackUsername, repos) {
    let message = `Okay, removing ${repos} from your reminders.`;
    this.postMessage(channel, message, { as_user: true });
    // remove repo from db?
    // create a updateUsersArrayData that uses $pull
  }

  _pr (channel, slackUsername, hour) {
    let message = `Okay, I'll ping you about new pull requests every ${hour} hours.`;
    this.postMessage(channel, message, { as_user: true });
    // update interval and reset desired ping in db?
    // use updateUser
  }

  _comment (channel, slackUsername, hour) {
    let message = `Okay, I'll ping you about new comments every ${hour} hours.`;
    this.postMessage(channel, message, { as_user: true });
    // update interval and reset desired ping in db?
    // use updateUser
  }

  _clear (channel, slackUsername) {
    this.DBConnection.updateUser(slackUsername, { 'settings.repositories': [] }, (res, err) => {
      if (err) {
        this.postMessage(channel, 'Is your user already added to my list.' +   
          'Try running `yisbot username <your_gh_username>` first.', { as_user: true });
      } else {
        this.postMessage(channel, 'Okay, I\'ll clear your GH reminder repos' , { as_user: true });
      }
    });
  }

  _meme (channel) {
    this.postMessage(channel, 'Awww yiss, mf\'ing breadcrumbs!', { as_user: true });
  }

  _help (channel) {
    let message = '```let me know what your GH username is: username <github username>\n' +
    'add a repo to watch for PR\'s and comments: add <repo name>\n' +
    'remove a repo you\'ve previously added: remove <repo name\n' +
    'clear all repo\'s: clear```\n';
    this.postMessage(channel, message, { as_user: true });
  }

  async _reply (originalMessage) {
    // index 0 should be yisbot, 1 command type?, the rest are command's parameters
    let parsedCommand = originalMessage.text.replace(/^yisbot /, '').split(' ');
    let command = parsedCommand.shift();
    let user = await this._getUserById(originalMessage.user);

    switch (command) {
      case 'username': {
        this._username(originalMessage.channel, user.name, parsedCommand);
        break;
      }
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
      case 'breadcrumbs':
        this._meme(originalMessage.channel);
        break;
      default:
        // this.postMessage(originalMessage.channel, 'ayyy, lmao', { as_user: true });
        // no command type
        break;
    }
  }

  _commentMessage(payload) {
    return 'BRAZILLION of comments you haven\'t replied to. You\'re irresponsible, shit !';
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

    // save chanel on bot when initializing it, use hardcoded for now)
    this.postMessage('yis', message, { as_user: true });
  }
}

// let settings = {
//   token: '',
//   name: 'yisbot',
//   repositories: []
// };
// let yisbot = new Yis(settings);
// let params = { icon_url: 'http://www.awyisser.com/assets/images/thumbnail.png' };
// let channels = await yisbot.getChannels();
// let channelID =
//
// yisbot.on('start', params => {
//   yisbot.postMessageToChannel('yis', 'aww yis', params);
// });

// yisbot.on('message', data => {
//   yisbot._onMessage(data);
// });