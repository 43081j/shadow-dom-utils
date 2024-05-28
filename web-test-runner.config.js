import {puppeteerLauncher} from '@web/test-runner-puppeteer';
import {esbuildPlugin} from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  files: ['src/test/**/*_test.ts'],
  browsers: [puppeteerLauncher({
    concurrency: 1
  })],
  coverage: true,
  coverageConfig: {
    report: true,
    reportDir: './coverage',
    reporters: ['lcov'],
    include: ['src/**/*.ts']
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'auto',
      tsconfig: './tsconfig.json'
    })
  ]
};
