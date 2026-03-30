const { app } = require('@azure/functions');
const bcrypt = require('bcryptjs');
const { CosmosClient } = require('@azure/cosmos');
const jwt = require('jsonwebtoken');

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const container = client.database('shopease').container('users');

app.http('register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let body;
    try { body = await request.json(); } catch { body = {}; }

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return { status: 400, jsonBody: { error: 'Name, email and password are required.' } };
    }

    if (password.length < 8) {
      return { status: 400, jsonBody: { error: 'Password must be at least 8 characters.' } };
    }

    const { resources } = await container.items
      .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
      .fetchAll();

    if (resources.length > 0) {
      return { status: 409, jsonBody: { error: 'An account with that email already exists.' } };
    }

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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      status: 201,
      jsonBody: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
    };
  }
});
