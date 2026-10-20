import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const LIVE_DB_PATH = path.resolve(process.cwd(), '.erp_live_db.json');

function erpBackendSyncPlugin(): Plugin {
  return {
    name: 'erp-backend-sync-and-drive-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        // Helper to read request body
        const readBody = (): Promise<string> =>
          new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => resolve(body));
            req.on('error', reject);
          });

        const sendJson = (statusCode: number, data: any) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.end(JSON.stringify(data));
        };

        try {
          // 0. Dynamic Short Links generator for active origin
          if (req.url.startsWith('/api/short-links') && req.method === 'GET') {
            const urlObj = new URL(req.url, 'http://localhost');
            const originParam =
              urlObj.searchParams.get('origin') ||
              'https://ais-pre-qocoiluztea3kp4jpja5xz-260768458257.asia-northeast1.run.app';
            let cleanOrigin = originParam.replace(/\/+$/, '');
            if (cleanOrigin.includes('ais-dev-')) {
              cleanOrigin = cleanOrigin.replace('ais-dev-', 'ais-pre-');
            }

            const defaultWork = 'https://ais-pre-qocoiluztea3kp4jpja5xz-260768458257.asia-northeast1.run.app/';
            const defaultClient = 'https://ais-pre-qocoiluztea3kp4jpja5xz-260768458257.asia-northeast1.run.app/?view=client';

            try {
              const [wRes, cRes] = await Promise.all([
                fetch(
                  `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
                    `${cleanOrigin}/`
                  )}`
                ),
                fetch(
                  `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
                    `${cleanOrigin}/?view=client`
                  )}`
                ),
              ]);
              const wUrl = (await wRes.text()).trim();
              const cUrl = (await cRes.text()).trim();
              return sendJson(200, {
                workShortLink: wUrl.startsWith('http') ? wUrl : cleanOrigin,
                clientShortLink: cUrl.startsWith('http') ? cUrl : `${cleanOrigin}/?view=client`,
              });
            } catch {
              return sendJson(200, {
                workShortLink: cleanOrigin,
                clientShortLink: `${cleanOrigin}/?view=client`,
              });
            }
          }

          // 1. Live Cross-Client Database Sync (syncs Dev URL & Shared Client URL automatically)
          if (req.url.startsWith('/api/live-db') && req.method === 'GET') {
            if (fs.existsSync(LIVE_DB_PATH)) {
              const raw = fs.readFileSync(LIVE_DB_PATH, 'utf-8');
              const parsed = JSON.parse(raw);
              return sendJson(200, { status: 'ok', exists: true, data: parsed });
            }
            return sendJson(200, { status: 'ok', exists: false, data: null });
          }

          if (req.url.startsWith('/api/live-db') && req.method === 'POST') {
            const rawBody = await readBody();
            if (!rawBody) return sendJson(400, { status: 'error', message: 'Empty payload' });
            const parsed = JSON.parse(rawBody);
            const payloadToSave = {
              ...parsed,
              serverUpdatedAt: new Date().toISOString(),
            };
            fs.writeFileSync(LIVE_DB_PATH, JSON.stringify(payloadToSave));
            return sendJson(200, {
              status: 'ok',
              serverUpdatedAt: payloadToSave.serverUpdatedAt,
            });
          }

          // 2. Server-Side Google Drive Apps Script Proxy (Zero CORS issues!)
          if (req.url.startsWith('/api/drive-sync') && req.method === 'POST') {
            const rawBody = await readBody();
            const { webAppUrl, payload } = JSON.parse(rawBody || '{}');
            if (!webAppUrl || typeof webAppUrl !== 'string') {
              return sendJson(400, {
                success: false,
                message: 'Google Apps Script URL প্রদান করা হয়নি।',
              });
            }

            const cleanUrl = webAppUrl.trim().replace(/\/dev(\?.*)?$/, '/exec');

            if (cleanUrl.includes('docs.google.com/spreadsheets')) {
              return sendJson(200, {
                success: false,
                message:
                  'আপনি ভুলবশত Google Sheet-এর লিংক দিয়েছেন! গুগল শিটের ভেতর Extensions > Apps Script > Deploy > New deployment থেকে পাওয়া Web App URL (যার শেষে /exec আছে) দিন।',
              });
            }

            const response = await fetch(cleanUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
                Accept: 'application/json, text/plain, */*',
              },
              body: JSON.stringify(payload),
              redirect: 'follow',
            });

            const text = await response.text();

            // Check if Google returned JSON
            try {
              const jsonRes = JSON.parse(text);
              if (jsonRes.status === 'success' || jsonRes.result === 'success') {
                return sendJson(200, {
                  success: true,
                  verified: true,
                  message:
                    jsonRes.message ||
                    'গুগল ড্রাইভ ও শিটে সফলভাবে অটো-ব্যাকআপ সম্পন্ন হয়েছে!',
                  folderUrl: jsonRes.folderUrl || 'https://drive.google.com/drive/my-drive',
                });
              } else {
                return sendJson(200, {
                  success: false,
                  message: `Google Apps Script Error: ${
                    jsonRes.message || 'স্ক্রিপ্ট এক্সিকিউশন ব্যর্থ হয়েছে।'
                  } — সমাধানের জন্য নিচের নতুন "Apps Script (Code.gs)" কপি করে আবার New Deployment দিন।`,
                });
              }
            } catch {
              // Inspect HTML error responses from Google Apps Script
              if (text.includes('Script function not found: doPost')) {
                return sendJson(200, {
                  success: false,
                  message:
                    'আপনার Google Apps Script-এ doPost ফাংশনটি পাওয়া যায়নি! দয়া করে অ্যাপের "Apps Script (Code.gs)" বাটন থেকে সম্পূর্ণ নতুন কোডটি কপি করে Apps Script-এ পেস্ট করুন এবং Deploy > New deployment দিন।',
                });
              }
              if (
                text.includes('ServiceLogin') ||
                text.includes('accounts.google.com') ||
                response.status === 401 ||
                response.status === 403
              ) {
                return sendJson(200, {
                  success: false,
                  message:
                    'গুগল পারমিশন ব্লক করেছে! সমাধান: Apps Script-এ গিয়ে ১) উপরে ফাংশন ড্রপডাউন থেকে setupCompleteInteriorERP সিলেক্ট করে Run চাপুন ও Permission "Allow" করুন, ২) এরপর Deploy > New deployment > Who has access: "Anyone" দিয়ে নতুন লিংকটি এখানে পেস্ট করুন।',
                });
              }
              if (text.includes('Exception:') || text.includes('Error')) {
                const match = text.match(/Exception:[^<]+/);
                return sendJson(200, {
                  success: false,
                  message: `গুগল স্ক্রিপ্ট এরর: ${
                    match ? match[0] : 'অনুমতি বা ফাংশন সমস্যা'
                  }। দয়া করে নতুন Code.gs কোডটি কপি করে পেস্ট করুন ও আবার Deploy করুন।`,
                });
              }

              // If status 200 and no error markers
              if (response.ok) {
                return sendJson(200, {
                  success: true,
                  verified: true,
                  message: 'গুগল ড্রাইভে সফলভাবে ব্যাকআপ ডেটা পাঠানো হয়েছে!',
                  folderUrl: 'https://drive.google.com/drive/my-drive',
                });
              }

              return sendJson(200, {
                success: false,
                message: `গুগল সার্ভার স্ট্যাটাস ${response.status}। দয়া করে Web App URL এবং "Anyone" পারমিশন চেক করুন।`,
              });
            }
          }

          // 3. Pull / Restore latest backup directly from Google Drive / Apps Script Web App
          if (req.url.startsWith('/api/drive-pull') && req.method === 'POST') {
            const rawBody = await readBody();
            const { webAppUrl } = JSON.parse(rawBody || '{}');
            if (!webAppUrl) {
              return sendJson(400, { success: false, message: 'URL পাওয়া যায়নি।' });
            }
            const cleanUrl = webAppUrl.trim().replace(/\/dev(\?.*)?$/, '/exec');
            const response = await fetch(cleanUrl, {
              method: 'GET',
              redirect: 'follow',
            });
            const text = await response.text();
            try {
              const parsed = JSON.parse(text);
              if (parsed && parsed.clients && parsed.projects) {
                return sendJson(200, {
                  success: true,
                  data: parsed,
                  message: 'গুগল ড্রাইভ থেকে সর্বশেষ ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!',
                });
              }
              return sendJson(200, {
                success: false,
                message:
                  parsed.message ||
                  'গুগল ড্রাইভে এখনো কোনো ব্যাকআপ ফাইল পাওয়া যায়নি। আগে একবার Sync Now করুন।',
              });
            } catch {
              return sendJson(200, {
                success: false,
                message:
                  'গুগল ড্রাইভ থেকে ডেটা পড়া যায়নি। আপনার Apps Script কোডে doGet ফাংশন আছে কি না এবং পারমিশন Anyone দেওয়া আছে কি না চেক করুন।',
              });
            }
          }
        } catch (err: any) {
          return sendJson(500, {
            success: false,
            message: `সার্ভার প্রক্সি এরর: ${err.message || 'Unknown error'}`,
          });
        }

        return next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      erpBackendSyncPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          id: '/',
          name: 'Advance System Company Management - ERP',
          short_name: 'AdvanceERP',
          description:
            'Automated 24/7 online & offline ERP and Google Sheets management system for Advance System Company Management.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallbackDenylist: [/^\/api\//],
        },
        devOptions: {
          enabled: false, // Disabled in dev/shared preview to prevent Service Worker blocking Client Link & cross-origin sync
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(
        process.env.GEMINI_API_KEY || process.env.API_KEY || ''
      ),
      'process.env.API_KEY': JSON.stringify(
        process.env.API_KEY || process.env.GEMINI_API_KEY || ''
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
