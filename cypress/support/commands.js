Cypress.Commands.add('login' , function() { 
    const username=Cypress.env('tester_username')
    const password=Cypress.env('tester_password')
    cy.request({
        method: 'POST',
        url: '/api/login',
        body: { login: username, password: password },
      },{timeout:60000}).then(({ body }) => {
        window.localStorage.setItem('sessionToken', body.sessionToken);
      })

})
