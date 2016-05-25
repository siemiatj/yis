# What

Yis was a hackathon project of two Sauce Labs engineers - Kuba and Callum. 
It's a slack bot that helps users staying up to date with all the pull requests on GitHub they're assigned to as well
as commits that they were mentioned in.

# How

Bot will periodically hit the GitHub API requesting pull requests and comments on pull requests for configured repositories.
Then it will try to match them with users stored in the database. All matching combinations will be stored and users will
get a private message from bot when the time comes.

# Technologies used

* [MongoDB](https://www.mongodb.com/)
* [NodeJS](https://nodejs.org)
* [ES6/2015](https://babeljs.io/)
* [pm2](https://www.npmjs.com/package/pm2)
* [cron](https://www.npmjs.com/package/node-cron)

# Prerequisites

This bot is meant to be run within organizations having multiple private repositories, but probably it'll also work with normal user accounts. To set it up a user with permissions
to access repositories will be needed as well as a personal token for accessing GitHub API and which can be generated [here](https://github.com/settings/tokens/new).
Other than that, server running the bot needs a `MongoDB` instance running. We also suggest to install `pm2` for managing and monitoring node processes.
See the `setup` file for instruction on how to set up an Amazon EC2 instance for running the bot.

# Configuration

To configure this slack bot you need to edit two files:

## cron.es6

First set the organization name, by changing `gh_org` to your organization's name:
```
const GHClient = new YisGH('gh_org');
```

Next set the previously generated Slack bot token, channel the bot should join and provide an array of repositories
that will get crawled:

```
const botSettings = {
	token: '',
	name: BOTNAME,
	channel: '',
	repositories: [],
	last_run: null
}
```

## gh_client.es6
```
    this.client.authenticate({
      type: 'basic',
      username: '',
      password: ''
    });
```

# Installation 

Because the code was written in ES6/2015 it needs to be transpiled before it will be runnable. In order to do that install required node dependencies:

`npm install`

and then rebuild the code:

`gulp build`

Now you can upload the new `dist` folder to your server.

*We assume you're running pm2 on the server*

On the server go to the folder with your bot's code and run:

```
pm2 start dist/cron.js
```

For a list of other useful pm2 commands go to https://github.com/Unitech/pm2#main-features

# Usage

After bot joins your channel, check if everything is working fine:

```
yisbot ping
>yisbotZ pong
```

If you can see the `pong` message sent by bot, you're good to go.

## Commands

`yisbot help`: show list of available commands
`yisbot ping`: check if bot is alive
`yisbot config`: show configuration the bot was started with
`yisbot username <github username>`: add or change your GitHub username
`yisbot rm`: remove yourself from bot's db
`yisbot me`: check user info currently stored in the db
`yisbot add <repo name> <repo name>`: add a repos to watch for PR's and comments
`yisbot remove <repo name> <repo name>`: remove repos you've previously added
`yisbot clear`: clear all repo's
`yisbot pr <hours>`: change ping interval for pull requests (1-72 range)
`yisbot comment <hours>`change ping interval for comments (1-72 range)

## Sample flow

Let's say, you're bot is configured for repositories `a1`, `b2`, `c3` and your GitHub username is `jack1`:

```
yisbot username jack1
yisbot add a1 b2
yisbot pr 12
yisbot comment 10
yisbot me
```

# Advanced configuration

# Development

# Contribution