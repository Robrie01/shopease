const bcrypt = require('bcryptjs');
const { CosmosClient } = require('@azure/cosmos');
const jwt = require('jsonwebtoken');

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const container = client.database('shopease').container('users');

module.exports = async function (context, req) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    context.res = { status: 400, body: { error: 'Email and password are required.' } };
    return;
  }

  // Find user by email
  const { resources } = await container.items
    .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
    .fetchAll();

  if (resources.length === 0) {
    context.res = { status: 401, body: { error: 'Incorrect email or password.' } };
    return;
  }

  const user = resources[0];

  // Check password against the stored hash
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    context.res = { status: 401, body: { error: 'Incorrect email or password.' } };
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  context.res = {
    status: 200,
    body: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  };
};
