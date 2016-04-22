// import request from 'request-promise';
import Bot from 'slackbots';

export default class Yis extends Bot {
  constructor(settings) {
    // request(foo)
    // .then(() => {})
    // .catch(() => {});
    super(settings);
  }

  _isMentioningBot (message) {
    return message.text.toLowerCase().indexOf(this.name) > -1;
  }

  _isFromBot (message) {
    console.log("this: " ,this.self.id); // eslint-disable-line
    return message.user === this.self.id;
  }

  _isChatMessage (message) {
    return message.type === 'message' && Boolean(message.text);
  }

  _isChannelMessage (message) {
    return typeof message.channel === 'string' &&
                  message.channel[0] === 'C';
  }

  _onMessage (message) {
    if (this._isChatMessage(message) && this._isChannelMessage(message) &&
      !this._isFromBot(message) && this._isMentioningBot(message)) {
      console.log("test"); // eslint-disable-line
      this._reply(message);
    }
  }

  async _reply (originalMessage) {
    this.postMessage(originalMessage.channel, 'ayyy, lmao', { as_user: true });
  }
}

let settings = {
  token: 'insertToken'
, name: 'yisbot'
};
let yisbot = new Yis(settings);
// let params = { icon_url: 'http://www.awyisser.com/assets/images/thumbnail.png' };
// let channels = await yisbot.getChannels();
// let channelID =
//
yisbot.on('start', params => {
  yisbot.postMessageToChannel('yis', 'aww yis', params);
});

yisbot.on('message', data => {
  yisbot._onMessage(data);
});