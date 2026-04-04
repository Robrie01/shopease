const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const jwt = require('jsonwebtoken');

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const container = client.database('shopease').container('Products');

app.http('save-products', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const { token, products } = body;

    if (!token) return { status: 401, jsonBody: { error: 'Unauthorised' } };
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return { status: 403, jsonBody: { error: 'Admin only' } };
    } catch {
      return { status: 401, jsonBody: { error: 'Unauthorised' } };
    }

    if (!Array.isArray(products)) {
      return { status: 400, jsonBody: { error: 'products array required' } };
    }

    try {
      await container.items.upsert({ id: 'catalog', products });
      return { status: 200, jsonBody: { ok: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
