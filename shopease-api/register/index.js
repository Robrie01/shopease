const bcrypt = require('bcryptjs');
const { CosmosClient } = require('@azure/cosmos');
const jwt = require('jsonwebtoken');

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const container = client.database('shopease').container('users');

module.exports = async function (context, req) {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    context.res = { status: 400, body: { error: 'Name, email and password are required.' } };
    return;
  }

  if (password.length < 8) {
    context.res = { status: 400, body: { error: 'Password must be at least 8 characters.' } };
    return;
  }

  // Check if email already exists
  const { resources } = await container.items
    .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
    .fetchAll();

  if (resources.length > 0) {
    context.res = { status: 409, body: { error: 'An account with that email already exists.' } };
    return;
  }

  // Hash the password (12 rounds = very secure)
  const hash = await bcrypt.hash(password, 12);

  const user = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: hash,
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  await container.items.create(user);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  context.res = {
    status: 201,
    body: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  };
};
