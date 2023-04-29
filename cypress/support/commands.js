import commonElementSelector from './common.es'

Cypress.Commands.add('login' , function() { 
    const username=Cypress.env('tester_username')
    const password=Cypress.env('tester_password')
    cy.request({
        method: 'POST',
        url: '/api/login',
        body: { login: username, password: password },
      },{timeout:60000}).then(({ body }) => {
        window.localStorage.setItem('sessionToken', body.sessionToken);
        window.localStorage.setItem('refreshToken', body.refreshToken);
      })

})

/**
 * This Command can be used for verifying the status of URl
 * e.g cy.verifyRedirect('/launchpad')
 */
 Cypress.Commands.add('verifyRedirect', (expectedUrl, waitTimeOut = Cypress.config('defaultCommandTimeout')) => {
  cy.url({ timeout: waitTimeOut }).should('eq', Cypress.config('baseUrl') + expectedUrl)
})

/**
 * This command can be used to wait for nuxt progress bar to finish
 */
 Cypress.Commands.add('waitForSpinner', (waitTimeOut = Cypress.config('defaultCommandTimeout')) => {
  cy.get(commonElementSelector.loadingSpinner, { timeout: waitTimeOut }).should('be.visible')
  cy.get(commonElementSelector.loadingSpinner, { timeout: waitTimeOut }).should('not.exist')
})

/**
 * This command is used to verify the toaster
 */
// Custom command to verify toaster message
Cypress.Commands.add('verifyToasterMessage', (message, isSuccess = true) => {
  cy.get(commonElementSelector[isSuccess ? 'toasterSuccess' : 'toasterError']).contains(message).should('be.visible')
})
