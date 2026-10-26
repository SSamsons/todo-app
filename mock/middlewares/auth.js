const crypto = require('crypto');

const SECRET = 'lab-mock-secret';

function b64url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(unsigned) {
  return crypto.createHmac('sha256', SECRET).update(unsigned).digest('base64url');
}

function makeToken(userId, email) {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url({
    sub: String(userId),
    email,
    exp: Date.now() + 60 * 60 * 1000,
  });
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

function verify(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  if (sign(`${header}.${body}`) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    if (typeof payload.sub !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

function publicUser(user) {
  return { id: String(user.id), email: user.email, name: user.name };
}

function createAuth(router) {
  return function auth(req, res, next) {
    if (req.path === '/login' && req.method === 'POST') {
      const email = String(req.body?.email || '')
        .trim()
        .toLowerCase();
      const password = String(req.body?.password || '');
      const users = router.db.get('users').value();
      const found = users.find((user) => user.email === email && user.password === password);
      if (!found) {
        res.status(401).json({ message: 'неверная почта или пароль' });
        return;
      }
      const token = makeToken(found.id, found.email);
      res.json({ token, refreshToken: token, user: publicUser(found) });
      return;
    }

    if (req.path === '/register' && req.method === 'POST') {
      const email = String(req.body?.email || '')
        .trim()
        .toLowerCase();
      const password = String(req.body?.password || '');
      const name = String(req.body?.name || email.split('@')[0] || 'студент');
      if (!email.includes('@') || password.length < 6) {
        res.status(400).json({ message: 'почта или пароль не подходят' });
        return;
      }
      const users = router.db.get('users').value();
      if (users.some((user) => user.email === email)) {
        res.status(409).json({ message: 'такая почта уже есть' });
        return;
      }
      const created = { id: String(Date.now()), email, password, name };
      router.db.get('users').push(created).write();
      const token = makeToken(created.id, created.email);
      res.status(201).json({ token, refreshToken: token, user: publicUser(created) });
      return;
    }

    if (req.path === '/refresh' && req.method === 'POST') {
      const payload = verify(req.body?.refreshToken);
      if (!payload) {
        res.status(401).json({ message: 'сессия протухла' });
        return;
      }
      const token = makeToken(payload.sub, payload.email);
      res.json({ token, refreshToken: token });
      return;
    }

    if (req.path === '/check-email' && req.method === 'GET') {
      const email = String(req.query.email || '')
        .trim()
        .toLowerCase();
      const users = router.db.get('users').value();
      res.json({ taken: users.some((user) => user.email === email) });
      return;
    }

    const needsAuth = ['/todos', '/users', '/tags', '/tasks', '/profile'].some((prefix) =>
      req.path.startsWith(prefix),
    );
    if (!needsAuth) {
      next();
      return;
    }

    const header = req.headers.authorization || '';
    const payload = header.startsWith('Bearer ') ? verify(header.slice(7)) : null;
    if (!payload) {
      res.status(401).json({ message: 'нужно войти' });
      return;
    }

    if (
      (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') &&
      req.path.startsWith('/todos')
    ) {
      if (req.method === 'POST') {
        const title = req.body?.title;
        if (typeof title !== 'string' || title.trim().length === 0) {
          res.status(400).json({ message: 'пустое название нельзя' });
          return;
        }
      }
      if (req.body && typeof req.body === 'object') {
        req.body.userId = payload.sub;
      }
    }

    next();
  };
}

module.exports = createAuth;
