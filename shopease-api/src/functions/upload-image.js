const { app } = require('@azure/functions');
const jwt = require('jsonwebtoken');
const https = require('https');
const crypto = require('crypto');

// Parse connection string into account name + key
function parseConn(conn) {
  const parts = Object.fromEntries(conn.split(';').map(p => { const i = p.indexOf('='); return [p.slice(0,i), p.slice(i+1)]; }));
  return { account: parts['AccountName'], key: parts['AccountKey'] };
}

// HMAC-SHA256 base64
function hmac(key, str) {
  return crypto.createHmac('sha256', Buffer.from(key, 'base64')).update(str, 'utf8').digest('base64');
}

// Build Shared Key auth header for Azure Blob
function sharedKeyHeader(account, key, method, containerName, blobName, contentType, contentLength, date) {
  const canonRes = `/${account}/${containerName}/${blobName}`;
  const toSign = [
    method, '', '', contentType, '', '', '', '', '', '', '', '',
    `x-ms-blob-type:BlockBlob`,
    `x-ms-date:${date}`,
    `x-ms-version:2020-04-08`,
    canonRes
  ].join('\n');
  const sig = hmac(key, toSign);
  return `SharedKey ${account}:${sig}`;
}

// Upload buffer to blob storage via REST
function uploadBlob(account, key, container, blobName, buffer, contentType) {
  return new Promise((resolve, reject) => {
    const date = new Date().toUTCString();
    const auth = sharedKeyHeader(account, key, 'PUT', container, blobName, contentType, buffer.length, date);
    const options = {
      hostname: `${account}.blob.core.windows.net`,
      path: `/${container}/${blobName}`,
      method: 'PUT',
      headers: {
        'Authorization': auth,
        'x-ms-date': date,
        'x-ms-version': '2020-04-08',
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': contentType,
        'Content-Length': buffer.length
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve();
        else reject(new Error(`Blob upload failed: ${res.statusCode} ${body}`));
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// Create container (ignore if exists)
function createContainer(account, key, container) {
  return new Promise((resolve) => {
    const date = new Date().toUTCString();
    const canonRes = `/${account}/${container}\nrestype:container`;
    const toSign = ['PUT','','','','','','','','','','','',`x-ms-date:${date}`,`x-ms-version:2020-04-08`,`/${account}/${container}\nrestype:container`].join('\n');
    const sig = hmac(key, toSign);
    const auth = `SharedKey ${account}:${sig}`;
    const options = {
      hostname: `${account}.blob.core.windows.net`,
      path: `/${container}?restype=container&comp=acl`,
      method: 'PUT',
      headers: {
        'Authorization': auth,
        'x-ms-date': date,
        'x-ms-version': '2020-04-08',
        'x-ms-blob-public-access': 'blob',
        'Content-Length': 0
      }
    };
    const req = https.request(options, res => { res.resume(); resolve(); });
    req.on('error', () => resolve());
    req.end();
  });
}

app.http('upload-image', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const { token, filename, contentType, data } = body;

    if (!token) return { status: 401, jsonBody: { error: 'Unauthorised' } };
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return { status: 403, jsonBody: { error: 'Admin only' } };
    } catch {
      return { status: 401, jsonBody: { error: 'Unauthorised' } };
    }

    if (!filename || !contentType || !data) {
      return { status: 400, jsonBody: { error: 'filename, contentType and data are required' } };
    }

    const { account, key } = parseConn(process.env.AzureWebJobsStorage);
    const container = 'product-images';
    const ext = (filename.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const blobName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
    const buffer = Buffer.from(data, 'base64');

    await createContainer(account, key, container);
    await uploadBlob(account, key, container, blobName, buffer, contentType);

    const url = `https://${account}.blob.core.windows.net/${container}/${blobName}`;
    return { status: 200, jsonBody: { url } };
  }
});
