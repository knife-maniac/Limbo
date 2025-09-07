const base = process.argv.find((arg) => arg.startsWith('--basePath='))?.split('=')[1];

export default {
  root: 'client/',
  build: {
    outDir: '../dist/client/',
    emptyOutDir: true
  },
  base,
  logLevel: 'silent',
}
