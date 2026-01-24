import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionFile = join(__dirname, '../public/version.json');

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildTime = new Date().toISOString();

const content = {
  version: commitHash,
  buildTime
};

writeFileSync(versionFile, JSON.stringify(content, null, 2) + '\n');
console.log(`[update-version] Set version to ${commitHash} (${buildTime})`);
