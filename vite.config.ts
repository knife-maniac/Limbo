import { styleText } from 'node:util';
const { port, description, version } = require('./package.json');

module.exports = {
  root: 'client/',
  build: {
    outDir: '../dist/client/',
    emptyOutDir: true,
  },
  logLevel: 'silent',
  server: {
    port
  }
}

console.clear();
process.stdout.write(styleText('green', '  ➜  '));
process.stdout.write(`Limbo ${version} running on `);
process.stdout.write(styleText('cyan', `http://localhost:${styleText('bold', `${port}`)}/\n`));
process.stdout.write(styleText(['grey', 'italic'], `     ${description}\n`));