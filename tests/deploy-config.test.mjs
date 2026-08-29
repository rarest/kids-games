import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('production sync excludes OpenSpec and agent-only project metadata', async () => {
  const script = await readFile(new URL('../deploy/deploy-local.sh', import.meta.url), 'utf8');
  assert.match(script, /--exclude '\.agents'/);
  assert.match(script, /--exclude 'openspec'/);
});
