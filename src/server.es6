/*eslint no-console: ["error", { allow: ["log"] }] */

import Hapi from 'hapi';

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
  method: 'GET',
  path: '/yis',
  handler: function (request, reply) {
    reply('Hello, world!');
  }
});

server.route({
  method: 'GET',
  path: '/yis/auth',
  handler: function (request, reply) {
    reply('Hello auth');
  }
});

server.start(err => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});