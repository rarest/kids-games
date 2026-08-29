import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnosticsAllowed } from '../maze/diagnostics.js';

test('diagnostics allow standard loopback hostnames and explicit remote opt-in only',()=>{
  const allowed=url=>diagnosticsAllowed(new URL(url));
  assert.equal(allowed('http://localhost/maze'),true);
  assert.equal(allowed('http://127.0.0.1/maze'),true);
  assert.equal(allowed('http://[::1]/maze'),true);
  assert.equal(allowed('https://example.com/maze?diagnostics=1'),true);
  assert.equal(allowed('https://example.com/maze'),false);
  assert.equal(allowed('https://example.com/maze?diagnostics=0'),false);
});
