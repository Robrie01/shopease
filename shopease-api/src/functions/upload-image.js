const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const jwt = require('jsonwebtoken');

app.http('upload-image', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    // Auth — admin JWT required
    const auth = (request.headers.get('authorization') || '').replace('Bearer ', '');
    if (!auth) return { status: 401, jsonBody: { error: 'Unauthorised' } };
    try {
      const decoded = jwt.verify(auth, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return { status: 403, jsonBody: { error: 'Admin only' } };
    } catch {
      return { status: 401, jsonBody: { error: 'Unauthorised' } };
    }

    let body;
    try { body = await request.json(); } catch { body = {}; }
    const { filename, contentType, data } = body;

    if (!filename || !contentType || !data) {
      return { status: 400, jsonBody: { error: 'filename, contentType and data are required' } };
    }

    const blobService = BlobServiceClient.fromConnectionString(process.env.AzureWebJobsStorage);
    const containerClient = blobService.getContainerClient('product-images');
    await containerClient.createIfNotExists({ access: 'blob' });

    const ext = filename.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const blobName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(data, 'base64');
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType }
    });

    return { status: 200, jsonBody: { url: blockBlobClient.url } };
  }
});
