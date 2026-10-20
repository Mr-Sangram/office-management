/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

export interface ZipFileEntry {
  path: string; // e.g. "src/App.tsx"
  content: string;
}

/**
 * Generates a standard compressed PKZIP (.zip) Blob from an array of UTF-8 file entries using JSZip.
 * 100% compatible with Windows Explorer, macOS Archive Utility, WinRAR, 7-Zip, and Linux unzip.
 */
export async function createZipBlob(files: ZipFileEntry[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    const cleanPath = file.path.replace(/^\/+/, '');
    zip.file(cleanPath, file.content);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });
}

/**
 * Triggers a standard browser download for generated ZIP files.
 * Uses Blob object URLs to avoid iframe navigation errors.
 */
export async function triggerZipDownload(
  files: ZipFileEntry[],
  zipFilename: string
): Promise<void> {
  const blob = await createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Downloads a pre-packaged server zip file safely as a blob to prevent
 * iframe navigation or HTML 404/SPA fallback misinterpretations.
 */
export async function downloadServerZip(
  urlPath: string,
  downloadName: string,
  fallbackFiles?: () => ZipFileEntry[]
): Promise<void> {
  try {
    const response = await fetch(urlPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch zip: ${response.statusText}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = downloadName.endsWith('.zip') ? downloadName : `${downloadName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  } catch (err) {
    console.warn('Direct zip fetch failed, falling back to client-side zip generation:', err);
    if (fallbackFiles) {
      await triggerZipDownload(fallbackFiles(), downloadName);
    }
  }
}

// Dynamically collect all real project files via Vite's raw glob import
const rawSourceFiles = import.meta.glob(
  [
    '/package.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/vercel.json',
    '/README.md',
    '/.gitignore',
    '/index.html',
    '/metadata.json',
    '/public/manifest.json',
    '/public/sw.js',
    '/src/**/*.ts',
    '/src/**/*.tsx',
    '/src/**/*.css',
  ],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

export function getProjectSourceFiles(): ZipFileEntry[] {
  const entries: ZipFileEntry[] = [];
  for (const [rawPath, content] of Object.entries(rawSourceFiles)) {
    if (typeof content === 'string') {
      entries.push({
        path: rawPath.replace(/^\/+/, ''),
        content,
      });
    }
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}
