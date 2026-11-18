const { spawnSync } = require('node:child_process');
const { version } = require('../package.json');
const [latestRelease] = require('../src/app/release-notes.json');

if (!latestRelease || latestRelease.version !== version) {
  console.error(`Release notes must start with version ${version} from package.json.`);
  process.exit(1);
}

const builtAt = new Date();
const build = spawnSync(process.execPath, [
  require.resolve('@angular/cli/bin/ng.js'),
  'build',
  ...process.argv.slice(2),
  `--define=APP_BUILD_DATE=${JSON.stringify(builtAt.toISOString())}`,
], { stdio: 'inherit' });

if (build.error) throw build.error;
process.exitCode = build.status ?? 1;
