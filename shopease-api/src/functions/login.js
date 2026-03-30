const { app } = require('@azure/functions');
const bcrypt = require('bcryptjs');
const { CosmosClient } = require('@azure/cosmos');
const jwt = require('jsonwebtoken');

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const container = client.database('shopease').container('users');

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let body;
    try { body = await request.json(); } catch { body = {}; }

    const { email, password } = body;

    if (!email || !password) {
      return { status: 400, jsonBody: { error: 'Email and password are required.' } };
    }

    const { resources } = await container.items
      .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
      .fetchAll();

    if (resources.length === 0) {
      return { status: 401, jsonBody: { error: 'Incorrect email or password.' } };
    }

    const user = resources[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return { status: 401, jsonBody: { error: 'Incorrect email or password.' } };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      status: 200,
      jsonBody: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
    };
  }
});
