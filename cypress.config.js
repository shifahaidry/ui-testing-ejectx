const { defineConfig } = require('cypress')
const { verifyDownloadTasks } = require('cy-verify-downloads');


module.exports = defineConfig({
  pageLoadTimeout: 120000,
  env: {
    tester_username: 'enter your username here',
    tester_password: 'enter your password here',
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Test Suite',
    embeddedScreenshots: true,
  },
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on('task', verifyDownloadTasks)
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'https://test.ejectx.de',
  },
})
