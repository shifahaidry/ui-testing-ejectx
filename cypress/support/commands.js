/**
 * This command is used to verify downloaded files
 */
require('cy-verify-downloads').addCustomCommand();

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
 Cypress.Commands.add('verifyRedirect', (expectedUrl) => {
  cy.url().should('eq', Cypress.config('baseUrl') + expectedUrl)
})


