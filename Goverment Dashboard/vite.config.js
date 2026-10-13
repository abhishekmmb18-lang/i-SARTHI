import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';
import dns from 'dns';
import {
  handleDeviceIngest,
  handleDeviceHeartbeat,
  getMonitoredDevices,
  handleIncidentAction,
  getAuditTrail,
  getIngestedEvents
} from './server/telemetryBackend.js';

const SUPABASE_HOST = process.env.SUPABASE_HOST || 'caqsenljmkkqlgaudtlk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

let isSupabaseDnsOk = false;
let lastDnsCheckTime = 0;

function checkSupabaseHost() {
  const now = Date.now();
  if (now - lastDnsCheckTime < 20000) {
    return Promise.resolve(isSupabaseDnsOk);
  }
  lastDnsCheckTime = now;
  return new Promise((resolve) => {
    dns.lookup(SUPABASE_HOST, (err) => {
      if (err) {
        isSupabaseDnsOk = false;
        resolve(false);
      } else {
        isSupabaseDnsOk = true;
        resolve(true);
      }
    });
  });
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'isarthi-telemetry-and-proxy-middleware',
      configureServer(server) {
        // 1. Hardware Telemetry Ingestion API (POST /api/v1/ingest)
        server.middlewares.use(async (req, res, next) => {
          const url = req.url.split('?')[0];

          if (url === '/api/v1/ingest' && req.method === 'POST') {
            const body = await parseRequestBody(req);
            const authHeader = req.headers['authorization'] || req.headers['x-device-token'] || '';
            const result = handleDeviceIngest(body, authHeader);
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result.body));
          }

          if (url === '/api/v1/heartbeat' && req.method === 'POST') {
            const body = await parseRequestBody(req);
            const result = handleDeviceHeartbeat(body);
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result.body));
          }

          if (url === '/api/v1/devices' && req.method === 'GET') {
            const devices = getMonitoredDevices();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(devices));
          }

          if (url === '/api/v1/incidents/action' && req.method === 'POST') {
            const body = await parseRequestBody(req);
            const result = handleIncidentAction(body);
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result.body));
          }

          if (url === '/api/v1/audit-trail' && req.method === 'GET') {
            const trail = getAuditTrail();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(trail));
          }

          if (url === '/api/v1/events' && req.method === 'GET') {
            const events = getIngestedEvents();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(events));
          }

          if (url === '/api/v1/status' && req.method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              status: 'OPERATIONAL',
              service: 'iSARTHI National Road Intelligence Telemetry Gateway',
              version: '2.4.0',
              timestamp: new Date().toISOString()
            }));
          }

          // 2. Supabase Node Proxy with non-blocking fast DNS check
          if (req.url.startsWith('/api/supabase/')) {
            const hostOk = await checkSupabaseHost();
            if (!hostOk) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                error: 'Supabase cloud host currently unreachable. Using local telemetry store.',
                fallback: true
              }));
            }

            const cleanPath = req.url.slice('/api/supabase/'.length);
            const fullPath = '/rest/v1/' + cleanPath;

            const options = {
              hostname: SUPABASE_HOST,
              path: fullPath,
              method: req.method || 'GET',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
              },
              timeout: 3000
            };

            const proxyReq = https.request(options, (proxyRes) => {
              res.statusCode = proxyRes.statusCode;
              res.setHeader('Content-Type', 'application/json');
              proxyRes.pipe(res);
            });

            proxyReq.on('timeout', () => {
              proxyReq.destroy();
              if (!res.headersSent) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Supabase timeout', fallback: true }));
              }
            });

            proxyReq.on('error', (err) => {
              if (!res.headersSent) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message, fallback: true }));
              }
            });

            return req.pipe(proxyReq);
          }

          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  }
});
