// import request from 'request-promise';
import Bot from 'slackbots';

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
    // request(foo)
    // .then(() => {})
    // .catch(() => {});
    super(settings);
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
    console.log("channel type: ", message.channel[0]);
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
    this.postMessage(channel, message, { as_user: true });
    // add repo to db?
  }

  _addRepo (channel, repo) {
    let message = `Okay, adding ${repo} to your reminders.`;
    this.postMessage(channel, message, { as_user: true });
    // add repo to db?
  }

  _removeRepo (channel, repo) {
    let message = `Okay, removing ${repo} from your reminders.`;
    this.postMessage(channel, message, { as_user: true });
    // remove repo from db?
  }

  _pr (channel, hour) {
    let message = `Okay, I'll ping you about new pull requests every ${hour} hours.`;
    this.postMessage(channel, message, { as_user: true });
    // update interval and reset desired ping in db?
  }

  _comment (channel, hour) {
    let message = `Okay, I'll ping you about new comments every ${hour} hours.`;
    this.postMessage(channel, message, { as_user: true });
    // update interval and reset desired ping in db?
  }

  _clear (channel) {
    this.postMessage(channel, 'Okay, I\'ll clear your GH reminder timer' , { as_user: true });
    // clear all repos?
  }

  _meme (channel) {
    this.postMessage(channel, 'Awww yiss, mf\'ing breadcrumbs!', { as_user: true });
  }

  _help (channel) {
    let message = "```let me know what your GH username is: username <github username>\n" +
    "add a repo to watch for PR's and comments: add <repo name>\n" +
    "remove a repo you've previously added: remove <repo name\n" +
    "clear all repo's: clear```\n";
    this.postMessage(channel, message, { as_user: true });
  }

  async _reply (originalMessage) {
    // index 0 should be yisbot, 1 command type?, 2 command parameter?
    let message = originalMessage.text.replace(/^yisbot /, '').split(" ");
    switch (message[0]) {
      case "username":
        console.log("username");
        let user = await this._getUserById(originalMessage.user);
        this._username(originalMessage.channel, user.name, message[1]);
        break;
      case "add":
        this._addRepo(originalMessage.channel, message[1]);
        break;
      case "remove":
        this._removeRepo(originalMessage.channel, message[1]);
        break;
      case "clear":
        this._clear(originalMessage.channel);
        break;
      case "pr":
        this._pr(originalMessage.channel, message[1]);
        break;
      case "comment":
        this._comment(originalMessage.channel, message[1]);
        break;
      case "help":
        this._help(originalMessage.channel);
        break;
      case "breadcrumbs":
        this._meme(originalMessage.channel);
        break;
      default:
        // this.postMessage(originalMessage.channel, 'ayyy, lmao', { as_user: true });
        // no command type
        break;
    }
  }
}

let settings = {
  token: 'insertTokenHere'
, name: 'yisbot'
};
let yisbot = new Yis(settings);
let params = { icon_url: 'http://www.awyisser.com/assets/images/thumbnail.png' };
// let channels = await yisbot.getChannels();
// let channelID =
//
yisbot.on('start', params => {
  yisbot.postMessageToChannel('yis', 'aww yis', params);
});

yisbot.on('message', data => {
  yisbot._onMessage(data);
});