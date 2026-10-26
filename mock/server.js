const path = require('path');
const jsonServer = require('json-server');
const createAuth = require('./middlewares/auth');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const rewriter = jsonServer.rewriter(require('./routes.json'));

server.use(jsonServer.defaults());
server.use((req, res, next) => {
  setTimeout(next, 400);
});
server.use(jsonServer.bodyParser);
server.use(createAuth(router));
server.use(rewriter);
server.use(router);

server.listen(3001);
