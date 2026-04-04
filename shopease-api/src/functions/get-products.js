const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const container = client.database('shopease').container('products');

app.http('get-products', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const { resources } = await container.items
        .query({ query: 'SELECT * FROM c WHERE c.id = "catalog"' })
        .fetchAll();
      if (resources.length === 0) {
        return { status: 200, jsonBody: { products: null } };
      }
      return { status: 200, jsonBody: { products: resources[0].products } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
