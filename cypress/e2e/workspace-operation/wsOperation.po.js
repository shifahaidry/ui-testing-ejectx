import localElementSelector from './wsOperation.es'
import globalElementSelector from '../../support/common.es'

// Fixture
import { duplicateWsMessage } from '../../fixtures/wsOperation'

module.exports = {
  duplicateWorkSpace(workSpaceNameToBeDuplicated,NewWorkSpaceName) {
   cy.window().then(function(p){
      cy.intercept('/api/duplicateWorkspace').as('duplicateWs')
      //stubbing prompt window
      cy.get(localElementSelector.workspaceName).contains(workSpaceNameToBeDuplicated).parent().next().within(($el) => {
        cy.get($el).find(localElementSelector.duplicateWs).click()
      })
      cy.stub(p, "prompt").returns(NewWorkSpaceName);
      cy.wait('@duplicateWs')
      cy.get(globalElementSelector.notificationToast,{ timeout: 20000 }).contains('Duplicating workspace...').should('not.exist')
      const successMessage = duplicateWsMessage(workSpaceNameToBeDuplicated,NewWorkSpaceName)
      cy.verifyToasterMessage(successMessage)
   })
  },
  deleteWorkSpace(workSpacename) {
    cy.intercept('/api/deletePath').as('deleteWs')
    cy.get(localElementSelector.workspaceName).contains(workSpacename).parent().next().within(($el) => {
      cy.get($el).find(localElementSelector.deleteWs).click()
    })
    cy.get(localElementSelector.confirmDelete).contains('Delete').click()
    cy.wait('@deleteWs',{ timeout: 60000 })
  }
}

