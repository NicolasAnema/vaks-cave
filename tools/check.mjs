// Dev-only headless check (not loaded by the game):
//   node tools/check.mjs
// Imports the full module graph (all Barks.wire call sites run at
// module init), then prints the manifest coverage report and the
// completability verifier. Exits non-zero on any failure.

const main = await import('../src/main.js');
const { wiringTable } = await import('../src/systems/audio.js');
const { EVENTS, MANIFEST } = await import('../src/data/manifest.js');

const { cov, ver } = main.bootReports();

console.log(cov.lines.join('\n'));
console.log('');
console.log('WIRING TABLE:');
console.log(wiringTable().join('\n'));
console.log('');
console.log(ver.lines.join('\n'));
console.log('');
console.log(`Required audio events: ${EVENTS.length}, manifest rows: ${MANIFEST.length}`);

if (cov.unwired.length > 0) {
  console.error('FAIL: unwired manifest rows: ' + cov.unwired.join(', '));
  process.exit(1);
}
if (!ver.ok) {
  console.error('FAIL: completability verification failed');
  process.exit(1);
}
console.log('CHECK OK: zero unwired rows, all levels completable.');
