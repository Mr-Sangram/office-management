/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FolderArchive,
  Download,
  Smartphone,
  Globe,
  FlaskConical,
  Rocket,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Database,
  Bell,
  History,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  RotateCcw,
  Lock,
  Layers,
  Server,
  Terminal,
  GitBranch,
  Link2,
  ExternalLink,
  FileCode2,
} from 'lucide-react';
import {
  CompanySettings,
  ReleaseNotification,
  DataSnapshotBackup,
} from '../../types';
import {
  getProjectSourceFiles,
  triggerZipDownload,
  downloadServerZip,
  ZipFileEntry,
} from '../../utils/zipBuilder';
import {
  LIVE_WORK_SHORT_LINK,
  CLIENT_VIEW_SHORT_LINK,
  getLiveWorkUrl,
  getSharedClientUrl,
  fetchDynamicShortLinks,
} from '../../utils/googleDriveSync';

interface OwnerDeploymentStudioViewProps {
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
  language: 'EN' | 'BN';
  liveAppUrl: string;
  clientViewUrl: string;
  recordCounts: {
    projects: number;
    clients: number;
    payments: number;
    expenses: number;
    workers: number;
    attendance: number;
    materials: number;
    staff: number;
  };
  fullDatabaseJson: string;
  isStagingMode: boolean;
  onToggleStagingMode: (enabled: boolean) => void;
  releaseNotifications: ReleaseNotification[];
  onPublishRelease: (release: Omit<ReleaseNotification, 'id' | 'publishedAt' | 'dataPreservedCount'>) => void;
  onDeleteRelease: (id: string) => void;
  snapshots: DataSnapshotBackup[];
  onCreateSnapshot: (label: string, version: string) => void;
  onRestoreSnapshot: (snapshot: DataSnapshotBackup) => void;
  currentUserName: string;
}

type StudioSubTab = 'zip' | 'playstore' | 'domain' | 'staging' | 'guide';

export const OwnerDeploymentStudioView: React.FC<OwnerDeploymentStudioViewProps> = ({
  settings,
  onSaveSettings,
  language,
  liveAppUrl,
  clientViewUrl,
  recordCounts,
  fullDatabaseJson,
  isStagingMode,
  onToggleStagingMode,
  releaseNotifications,
  onPublishRelease,
  onDeleteRelease,
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  currentUserName,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<StudioSubTab>('zip');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<ZipFileEntry | null>(null);
  const [fileSearch, setFileSearch] = useState('');

  // Play Store Config State
  const [packageId, setPackageId] = useState('com.advancesystem.interiorerp');
  const [appName, setAppName] = useState(settings.companyName || 'Advance System ERP');
  const [appShortName, setAppShortName] = useState('Advance ERP');
  const [appVersionName, setAppVersionName] = useState('2.5.0');
  const [appVersionCode, setAppVersionCode] = useState(25);
  const [sha256Fingerprint, setSha256Fingerprint] = useState(
    'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C'
  );

  // Custom Domain Config State
  const [customDomain, setCustomDomain] = useState('erp.advancesystembd.com');
  const [firebaseProjectId, setFirebaseProjectId] = useState('advance-system-erp');

  // Edit / Staging & Release Notification State
  const [releaseVersion, setReleaseVersion] = useState(
    `v2.${(releaseNotifications.length || 0) + 5}.0`
  );
  const [releaseTitle, setReleaseTitle] = useState(
    language === 'EN'
      ? 'New System Feature & Performance Update'
      : 'নতুন ফিচার ও সিস্টেম আপডেট যুক্ত করা হয়েছে'
  );
  const [releaseSummary, setReleaseSummary] = useState(
    language === 'EN'
      ? 'All existing client, project, payment, and board records are 100% intact. Check out what is new below:'
      : 'আপনার আগের সকল প্রজেক্ট, ক্লায়েন্ট, পেমেন্ট ও বোর্ড হিসাব ১০০% অক্ষত আছে। নতুন যা যা যুক্ত করা হয়েছে:'
  );
  const [releaseAudience, setReleaseAudience] = useState<'All' | 'ClientPortal' | 'TeamOnly'>('All');
  const [changeItems, setChangeItems] = useState<string[]>([
    'প্রজেক্ট অনুযায়ী বোর্ড ও মজুরি অ্যাডিটিভ (Additive) হিসাব যুক্ত করা হয়েছে',
    'অফিস স্টাফদের আগের মাসের বেতন, কিস্তি ও অগ্রিম প্রদানের সুবিধা যুক্ত হয়েছে',
    'কোম্পানি সেটিংস ও সকল শিটের ড্রপডাউন আপডেট করা হয়েছে',
  ]);
  const [newChangeInput, setNewChangeInput] = useState('');
  const [stagingCompanyTagline, setStagingCompanyTagline] = useState(settings.tagline || '');
  const [publishSuccessMsg, setPublishSuccessMsg] = useState(false);
  const [workShortLink, setWorkShortLink] = useState(LIVE_WORK_SHORT_LINK);
  const [clientShortLink, setClientShortLink] = useState(CLIENT_VIEW_SHORT_LINK);
  const [isDownloadingGithubZip, setIsDownloadingGithubZip] = useState(false);
  const [isDownloadingSourceZip, setIsDownloadingSourceZip] = useState(false);
  const [isDownloadingFullZip, setIsDownloadingFullZip] = useState(false);

  React.useEffect(() => {
    fetchDynamicShortLinks().then((links) => {
      setWorkShortLink(links.workShortLink);
      setClientShortLink(links.clientShortLink);
    });
  }, []);

  const totalRecordsCount =
    recordCounts.projects +
    recordCounts.clients +
    recordCounts.payments +
    recordCounts.expenses +
    recordCounts.workers +
    recordCounts.attendance +
    recordCounts.materials +
    recordCounts.staff;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate Play Store files
  const playStoreFiles = useMemo((): ZipFileEntry[] => {
    const cleanHost = (() => {
      try {
        return new URL(liveAppUrl).host;
      } catch {
        return customDomain;
      }
    })();

    const assetLinksJson = JSON.stringify(
      [
        {
          relation: ['delegate_permission/common.handle_all_urls'],
          target: {
            namespace: 'android_app',
            package_name: packageId,
            sha256_cert_fingerprints: [sha256Fingerprint],
          },
        },
      ],
      null,
      2
    );

    const twaManifestJson = JSON.stringify(
      {
        packageId,
        host: cleanHost,
        name: appName,
        launcherName: appShortName,
        display: 'standalone',
        themeColor: '#0f172a',
        navigationColor: '#020617',
        navigationColorDark: '#020617',
        navigationDividerColor: '#1e293b',
        backgroundColor: '#020617',
        enableNotifications: true,
        startUrl: '/?mode=app',
        iconUrl: `https://${cleanHost}/icons/icon-512.svg`,
        maskableIconUrl: `https://${cleanHost}/icons/icon-512.svg`,
        appVersionName,
        appVersionCode,
        shortcuts: [
          {
            name: 'Daily ERP Workspace',
            shortName: 'ERP App',
            url: '/?mode=app',
          },
          {
            name: 'Client Portal View',
            shortName: 'Client View',
            url: '/?mode=client',
          },
        ],
        generatorApp: 'bubblewrap-cli',
        webManifestUrl: `https://${cleanHost}/manifest.json`,
        fallbackType: 'customtabs',
        enableSiteSettingsShortcut: true,
        isChromeOSOnly: false,
      },
      null,
      2
    );

    const capacitorConfigJson = JSON.stringify(
      {
        appId: packageId,
        appName: appName,
        webDir: 'dist',
        bundledWebRuntime: false,
        server: {
          androidScheme: 'https',
          allowNavigation: [cleanHost, customDomain],
        },
      },
      null,
      2
    );

    const playStoreManifestJson = JSON.stringify(
      {
        id: '/?mode=app',
        name: appName,
        short_name: appShortName,
        description: settings.tagline || 'Interior Design & Construction ERP Management System',
        start_url: '/?mode=app',
        scope: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#f59e0b',
        orientation: 'any',
        categories: ['business', 'finance', 'productivity'],
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      null,
      2
    );

    const buildScriptSh = `#!/bin/bash
# ============================================================================
# Google Play Store Android App Bundle (.aab) Generator Script
# Package ID: ${packageId}
# App Name:   ${appName} (${appVersionName})
# ============================================================================

echo "Step 1: Installing Bubblewrap CLI for Google Play Store TWA..."
npm install -g @bubblewrap/cli

echo "Step 2: Generating Android Keystore (Keep upload-keystore.jks safe!)..."
keytool -genkey -v -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000

echo "Step 3: Initializing Android Project from twa-manifest.json..."
bubblewrap build

echo "Done! Upload app-release-bundle.aab to Google Play Console -> Production -> Create new release."
`;

    const playStoreGuideMd = `# Google Play Store আপলোড গাইড (A-to-Z Step-by-Step Guide)

## এই প্যাকেজের ভেতর কী কী ফাইল আছে এবং কোনটার কী কাজ?

1. **\`public/.well-known/assetlinks.json\`**
   - **কাজ:** Google Play Store-এর অ্যাপ যেন ব্রাউজারের উপরের URL বার ছাড়া একদম আসল Native Android App-এর মতো Fullscreen চলে, তার জন্য এই ভেরিফিকেশন ফাইলটি প্রজেক্টের \`public/.well-known/\` ফোল্ডারে থাকে।
2. **\`twa-manifest.json\`**
   - **কাজ:** আপনার অ্যাপের নাম (${appName}), প্যাকেজ আইডি (\`${packageId}\`), আইকন, ভার্সন কোড (${appVersionCode}) এবং স্টার্ট লিংক (\`/?mode=app\`) নির্ধারণ করে।
3. **\`capacitor.config.json\`**
   - **কাজ:** আপনি যদি কখনো অফলাইনে Android Studio দিয়ে সরাসরি APK/AAB বিল্ড করতে চান, তবে এই ফাইলটি কাজ করবে।
4. **\`public/manifest.json\`**
   - **কাজ:** PWA ও Play Store এর আইকন, থিম কালার এবং শর্টকাট কনফিগারেশন।
5. **\`build-playstore-aab.sh\`**
   - **কাজ:** কমান্ড লাইনে ১ ক্লিকে \`.aab\` ফাইল ও Keystore তৈরি করার স্ক্রিপ্ট।

---

## সবচেয়ে সহজ পদ্ধতি (মাত্র ২ মিনিটে কোডিং ছাড়াই .AAB ও .APK ফাইল তৈরি):

1. প্রথমে আপনার লাইভ অ্যাপ লিংকটি কপি করুন:
   \`${liveAppUrl}\`
2. ব্রাউজারে যান: **https://www.pwabuilder.com**
3. বক্সে আপনার লাইভ লিংকটি পেস্ট করে **"Start"** বাটনে ক্লিক করুন।
4. এরপর **"Package for stores"** বাটনে ক্লিক করে **"Google Play"** এর নিচে **"Generate Package"** ক্লিক করুন।
5. সেখানে Package ID দিন: \`${packageId}\` এবং App Name দিন: \`${appName}\`।
6. **"Download Package"** ক্লিক করলেই আপনি সাথে সাথে পেয়ে যাবেন:
   - \`${appShortName}.aab\` (Google Play Console-এ আপলোড করার মূল ফাইল)
   - \`${appShortName}.apk\` (নিজের ফোনে টেস্ট করার ফাইল)
   - \`signing.keystore\` ও \`assetlinks.json\` (এই \`assetlinks.json\` ফাইলটি আপনার প্রজেক্টের \`public/.well-known/assetlinks.json\` এ বসিয়ে দিলেই কাজ শেষ!)

---

## Google Play Console-এ আপলোড করার ধাপ:
1. **https://play.google.com/console** এ লগইন করে **"Create App"** ক্লিক করুন।
2. App Name: \`${appName}\`, Default Language: English/Bengali, App or Game: **App**, Free or Paid: **Free** সিলেক্ট করুন।
3. বাম পাশের মেনু থেকে **Production -> Create new release** এ যান।
4. আপনার ডাউনলোড করা **\`.aab\` (Android App Bundle)** ফাইলটি আপলোড করে **Publish** করে দিন!
`;

    return [
      { path: 'playstore-package/public/.well-known/assetlinks.json', content: assetLinksJson },
      { path: 'playstore-package/twa-manifest.json', content: twaManifestJson },
      { path: 'playstore-package/capacitor.config.json', content: capacitorConfigJson },
      { path: 'playstore-package/public/manifest.json', content: playStoreManifestJson },
      { path: 'playstore-package/build-playstore-aab.sh', content: buildScriptSh },
      { path: 'playstore-package/PLAY_STORE_UPLOAD_GUIDE_BN.md', content: playStoreGuideMd },
    ];
  }, [
    liveAppUrl,
    customDomain,
    packageId,
    appName,
    appShortName,
    appVersionName,
    appVersionCode,
    sha256Fingerprint,
    settings.tagline,
  ]);

  // Generate Custom Domain & Hosting files
  const domainHostingFiles = useMemo((): ZipFileEntry[] => {
    const vercelJson = JSON.stringify(
      {
        rewrites: [{ source: '/(.*)', destination: '/index.html' }],
        headers: [
          {
            source: '/.well-known/assetlinks.json',
            headers: [{ key: 'Content-Type', value: 'application/json' }],
          },
        ],
      },
      null,
      2
    );

    const firebaseJson = JSON.stringify(
      {
        hosting: {
          public: 'dist',
          ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
          rewrites: [
            {
              source: '**',
              destination: '/index.html',
            },
          ],
          headers: [
            {
              source: '/.well-known/assetlinks.json',
              headers: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                },
              ],
            },
          ],
        },
      },
      null,
      2
    );

    const firebaseRc = JSON.stringify(
      {
        projects: {
          default: firebaseProjectId,
        },
      },
      null,
      2
    );

    const netlifyToml = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

    const netlifyRedirects = `/*    /index.html   200\n`;

    const apacheHtaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
`;

    const nginxConf = `server {
    listen 80;
    server_name ${customDomain} www.${customDomain};
    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /.well-known/assetlinks.json {
        default_type application/json;
        add_header Access-Control-Allow-Origin *;
    }
}
`;

    const dnsRecordsTxt = `# ====================================================================
# DNS Records Configuration for Custom Domain: ${customDomain}
# (Google Domains / Cloudflare / Namecheap / GoDaddy / cPanel Zone Editor)
# ====================================================================

# Option A: If connecting to Google Cloud Run / Firebase Hosting:
Type: A       | Host/Name: @     | Value: 199.36.158.100     | TTL: Auto / 3600
Type: CNAME   | Host/Name: www   | Value: ${customDomain}    | TTL: Auto / 3600
Type: CNAME   | Host/Name: erp   | Value: ghs.googlehosted.com. | TTL: Auto / 3600

# Option B: If connecting to Vercel:
Type: A       | Host/Name: @     | Value: 76.76.21.21        | TTL: Auto / 3600
Type: CNAME   | Host/Name: www   | Value: cname.vercel-dns.com. | TTL: Auto / 3600

# After connecting your domain, your permanent links will be:
# 1. Daily Workspace Link: https://${customDomain}/?mode=app
# 2. Client View Link:     https://${customDomain}/?mode=client
`;

    const domainGuideMd = `# Google / Custom Domain দিয়ে ওয়েবসাইট চালানোর সম্পূর্ণ গাইড

## নিজের ডোমেইন (${customDomain}) দিয়ে চালাতে কী কী ফাইল লাগে?

এই প্যাকেজে সব ধরনের সার্ভার ও হোস্টিংয়ের জন্য রেডিমেড কনফিগারেশন ফাইল দেওয়া আছে যেন \`?mode=app\` বা \`?mode=client\` লিংকে কখনো **"Error: Page not found"** না আসে:

1. **\`firebase.json\` ও \`.firebaserc\`** -> Google Firebase Hosting ও Google Cloud ডোমেইনের জন্য।
2. **\`vercel.json\`** -> Vercel-এ ফ্রি কাস্টম ডোমেইন ও অটো আপডেটের জন্য।
3. **\`netlify.toml\` ও \`public/_redirects\`** -> Netlify হোস্টিংয়ের জন্য।
4. **\`public/.htaccess\`** -> সাধারণ cPanel / Shared Hosting-এর \`public_html\` ফোল্ডারের জন্য।
5. **\`nginx.conf\`** -> VPS বা Google Cloud Nginx সার্ভারের জন্য।
6. **\`dns-records.txt\`** -> ডোমেইন কন্ট্রোল প্যানেলে (DNS Management) বসানোর জন্য \`A\` এবং \`CNAME\` রেকর্ড।

---

## ধাপে ধাপে ডোমেইন কানেক্ট করার নিয়ম:

### পদ্ধতি ১: Google Cloud Run / Firebase / Vercel (সবচেয়ে নিরাপদ ও ফ্রি SSL)
1. প্রজেক্টের মূল ফোল্ডারে \`vercel.json\` অথবা \`firebase.json\` ফাইলটি রাখুন।
2. কমান্ড দিন: \`npm run build\` (এতে \`dist\` ফোল্ডার তৈরি হবে)।
3. হোস্টিং ড্যাশবোর্ডে **Custom Domains** অপশনে গিয়ে আপনার ডোমেইন \`${customDomain}\` লিখুন।
4. ডোমেইন কোম্পানির **DNS Settings**-এ গিয়ে \`dns-records.txt\` ফাইলে দেওয়া \`A\` এবং \`CNAME\` রেকর্ড দুটি বসিয়ে Save করুন।
5. ৫-১০ মিনিটের মধ্যে অটোমেটিক HTTPS (SSL Lock) চালু হয়ে যাবে!

### পদ্ধতি ২: সাধারণ cPanel হোস্টিং (Shared Hosting)
1. প্রজেক্টে \`npm run build\` রান করলে \`dist\` নামের একটি ফোল্ডার তৈরি হবে।
2. \`dist\` ফোল্ডারের ভেতরের সব ফাইল এবং এই প্যাকেজের \`public/.htaccess\` ফাইলটি আপনার cPanel-এর \`public_html\` ফোল্ডারে আপলোড করে দিন।
`;

    return [
      { path: 'domain-hosting-package/vercel.json', content: vercelJson },
      { path: 'domain-hosting-package/firebase.json', content: firebaseJson },
      { path: 'domain-hosting-package/.firebaserc', content: firebaseRc },
      { path: 'domain-hosting-package/netlify.toml', content: netlifyToml },
      { path: 'domain-hosting-package/public/_redirects', content: netlifyRedirects },
      { path: 'domain-hosting-package/public/.htaccess', content: apacheHtaccess },
      { path: 'domain-hosting-package/nginx.conf', content: nginxConf },
      { path: 'domain-hosting-package/CNAME', content: customDomain },
      { path: 'domain-hosting-package/dns-records.txt', content: dnsRecordsTxt },
      { path: 'domain-hosting-package/CUSTOM_DOMAIN_GUIDE_BN.md', content: domainGuideMd },
    ];
  }, [customDomain, firebaseProjectId]);

  // Gather all project source files + database + deployment kits
  const allProjectFiles = useMemo((): ZipFileEntry[] => {
    const sourceFiles = getProjectSourceFiles();
    const dbEntry: ZipFileEntry = {
      path: 'database-backup/live_erp_database_backup.json',
      content: fullDatabaseJson,
    };
    const readmeEntry: ZipFileEntry = {
      path: 'README_OWNER_GUIDE_BN.md',
      content: `# ${settings.companyName} - Full ERP Project Archive
Generated At: ${new Date().toLocaleString()}
Total Protected Database Records Included: ${totalRecordsCount}

## কিভাবে এই ZIP ফাইলটি কম্পিউটারে চালাবেন (How to Run Locally):
1. ZIP ফাইলটি Extract করুন।
2. ফোল্ডারের ভেতর Terminal / Command Prompt ওপেন করে রান করুন:
   npm install
   npm run dev
3. ব্রাউজারে ওপেন করুন: http://localhost:3000

## ডাটা সুরক্ষা ও আপডেট নিয়ম (Zero Data Deletion Guarantee):
- আপনার সকল প্রজেক্ট, ক্লায়েন্ট, পেমেন্ট, কারিগর বোর্ড হিসাব ও অফিস স্যালারি ডাটা \`database-backup/live_erp_database_backup.json\` ফাইলে এবং ব্রাউজারের স্টোরেজে সংরক্ষিত থাকে।
- কোডে নতুন কোনো ফিচার বা অপশন যোগ করলে আগের কোনো এন্ট্রি ডিলিট হবে না; শুধু নতুন আপডেট ও নোটিফিকেশন যুক্ত হবে।
`,
    };
    return [...sourceFiles, dbEntry, ...playStoreFiles, ...domainHostingFiles, readmeEntry];
  }, [fullDatabaseJson, playStoreFiles, domainHostingFiles, settings.companyName, totalRecordsCount]);

  const filteredProjectFiles = useMemo(() => {
    if (!fileSearch.trim()) return allProjectFiles;
    const q = fileSearch.toLowerCase();
    return allProjectFiles.filter((f) => f.path.toLowerCase().includes(q));
  }, [allProjectFiles, fileSearch]);

  const handleDownloadGitHubReadyZip = async () => {
    setIsDownloadingGithubZip(true);
    try {
      await downloadServerZip(
        '/api/download-github-zip',
        'advance-erp-github-ready.zip',
        () => getProjectSourceFiles()
      );
    } catch {
      await triggerZipDownload(getProjectSourceFiles(), 'advance-erp-github-ready.zip');
    } finally {
      setIsDownloadingGithubZip(false);
    }
  };

  const handleDownloadFullZip = async () => {
    setIsDownloadingFullZip(true);
    try {
      await downloadServerZip(
        '/api/download-github-zip',
        'Advance_System_GitHub_Vercel_Ready.zip',
        () => allProjectFiles
      );
    } catch {
      const dateStamp = new Date().toISOString().slice(0, 10);
      await triggerZipDownload(allProjectFiles, `Advance_System_Full_Project_${dateStamp}.zip`);
    } finally {
      setIsDownloadingFullZip(false);
    }
  };

  const handleDownloadSourceOnlyZip = async () => {
    setIsDownloadingSourceZip(true);
    try {
      const dateStamp = new Date().toISOString().slice(0, 10);
      await triggerZipDownload(getProjectSourceFiles(), `Advance_System_Source_Code_${dateStamp}.zip`);
    } finally {
      setIsDownloadingSourceZip(false);
    }
  };

  const handleDownloadPlayStoreZip = async () => {
    await triggerZipDownload(playStoreFiles, `Google_Play_Store_Package_${packageId}.zip`);
  };

  const handleDownloadDomainZip = async () => {
    await triggerZipDownload(domainHostingFiles, `Custom_Domain_Hosting_Files_${customDomain}.zip`);
  };

  const handleAddChangeItem = () => {
    const trimmed = newChangeInput.trim();
    if (!trimmed) return;
    setChangeItems((prev) => [...prev, trimmed]);
    setNewChangeInput('');
  };

  const handleRemoveChangeItem = (idx: number) => {
    setChangeItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublishUpdateAndNotify = () => {
    if (changeItems.length === 0) return;

    // 1. Automatically create a pre-release snapshot backup so zero data can ever be lost
    onCreateSnapshot(`Pre-Release Auto Backup (${releaseVersion})`, releaseVersion);

    // 2. Apply any staged non-destructive settings changes while keeping 100% of existing dropdowns & data intact
    onSaveSettings({
      ...settings,
      tagline: stagingCompanyTagline || settings.tagline,
      invoiceFooterNote: stagingInvoiceFooter || settings.invoiceFooterNote,
    });

    // 3. Publish the Release Notification so Client View & Team members see what changed
    onPublishRelease({
      version: releaseVersion,
      title: releaseTitle,
      summary: releaseSummary,
      changes: changeItems,
      publishedBy: currentUserName || 'Owner',
      audience: releaseAudience,
    });

    // 4. Turn off staging mode after publishing to live
    if (isStagingMode) {
      onToggleStagingMode(false);
    }

    setPublishSuccessMsg(true);
    setTimeout(() => setPublishSuccessMsg(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Owner Exclusive Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-emerald-500/15 border border-amber-500/30 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {language === 'EN'
                  ? 'OWNER EXCLUSIVE CONTROL STUDIO'
                  : 'শুধুমাত্র ওনারের জন্য সংরক্ষিত কন্ট্রোল স্টুডিও (Owner Only)'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {language === 'EN'
                ? 'Project ZIP, Play Store, Custom Domain & Safe Update Center'
                : 'প্রজেক্ট ZIP, Play Store, ডোমেইন ও নিরাপদ আপডেট সেন্টার'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl">
              {language === 'EN'
                ? 'Download all project files in one ZIP, generate Google Play Store & Custom Domain files, test changes safely in Staging Mode, and publish updates with automatic Client notifications without losing any existing data.'
                : 'পুরো প্রজেক্টের সব ফাইল এক ক্লিকে ZIP ডাউনলোড করুন, Google Play Store ও Custom Domain-এর ফাইল তৈরি করুন এবং আগের কোনো ডাটা ডিলিট না করে টেস্ট করে পাবলিক আপডেট ও নোটিফিকেশন পাঠান।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadFullZip}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs md:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              <span>
                {language === 'EN'
                  ? `Download Full Project ZIP (${allProjectFiles.length} Files)`
                  : `সব ফাইল একসাথে ZIP ডাউনলোড (${allProjectFiles.length}টি ফাইল)`}
              </span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs for the 5 Requested Owner Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-6 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('zip')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeSubTab === 'zip'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">
                {language === 'EN' ? '1. All Files ZIP' : '১. প্রজেক্টের সব ফাইল ZIP'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {allProjectFiles.length}টি সোর্স ও ডাটা ফাইল
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('playstore')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeSubTab === 'playstore'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">
                {language === 'EN' ? '2. Google Play Store' : '২. Google Play Store ফাইল'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                AAB, TWA ও আপলোড গাইড
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('domain')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeSubTab === 'domain'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">
                {language === 'EN' ? '3. Custom Domain' : '৩. Google / ডোমেইন ফাইল'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                DNS, SSL ও সার্ভার ফাইল
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('staging')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeSubTab === 'staging'
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">
                {language === 'EN' ? '4. Edit, Test & Publish' : '৪. এডিট, টেস্ট ও পাবলিক'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                ডাটা সুরক্ষা ও নোটিফিকেশন
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
              activeSubTab === 'guide'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">
                {language === 'EN' ? '5. Complete Guide' : '৫. সব কাজের পূর্ণাঙ্গ গাইড'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                A-to-Z বাংলা নির্দেশিকা
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* OPTION 1: FULL PROJECT ZIP, GITHUB/VERCEL & COMPLETE LINKS HUB       */}
      {/* ===================================================================== */}
      {activeSubTab === 'zip' && (
        <div className="space-y-6">
          {/* GitHub & Vercel 24/7 Deployment Master Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/40">
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  <span>GitHub ও Vercel ২৪/৭ লাইভ ডেপ্লয়মেন্ট বান্ডেল</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                  <span>Advance ERP • GitHub &amp; Vercel 24/7 Ready Package</span>
                </h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  এই জিপ ফাইলটি বিশেষভাবে GitHub ও Vercel-এ ২৪ ঘণ্টা লাইভ রাখার জন্য প্রস্তুত করা হয়েছে। এতে <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded font-mono">vercel.json</code>, <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded font-mono">package.json</code>, সম্পূর্ণ <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded font-mono">src/</code> ও <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded font-mono">public/</code> ফোল্ডার সাজানো আছে। WinRAR বা 7-Zip-এ কোনো ফরম্যাট বা ড্যামেজ এরর আসবে না।
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
                <button
                  type="button"
                  onClick={handleDownloadGitHubReadyZip}
                  disabled={isDownloadingGithubZip}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isDownloadingGithubZip
                      ? 'জিপ ফাইল ডাউনলোড হচ্ছে...'
                      : 'Download GitHub & Vercel ZIP (.ZIP)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick deployment instructions checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ১
                </span>
                <div>
                  <span className="font-bold text-white block">ZIP ফাইল আনজিপ করুন</span>
                  <span className="text-[11px] text-slate-400">ডাউনলোড করা জিপ এক্সট্র্যাক্ট করে ফোল্ডারটি ওপেন করুন।</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ২
                </span>
                <div>
                  <span className="font-bold text-white block">GitHub রেপোতে আপলোড করুন</span>
                  <span className="text-[11px] text-slate-400">নতুন GitHub রিপোজিটরি তৈরি করে ফাইলগুলো পুশ বা আপলোড করুন।</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ৩
                </span>
                <div>
                  <span className="font-bold text-white block">Vercel-এ ইমপোর্ট করুন</span>
                  <span className="text-[11px] text-slate-400">Vercel এ Import Git Repository দিলে অটোমেটিক ২৪/৭ ডিপ্লয় হবে।</span>
                </div>
              </div>
            </div>
          </div>

          {/* Complete Links Hub (সব লিংক এক জায়গায়) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === 'EN'
                    ? 'Project Complete Public & Work Links Hub'
                    : 'প্রজেক্টের সকল পাবলিক ও ওয়ার্ক লিংক হাব (যেকোনো ব্রাউজারে ওপেন হবে)'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">ক্লিক করে লিংক কপি অথবা সরাসরি ভিজিট করুন</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Direct Public Link */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>১. সরাসরি পাবলিক লিংক</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getLiveWorkUrl(), 'live-work-pub')}
                    className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'live-work-pub' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'live-work-pub' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
                <a
                  href={getLiveWorkUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-white hover:text-emerald-300 underline font-semibold text-[11px] break-all block"
                >
                  {getLiveWorkUrl()}
                </a>
                <p className="text-[10px] text-slate-400 leading-normal">
                  যেকোনো ফোন, কম্পিউটার বা ব্রাউজারে ওপেন হবে।
                </p>
              </div>

              {/* Daily Work Short Link */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-amber-400" />
                    <span>২. দৈনন্দিন কাজের শর্ট লিংক</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(workShortLink, 'work-short')}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'work-short' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'work-short' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
                <a
                  href={workShortLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-white hover:text-amber-300 underline font-semibold text-[11px] break-all block"
                >
                  {workShortLink}
                </a>
                <p className="text-[10px] text-slate-400 leading-normal">
                  প্রতিদিনের কাজের জন্য বুকমার্ক করে রাখুন।
                </p>
              </div>

              {/* Client View Short Link */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 text-xs flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>৩. ক্লায়েন্ট ভিউ লিংক</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getSharedClientUrl(), 'client-short')}
                    className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'client-short' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'client-short' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
                <a
                  href={getSharedClientUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-white hover:text-sky-300 underline font-semibold text-[11px] break-all block"
                >
                  {getSharedClientUrl()}
                </a>
                <p className="text-[10px] text-slate-400 leading-normal">
                  ক্লায়েন্টদের দেওয়ার জন্য সুরক্ষিত রিড-অনলি লিংক।
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-bold">
                  <FolderArchive className="w-4 h-4" />
                  <span>সম্পূর্ণ প্রজেক্ট + ডাটাবেজ + ডেপ্লয়মেন্ট কিট</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  সব ফাইল এক জায়গায় ZIP ডাউনলোড
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  এই ১টি ZIP ফাইলের ভেতর আপনার প্রজেক্টের সকল সোর্স কোড (`src/`, `public/`, `package.json`), বর্তমান লাইভ ডাটাবেজ ব্যাকআপ (`JSON`), Play Store কনফিগ এবং Custom Domain ফাইল একসাথে সাজানো আছে।
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadFullZip}
                disabled={isDownloadingFullZip}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloadingFullZip
                    ? 'তৈরি হচ্ছে...'
                    : 'Download Complete Project (.ZIP)'}
                </span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-bold">
                  <FileCode className="w-4 h-4" />
                  <span>শুধুমাত্র সোর্স কোড ফাইলসমূহ</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Source Code Only (.ZIP)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  VS Code, GitHub বা অন্য যেকোনো কোড এডিটরে ওপেন করে কাস্টমাইজ বা টেস্ট করার জন্য পরিষ্কার React + TypeScript + Vite প্রজেক্ট ফোল্ডার।
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSourceOnlyZip}
                disabled={isDownloadingSourceZip}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloadingSourceZip
                    ? 'তৈরি হচ্ছে...'
                    : 'Download Source Code (.ZIP)'}
                </span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-bold">
                  <Database className="w-4 h-4" />
                  <span>লাইভ ডাটাবেজ সুরক্ষা ({totalRecordsCount}টি এন্ট্রি)</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Play Store ও Domain রেডি বান্ডেল
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  আপনার বর্তমান সকল প্রজেক্ট ({recordCounts.projects}), ক্লায়েন্ট ({recordCounts.clients}), কারিগর ({recordCounts.workers}) ও হাজিরা ({recordCounts.attendance}) ডাটা এই ZIP-এর ভেতর সুরক্ষিত থাকে।
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPlayStoreZip}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Play Store ZIP</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDomainZip}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Domain ZIP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Project File Browser & Inspector */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>প্রজেক্টের সকল ফাইলের তালিকা ({filteredProjectFiles.length}টি ফাইল)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  যেকোনো ফাইলের নামের পাশে &ldquo;View Code&rdquo; বাটনে ক্লিক করে কোড দেখতে বা কপি করতে পারবেন।
                </p>
              </div>
              <input
                type="text"
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="ফাইলের নাম খুঁজুন (যেমন: App.tsx, manifest, LabourView)..."
                className="w-full sm:w-72 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-6 max-h-[460px] overflow-y-auto divide-y divide-slate-800/70 border-b lg:border-b-0 lg:border-r border-slate-800">
                {filteredProjectFiles.map((file) => {
                  const isSelected = selectedPreviewFile?.path === file.path;
                  const sizeKb = (new Blob([file.content]).size / 1024).toFixed(1);
                  return (
                    <div
                      key={file.path}
                      className={`px-4 py-2.5 flex items-center justify-between gap-2 text-xs transition ${
                        isSelected ? 'bg-amber-500/15 text-amber-200' : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono truncate">{file.path}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500">{sizeKb} KB</span>
                        <button
                          onClick={() => setSelectedPreviewFile(file)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-6 bg-slate-950 p-4 flex flex-col justify-between max-h-[460px]">
                {selectedPreviewFile ? (
                  <div className="flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-amber-300 truncate">
                        {selectedPreviewFile.path}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            copyToClipboard(selectedPreviewFile.content, selectedPreviewFile.path)
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === selectedPreviewFile.path ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy File</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <pre className="flex-1 overflow-auto text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      {selectedPreviewFile.content.slice(0, 12000)}
                      {selectedPreviewFile.content.length > 12000
                        ? '\n\n... [Full file included in ZIP download] ...'
                        : ''}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                    <FileCode className="w-10 h-10 text-slate-700" />
                    <p className="text-xs font-semibold text-slate-400">
                      বাম পাশের তালিকা থেকে যেকোনো ফাইলের &ldquo;View&rdquo; বাটনে ক্লিক করলে তার ভেতরের কোড এখানে দেখতে পাবেন।
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* OPTION 2: GOOGLE PLAY STORE UPLOAD PACKAGE & STEP-BY-STEP GUIDE       */}
      {/* ===================================================================== */}
      {activeSubTab === 'playstore' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border border-emerald-500/30 p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>Google Play Store আপলোড কনফিগারেশন ও ফাইল জেনারেটর</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  ভবিষ্যতে যেকোনো সময় আপনার এই প্রজেক্টটি Google Play Store-এ আপলোড করতে যে সকল ফাইল (`.aab`, `assetlinks.json`, `twa-manifest.json`, `capacitor.config.json`) প্রয়োজন হবে, তা নিচে রেডি করা আছে।
                </p>
              </div>
              <button
                onClick={handleDownloadPlayStoreZip}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shrink-0 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Play Store এর সব ফাইল (.ZIP) ডাউনলোড করুন</span>
              </button>
            </div>

            {/* Play Store Settings Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Android Package ID (ইউনিক অ্যাপ আইডি)
                </label>
                <input
                  type="text"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Play Store App Name (পূর্ণ নাম)
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Phone Home Screen Short Name
                </label>
                <input
                  type="text"
                  value={appShortName}
                  onChange={(e) => setAppShortName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  App Version Name (যেমন: 2.5.0)
                </label>
                <input
                  type="text"
                  value={appVersionName}
                  onChange={(e) => setAppVersionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Version Code (সংখ্যা, প্রতি আপডেটে +1 বাড়বে)
                </label>
                <input
                  type="number"
                  value={appVersionCode}
                  onChange={(e) => setAppVersionCode(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  SHA-256 Signing Certificate Fingerprint
                </label>
                <input
                  type="text"
                  value={sha256Fingerprint}
                  onChange={(e) => setSha256Fingerprint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* List of Files Under Play Store Package */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-emerald-300">
                Play Store প্যাকেজের আন্ডারে যে ৬টি ফাইল থাকবে:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playStoreFiles.map((file) => (
                  <div
                    key={file.path}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-300 truncate">
                        {file.path}
                      </span>
                      <button
                        onClick={() => copyToClipboard(file.content, file.path)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === file.path ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded-lg max-h-36 overflow-auto border border-slate-800/80">
                      {file.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Play Store Guide */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>কীভাবে Google Play Store-এ অ্যাপটি আপলোড করবেন? (সহজ ৪টি ধাপ)</span>
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  <strong className="text-white">ধাপ ১ (PWABuilder দিয়ে ২ মিনিটে .AAB ফাইল তৈরি):</strong>{' '}
                  ব্রাউজারে <code className="text-emerald-300 font-mono">https://www.pwabuilder.com</code> ওপেন করে আপনার লাইভ অ্যাপ লিংক (<code className="text-amber-300 font-mono">{liveAppUrl}</code>) পেস্ট করুন এবং <strong>Package for Stores &rarr; Google Play</strong> সিলেক্ট করুন।
                </li>
                <li>
                  <strong className="text-white">ধাপ ২ (প্যাকেজ আইডি ও ফাইল ডাউনলোড):</strong>{' '}
                  সেখানে Package ID হিসেবে <code className="text-emerald-300 font-mono">{packageId}</code> দিন এবং ডাউনলোড করুন। আপনি <code className="text-emerald-300 font-mono">.aab</code> (Android App Bundle), <code className="text-emerald-300 font-mono">.apk</code>, এবং <code className="text-emerald-300 font-mono">assetlinks.json</code> ফাইল পাবেন।
                </li>
                <li>
                  <strong className="text-white">ধাপ ৩ (assetlinks.json যুক্ত করা):</strong>{' '}
                  ডাউনলোড করা <code className="text-emerald-300 font-mono">assetlinks.json</code> ফাইলটি আপনার প্রজেক্টের <code className="text-emerald-300 font-mono">public/.well-known/assetlinks.json</code> লোকেশনে রাখুন (যাতে অ্যাপের ভেতর উপরের ব্রাউজার বার না দেখায়)।
                </li>
                <li>
                  <strong className="text-white">ধাপ ৪ (Google Play Console-এ পাবলিশ):</strong>{' '}
                  <code className="text-emerald-300 font-mono">https://play.google.com/console</code> এ গিয়ে <strong>Create App &rarr; Production &rarr; Create new release</strong>-এ আপনার <code className="text-emerald-300 font-mono">.aab</code> ফাইলটি আপলোড করে <strong>Save &amp; Publish</strong> দিন। ভবিষ্যতে ওয়েব অ্যাপে যা আপডেট করবেন, Play Store-এর অ্যাপেও তা অটোমেটিক আপডেট হয়ে যাবে!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* OPTION 3: GOOGLE / CUSTOM DOMAIN SETUP FILES & GUIDE                  */}
      {/* ===================================================================== */}
      {activeSubTab === 'domain' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <span>Google / Custom Domain দিয়ে চালানোর সকল সার্ভার ফাইল ও গাইড</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  নিজের কোম্পানির ডোমেইনে (যেমন: <code className="text-cyan-300">erp.yourcompany.com</code>) অ্যাপটি হোস্ট করতে যে সকল রাউটিং ও DNS ফাইল প্রয়োজন, সেগুলো নিচে প্রস্তুত করা আছে।
                </p>
              </div>
              <button
                onClick={handleDownloadDomainZip}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shrink-0 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Domain ও Hosting এর সব ফাইল (.ZIP) ডাউনলোড করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  আপনার কাস্টম ডোমেইন নাম (Custom Domain Name)
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="যেমন: erp.advancesystembd.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Google Firebase / Cloud Project ID (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={firebaseProjectId}
                  onChange={(e) => setFirebaseProjectId(e.target.value)}
                  placeholder="advance-system-erp"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Preview of Custom Domain Short Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  ডোমেইন কানেক্ট করার পর আপনার প্রতিদিনের কাজের লিংক হবে:
                </div>
                <div className="text-xs font-mono font-bold text-amber-300 mt-1">
                  https://{customDomain}/?mode=app
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  ডোমেইন কানেক্ট করার পর ক্লায়েন্ট ভিউ লিংক হবে:
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300 mt-1">
                  https://{customDomain}/?mode=client
                </div>
              </div>
            </div>

            {/* List of Domain Hosting Config Files */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-cyan-300">
                ডোমেইন দিয়ে চালানোর জন্য যে ১০টি ফাইল এই প্যাকেজে আছে:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domainHostingFiles.map((file) => (
                  <div
                    key={file.path}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300 truncate">
                        {file.path}
                      </span>
                      <button
                        onClick={() => copyToClipboard(file.content, file.path)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === file.path ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded-lg max-h-36 overflow-auto border border-slate-800/80">
                      {file.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* OPTION 4: EDIT, TEST MODE (STAGING) & PUBLIC RELEASE + NOTIFICATION   */}
      {/* ===================================================================== */}
      {activeSubTab === 'staging' && (
        <div className="space-y-6">
          {/* Zero Data Deletion Guarantee Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>১০০% ডাটা সুরক্ষা গ্যারান্টি (Zero Data Loss Update Engine)</span>
              </div>
              <h3 className="text-base font-bold text-white">
                নতুন কিছু অ্যাড বা আপডেট করলে ক্লায়েন্ট বা প্রজেক্টের আগের কোনো ডাটা ডিলিট হবে না!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                আপনার সিস্টেমে বর্তমানে <strong>{recordCounts.projects}টি প্রজেক্ট</strong>,{' '}
                <strong>{recordCounts.clients} জন ক্লায়েন্ট</strong>,{' '}
                <strong>{recordCounts.payments}টি পেমেন্ট</strong>,{' '}
                <strong>{recordCounts.workers} জন কারিগর</strong>,{' '}
                <strong>{recordCounts.attendance}টি হাজিরা/বোর্ড এন্ট্রি</strong> এবং{' '}
                <strong>{recordCounts.staff} জন অফিস স্টাফ</strong> সহ মোট{' '}
                <strong className="text-emerald-300">{totalRecordsCount}টি রেকর্ড</strong> সুরক্ষিত আছে। আপনি নিচে টেস্ট মোডে চেক করে পাবলিক করলে আগের সব ডাটা হুবহু থাকবে, শুধু সবাই একটি আপডেট নোটিফিকেশন পাবে।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onToggleStagingMode(!isStagingMode)}
                className={`px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 border transition cursor-pointer ${
                  isStagingMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>
                  {isStagingMode
                    ? 'টেস্ট মোড (Test Mode) চালু আছে — বন্ধ করতে ক্লিক করুন'
                    : '১. আগে টেস্ট মোড (Test Mode) চালু করে চেক করুন'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Staging Edit & Release Notification Publisher */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-indigo-400" />
                    <span>এডিট ও পাবলিক রিলিজ সেক্টর (Publish Update &amp; Send Notification)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    যা যা নতুন যুক্ত বা পরিবর্তন করেছেন তা নিচে লিখে পাবলিক করলে ক্লায়েন্ট ভিউ ও মেইন অ্যাপে নোটিফিকেশন চলে যাবে।
                  </p>
                </div>
              </div>

              {publishSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    আপডেটটি সফলভাবে পাবলিক করা হয়েছে! আগের সকল ডাটা ({totalRecordsCount}টি এন্ট্রি) ১০০% অক্ষত রেখে ক্লায়েন্ট ও টিম ড্যাশবোর্ডে নোটিফিকেশন পাঠানো হয়েছে।
                  </span>
                </div>
              )}

              {/* Optional Quick Staging Edits */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>কুইক কনফিগ এডিট ও টেস্ট (ঐচ্ছিক - পাবলিক করলে সেভ হবে)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">কোম্পানি ট্যাগলাইন / হেডার সাবটাইটেল</label>
                    <input
                      type="text"
                      value={stagingCompanyTagline}
                      onChange={(e) => setStagingCompanyTagline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">ইনভয়েস ও ক্লায়েন্ট পোর্টাল ফুটার নোট</label>
                    <input
                      type="text"
                      value={stagingInvoiceFooter}
                      onChange={(e) => setStagingInvoiceFooter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Release Version, Title & Audience */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    আপডেট ভার্সন (Version)
                  </label>
                  <input
                    type="text"
                    value={releaseVersion}
                    onChange={(e) => setReleaseVersion(e.target.value)}
                    placeholder="v2.6.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    নোটিফিকেশন কারা দেখবে? (Target Audience)
                  </label>
                  <select
                    value={releaseAudience}
                    onChange={(e) => setReleaseAudience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="All">সবাই দেখবে (মেইন অ্যাপ + ক্লায়েন্ট ভিউ পোর্টাল)</option>
                    <option value="ClientPortal">শুধুমাত্র ক্লায়েন্ট ভিউ পোর্টালে দেখাবে</option>
                    <option value="TeamOnly">শুধুমাত্র অফিস টিম ও ম্যানেজাররা দেখবে</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    আপডেট শিরোনাম (Notification Title)
                  </label>
                  <input
                    type="text"
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    সংক্ষিপ্ত বার্তা (ডাটা সুরক্ষিত থাকার নিশ্চয়তা বার্তা)
                  </label>
                  <input
                    type="text"
                    value={releaseSummary}
                    onChange={(e) => setReleaseSummary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                {/* Change List Builder */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    কী কী পরিবর্তন বা নতুন যুক্ত করা হলো? (What Changed List)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newChangeInput}
                      onChange={(e) => setNewChangeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChangeItem();
                        }
                      }}
                      placeholder="নতুন পরিবর্তনের বিবরণ লিখুন (যেমন: নতুন পেমেন্ট অপশন যোগ করা হয়েছে)..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddChangeItem}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>যোগ করুন</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {changeItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveChangeItem(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handlePublishUpdateAndNotify}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>পাবলিক করুন ও সবাইকে আপডেট নোটিফিকেশন পাঠান</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Notification History & Auto-Snapshots */}
            <div className="lg:col-span-5 space-y-6">
              {/* Published Notifications List */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>পাবলিক করা আপডেট নোটিফিকেশন লগ ({releaseNotifications.length})</span>
                  </h3>
                </div>

                {releaseNotifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    এখনো কোনো আপডেট নোটিফিকেশন পাঠানো হয়নি। বাম পাশ থেকে পাবলিক করলে এখানে ও ক্লায়েন্ট সাইটে দেখাবে।
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {releaseNotifications.map((rel) => (
                      <div
                        key={rel.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[10px]">
                              {rel.version}
                            </span>
                            <span className="font-bold text-white">{rel.title}</span>
                          </div>
                          <button
                            onClick={() => onDeleteRelease(rel.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">{rel.summary}</p>
                        <ul className="space-y-1 pl-1">
                          {rel.changes.map((c, i) => (
                            <li key={i} className="text-[11px] text-emerald-300 flex items-start gap-1.5">
                              <span>•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                          <span>সময়: {rel.publishedAt}</span>
                          <span className="text-emerald-400 font-semibold">
                            সুরক্ষিত ডাটা: {rel.dataPreservedCount}টি রেকর্ড
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Automatic Pre-Release Restore Points */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>অটোমেটিক ডাটা স্ন্যাপশট ও রিস্টোর পয়েন্ট ({snapshots.length})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      প্রতিবার আপডেট পাবলিক করার আগে অটোমেটিক স্ন্যাপশট সেভ হয় যেন কোনো ডাটা হারানোর ভয় না থাকে।
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onCreateSnapshot(
                        `Manual Safe Point (${new Date().toLocaleTimeString()})`,
                        releaseVersion
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shrink-0 cursor-pointer"
                  >
                    + নতুন স্ন্যাপশট নিন
                  </button>
                </div>

                {snapshots.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    কোনো স্ন্যাপশট নেই। উপরে &ldquo;+ নতুন স্ন্যাপশট নিন&rdquo; বা পাবলিক বাটনে ক্লিক করলে অটো তৈরি হবে।
                  </p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{snap.label}</div>
                          <div className="text-[10px] text-slate-400">
                            {snap.createdAt} • প্রজেক্ট: {snap.recordCounts.projects}, ক্লায়েন্ট:{' '}
                            {snap.recordCounts.clients}, হাজিরা: {snap.recordCounts.attendance}
                          </div>
                        </div>
                        <button
                          onClick={() => onRestoreSnapshot(snap)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* OPTION 5: COMPLETE A-TO-Z WORKING & EDITING GUIDE IN BENGALI          */}
      {/* ===================================================================== */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border border-purple-500/30 p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>পুরো সিস্টেমে কাজ করার এবং ফাইল আপডেট করার সম্পূর্ণ গাইডলাইন (A-to-Z Guide)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                কোন সেকশনে কীভাবে কাজ করবেন, কীভাবে কোড/সেটিংস এডিট করে টেস্ট করবেন এবং ডাটা ডিলিট না করে পাবলিক করবেন—তার সম্পূর্ণ নির্দেশিকা।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span>১. প্রজেক্টের ফাইল এডিট, টেস্ট ও পাবলিক করার নিয়ম</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>
                    • <strong>আগে টেস্ট করা (Test Mode):</strong> আপনি যখন কোনো নতুন অপশন বা পরিবর্তন আনতে চান, তখন <strong>৪ নং ট্যাবে (এডিট, টেস্ট ও পাবলিক)</strong> গিয়ে <em>&ldquo;টেস্ট মোড চালু করুন&rdquo;</em> বাটনে ক্লিক করে সবকিছু আগে নিজে চেক করে নিন।
                  </li>
                  <li>
                    • <strong>ডাটা ডিলিট না হওয়া (Zero Data Deletion):</strong> আপনার সকল প্রজেক্ট, ক্লায়েন্ট, পেমেন্ট ও বোর্ডের হিসাব আলাদা ডাটা লেয়ারে (`localStorage` ও Cloud Sheet) থাকে। তাই ফাইল বা ফিচার আপডেট করলে আগের কোনো এন্ট্রি কখনোই মুছে যাবে না।
                  </li>
                  <li>
                    • <strong>নোটিফিকেশন পাঠানো:</strong> টেস্ট শেষ হলে <em>&ldquo;কী কী পরিবর্তন বা নতুন যুক্ত করা হলো&rdquo;</em> বক্সে পয়েন্টগুলো লিখে <strong>&ldquo;পাবলিক করুন ও সবাইকে আপডেট নোটিফিকেশন পাঠান&rdquo;</strong> বাটনে ক্লিক করলেই ক্লায়েন্ট ভিউ ও মেইন অ্যাপের উপরে সুন্দর নোটিফিকেশন চলে যাবে।
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>২. কারিগর বোর্ড হিসাব ও দৈনিক মজুরি গাইড</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>
                    • <strong>কারিগর যুক্ত করা:</strong> <em>লেবার ও হাজিরা</em> সেকশনে গিয়ে নতুন কারিগর যোগ করার সময় মজুরি কাঠামোতে <strong>&ldquo;Board Rate (বোর্ড হিসেবে চুক্তি)&rdquo;</strong> সিলেক্ট করে প্রতি বোর্ডের রেট দিন (অগ্রিম টাকা দেওয়া ঐচ্ছিক)।
                  </li>
                  <li>
                    • <strong>অ্যাডিটিভ বোর্ড এন্ট্রি:</strong> একই প্রজেক্টে প্রথমে ২০টি বোর্ড ও পরে আরও ১০টি বোর্ড যোগ করলে সিস্টেম আগের বোর্ড ডিলিট না করে <strong>২০ + ১০ = ৩০টি বোর্ড</strong> এবং মোট বিল ও আগের বকেয়া অটোমেটিক যোগ করে নেবে।
                  </li>
                  <li>
                    • <strong>শুধু বকেয়া পেমেন্ট:</strong> নতুন বোর্ড না বাড়িয়ে শুধু টাকা দিতে চাইলে <em>&ldquo;নতুন বোর্ড যোগ = 0&rdquo;</em> রেখে পেমেন্টের ঘরে টাকা লিখলেই মোট বকেয়া থেকে তা বাদ হয়ে যাবে।
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>৩. অফিস স্যালারি (আগের মাস, কিস্তি, অগ্রিম ও একসাথে পেমেন্ট)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>
                    • <strong>আগের মাসের বকেয়া বা কিস্তি:</strong> <em>অফিস ও স্টাফ</em> সেকশনে গিয়ে <em>&ldquo;বেতন / অগ্রিম দিন&rdquo;</em> বাটনে ক্লিক করে যেকোনো আগের মাস সিলেক্ট করে সম্পূর্ণ বেতন অথবা অল্প অল্প করে কিস্তিতে বেতন দিতে পারবেন।
                  </li>
                  <li>
                    • <strong>রানিং মাসের অগ্রিম:</strong> চলমান মাসের জন্য <em>&ldquo;রানিং মাসের অগ্রিম (Advance)&rdquo;</em> সিলেক্ট করে টাকা দিলে তা ওই মাসের মূল বেতন থেকে অটোমেটিক বাদ হয়ে বাকি প্রদেয় বেতন দেখাবে।
                  </li>
                  <li>
                    • <strong>সব বেতন একসাথে প্রদান:</strong> উপরে থাকা <strong>&ldquo;সব বেতন একসাথে দিন&rdquo;</strong> বাটনে ক্লিক করে এক ক্লিকে সব স্টাফের বাকি বেতন একসাথে পরিশোধ করতে পারবেন।
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>৪. কোম্পানি সেটিংস, ড্রপডাউন ও ইউজার পারমিশন</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>
                    • <strong>ব্যাংক ও ১৭টি ড্রপডাউন:</strong> <em>কোম্পানি সেটিংস</em> মেনুতে আপনার কোম্পানির ব্যাংক অ্যাকাউন্ট, বিকাশ/নগদ নম্বর এবং সকল শিটের ১৭টি ড্রপডাউন অপশন নিজের ইচ্ছামতো যোগ বা ডিলিট করতে পারবেন।
                  </li>
                  <li>
                    • <strong>ওনার বনাম স্টাফ ভিউ:</strong> উপরে থাকা <em>শর্ট লিংক, অ্যাপ ইনস্টল, ক্লায়েন্ট ভিউ, অ্যাপস স্ক্রিপ্ট কোড</em> এবং এই <em>ওনার স্টুডিও</em> শুধুমাত্র আপনি (Owner) লগইন থাকলে দেখাবে। অন্য কেউ লগইন করলে তাকে যতটুকু পারমিশন দেওয়া আছে বাম পাশে শুধু সেটুকুই দেখাবে।
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
