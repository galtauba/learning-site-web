import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('release fallback points to official GitHub releases', async () => {
  const release = JSON.parse(await readFile('src/data/release-fallback.json', 'utf8'));
  assert.match(release.downloadUrl, /^https:\/\/github\.com\/galtauba\/learning-site-editor\/releases/);
});
test('official theme registry snapshot has gallery metadata', async () => {
  const registry = JSON.parse(await readFile('src/data/themes.json', 'utf8'));
  assert.ok(registry.themes.every((theme) => theme.name && theme.version && theme.engine && theme.preview?.description));
});
