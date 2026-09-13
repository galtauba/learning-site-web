import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const data = resolve(root, 'src/data');
await mkdir(data, { recursive: true });
try { await copyFile(resolve(root, '../learning-site-themes/registry.json'), resolve(data, 'themes.json')); } catch { /* use checked-in snapshot */ }
const fallback = JSON.parse(await readFile(resolve(data, 'release-fallback.json'), 'utf8'));
let release = fallback;
try {
  const response = await fetch('https://api.github.com/repos/galtauba/learning-site-editor/releases/latest', { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'learning-site-web-build' }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const remote = await response.json();
  const installer = remote.assets?.find((asset) => /\.exe$/i.test(asset.name) && !/blockmap/i.test(asset.name));
  if (!installer) throw new Error('No Windows installer asset found');
  const checksumAsset = remote.assets?.find((asset) => /^checksums\.txt$/i.test(asset.name));
  let sha256 = '';
  if (checksumAsset?.browser_download_url) {
    const checksumResponse = await fetch(checksumAsset.browser_download_url, { signal: AbortSignal.timeout(5000) });
    if (checksumResponse.ok) {
      const normalizeFilename = (value) => value.replace(/[^a-z0-9]+/gi, '.').replace(/^\.|\.$/g, '').toLowerCase();
      const installerName = normalizeFilename(installer.name);
      const checksumLine = (await checksumResponse.text()).split(/\r?\n/).find((line) => {
        const filename = line.trim().replace(/^[a-f0-9]+\s+/i, '').split(/[\\/]/).at(-1);
        return normalizeFilename(filename) === installerName;
      });
      sha256 = checksumLine?.trim().split(/\s+/)[0] || '';
    }
  }
  release = { version: remote.tag_name?.replace(/^v/, '') || fallback.version, downloadUrl: installer.browser_download_url, releaseUrl: remote.html_url, notes: remote.body || 'See the release notes for details.', sha256, source: 'github' };
} catch (error) { release = { ...fallback, source: 'fallback' }; console.warn(`Using release fallback: ${error.message}`); }
await writeFile(resolve(data, 'release.json'), `${JSON.stringify(release, null, 2)}\n`);
