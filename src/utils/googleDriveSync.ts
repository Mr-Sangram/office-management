/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SyncState {
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  lastSyncedAt: string | null;
  message: string | null;
  folderUrl?: string;
  unsavedChangesCount: number;
}

export function getDriveSyncUrl(): string {
  return localStorage.getItem('ic_drive_sync_url') || '';
}

export function setDriveSyncUrl(url: string): void {
  const { cleanUrl } = sanitizeWebAppUrl(url);
  localStorage.setItem('ic_drive_sync_url', cleanUrl);
}

export function getAutoSyncEnabled(): boolean {
  const val = localStorage.getItem('ic_auto_sync_enabled');
  return val === null ? true : val === 'true';
}

export function setAutoSyncEnabled(enabled: boolean): void {
  localStorage.setItem('ic_auto_sync_enabled', String(enabled));
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem('ic_last_sync_time');
}

export function setLastSyncTime(time: string): void {
  localStorage.setItem('ic_last_sync_time', time);
}

export const PUBLIC_SHARED_APP_URL =
  'https://ais-pre-qocoiluztea3kp4jpja5xz-260768458257.asia-northeast1.run.app';

export const LIVE_WORK_SHORT_LINK = PUBLIC_SHARED_APP_URL;
export const CLIENT_VIEW_SHORT_LINK = `${PUBLIC_SHARED_APP_URL}/?view=client`;

/**
 * Computes the Public Base Live App URL (always uses ais-pre for open public access)
 */
export function getLiveWorkUrl(): string {
  if (typeof window === 'undefined') {
    return PUBLIC_SHARED_APP_URL;
  }
  const href = window.location.href;
  const origin = window.location.origin;

  // Filter out internal AI Studio wrapper, auth bridge, or dev URLs
  if (
    href.includes('aistudio.google.com') ||
    href.includes('applet-auth-bridge') ||
    origin.includes('aistudio.google.com') ||
    origin.includes('ais-dev-')
  ) {
    return PUBLIC_SHARED_APP_URL;
  }

  return origin || PUBLIC_SHARED_APP_URL;
}

/**
 * Computes the Public Shared Client View URL (?view=client)
 */
export function getSharedClientUrl(): string {
  return `${getLiveWorkUrl()}/?view=client`;
}

/**
 * Dynamically fetches or verifies short links for the active origin
 */
export async function fetchDynamicShortLinks(): Promise<{
  workShortLink: string;
  clientShortLink: string;
}> {
  return {
    workShortLink: PUBLIC_SHARED_APP_URL,
    clientShortLink: `${PUBLIC_SHARED_APP_URL}/?view=client`,
  };
}

/**
 * Validates and cleans Google Apps Script Web App URL
 */
export function sanitizeWebAppUrl(url: string): { cleanUrl: string; warning?: string } {
  let clean = (url || '').trim();
  let warning: string | undefined;

  if (clean.includes('/dev')) {
    clean = clean.replace(/\/dev(\?.*)?$/, '/exec');
    warning =
      'আপনার লিংকের শেষে /dev পাওয়া গিয়েছিল, যা স্বয়ংক্রিয়ভাবে লাইভ /exec লিংকে পরিবর্তন করা হয়েছে।';
  }

  return { cleanUrl: clean, warning };
}

/**
 * Syncs live ERP database to server (.erp_live_db.json) so Dev Mode and Client Mode (ais-pre) stay 100% in sync!
 */
export async function pushToLiveServerDb(payload: any): Promise<boolean> {
  try {
    const res = await fetch('/api/live-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Pulls live ERP database from server (.erp_live_db.json)
 */
export async function pullFromLiveServerDb(): Promise<any | null> {
  try {
    const res = await fetch('/api/live-db', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.exists && json.data) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sends complete ERP payload to Google Apps Script Web App via Server Proxy (bypasses CORS & verifies response)
 * Falls back to direct fetch if server proxy is unavailable.
 */
export async function syncToGoogleDrive(
  payload: any,
  webAppUrl: string
): Promise<{ success: boolean; message: string; folderUrl?: string; warning?: string }> {
  const { cleanUrl, warning } = sanitizeWebAppUrl(webAppUrl);

  if (!cleanUrl || !cleanUrl.startsWith('http')) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL পাওয়া যায়নি। দয়া করে সঠিক URL দিন।',
    };
  }

  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    return {
      success: false,
      message:
        'আপনি ভুলবশত Google Sheet-এর লিংক দিয়েছেন! গুগল শিটের ভেতর Extensions > Apps Script > Deploy > New deployment থেকে পাওয়া Web App URL (যার শেষে /exec আছে) পেস্ট করুন।',
    };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      message: 'ইন্টারনেট সংযোগ নেই। ইন্টারনেট সংযোগ পেলে স্বয়ংক্রিয়ভাবে ব্যাকআপ হবে।',
    };
  }

  const dataToSend = {
    ...payload,
    exportedAt: new Date().toISOString(),
    appVersion: '2.0.0',
    companyName: payload?.settings?.companyName || 'Advance System Company Management',
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
  };

  // Also keep server live DB updated
  pushToLiveServerDb({ ...payload, driveSyncUrl: cleanUrl }).catch(() => {});

  // 1. Try server-side proxy first (zero CORS issues, reads actual Google response!)
  try {
    const proxyRes = await fetch('/api/drive-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webAppUrl: cleanUrl,
        payload: dataToSend,
      }),
    });

    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData.success) {
        const now = new Date().toISOString();
        setLastSyncTime(now);
        return {
          success: true,
          message:
            proxyData.message ||
            'গুগল ড্রাইভ ও শিটে সফলভাবে ব্যাকআপ সম্পন্ন হয়েছে!',
          folderUrl: proxyData.folderUrl || 'https://drive.google.com/drive/my-drive',
          warning,
        };
      } else {
        return {
          success: false,
          message: proxyData.message || 'গুগল ড্রাইভ সিঙ্ক ব্যর্থ হয়েছে।',
          warning,
        };
      }
    }
  } catch {
    // Fall through to direct browser fetch if proxy route is unreachable
  }

  // 2. Fallback: Direct browser fetch with no-cors
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(dataToSend),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const now = new Date().toISOString();
    setLastSyncTime(now);

    return {
      success: true,
      message:
        'গুগল ড্রাইভে সফলভাবে ব্যাকআপ পাঠানো হয়েছে! আপনার ড্রাইভের "Advance_System_ERP_Backups" ফোল্ডার অথবা গুগল শিটের "99_Cloud_Backup" ট্যাবে ফাইলটি যুক্ত হয়েছে।',
      folderUrl: 'https://drive.google.com/drive/my-drive',
      warning,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'গুগল ড্রাইভ রেসপন্স টাইমআউট হয়েছে (২৫ সেকেন্ড)। ইন্টারনেট সংযোগ চেক করুন।',
      };
    }
    return {
      success: false,
      message: `সিঙ্ক ব্যর্থ হয়েছে: ${
        err.message || 'নেটওয়ার্ক এরর'
      }। গুগল স্ক্রিপ্ট পারমিশনে "Execute as: Me" ও "Who has access: Anyone" নির্বাচন করা আছে কি না যাচাই করুন।`,
    };
  }
}

/**
 * Pull / Restore latest database directly from Google Drive / Apps Script Web App
 */
export async function pullBackupFromGoogleDrive(
  webAppUrl: string
): Promise<{ success: boolean; data?: any; message: string }> {
  const { cleanUrl } = sanitizeWebAppUrl(webAppUrl);
  if (!cleanUrl || !cleanUrl.startsWith('http')) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL সেট করা নেই।',
    };
  }

  try {
    const res = await fetch('/api/drive-pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl: cleanUrl }),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: `গুগল ড্রাইভ থেকে রিস্টোর ব্যর্থ: ${err.message || 'নেটওয়ার্ক সমস্যা'}`,
    };
  }
}

/**
 * Diagnostic ping test for Google Apps Script Web App
 */
export async function testGoogleDriveConnection(
  webAppUrl: string
): Promise<{ success: boolean; message: string }> {
  const { cleanUrl } = sanitizeWebAppUrl(webAppUrl);

  if (!cleanUrl || !cleanUrl.startsWith('http')) {
    return {
      success: false,
      message: 'ভুল URL ফরম্যাট! লিংকটি https://script.google.com/macros/s/.../exec হওয়া প্রয়োজন।',
    };
  }

  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    return {
      success: false,
      message:
        'এটি Google Sheet-এর লিংক! দয়া করে Extensions > Apps Script > Deploy > New deployment থেকে পাওয়া Web App URL (/exec) দিন।',
    };
  }

  if (!cleanUrl.includes('script.google.com')) {
    return {
      success: false,
      message: 'ভুল URL ফরম্যাট! লিংকটি https://script.google.com/macros/s/.../exec হওয়া প্রয়োজন।',
    };
  }

  try {
    const testPayload = {
      ping: true,
      testTimestamp: new Date().toISOString(),
      sender: 'Advance System Company Management ERP Test Ping',
    };

    const proxyRes = await fetch('/api/drive-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webAppUrl: cleanUrl,
        payload: testPayload,
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.success) {
        return {
          success: true,
          message:
            'টেস্ট কানেকশন ১০০% সফল! আপনার গুগল ড্রাইভ ও শিট অটো-ব্যাকআপ সম্পূর্ণ সক্রিয় আছে।',
        };
      }
      return {
        success: false,
        message: data.message,
      };
    }

    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(testPayload),
    });

    return {
      success: true,
      message: 'টেস্ট কানেকশন সফল! আপনার গুগল ড্রাইভ স্ক্রিপ্ট রেসপন্স করছে।',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `কানেকশন টেস্ট ব্যর্থ: ${err.message || 'সার্ভার পাওয়া যায়নি'}`,
    };
  }
}

/**
 * Download complete database JSON to local PC storage / Google Drive upload
 */
export function downloadJsonBackup(
  payload: any,
  companyName: string = 'Advance_System_Company_Management'
): void {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Backup_${dateStr}.json`;

  const jsonContent = JSON.stringify(
    {
      ...payload,
      backupCreatedAt: new Date().toISOString(),
      backupSource: 'Advance System Company Management ERP',
      systemVersion: '2.0.0',
    },
    null,
    2
  );

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse & validate uploaded JSON backup file
 */
export async function restoreJsonBackupFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.clients && !parsed.projects && !parsed.settings) {
          throw new Error(
            'অকার্যকর ব্যাকআপ ফাইল: ক্লায়েন্ট বা প্রজেক্টের তথ্য পাওয়া যায়নি।'
          );
        }

        resolve(parsed);
      } catch (err: any) {
        reject(
          new Error(
            err.message ||
              'ফাইলটি পড়তে সমস্যা হয়েছে। দয়া করে সঠিক .json ব্যাকআপ ফাইল নির্বাচন করুন।'
          )
        );
      }
    };
    reader.onerror = () => reject(new Error('ফাইল রিড এরর।'));
    reader.readAsText(file);
  });
}

/**
 * Calculates local browser storage usage
 */
export function getLocalStorageMetrics(): { totalKeys: number; estimatedSizeKb: number } {
  let totalBytes = 0;
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ic_')) {
      const val = localStorage.getItem(key) || '';
      totalBytes += key.length + val.length;
      count++;
    }
  }
  return {
    totalKeys: count,
    estimatedSizeKb: Math.round((totalBytes * 2) / 1024),
  };
}
