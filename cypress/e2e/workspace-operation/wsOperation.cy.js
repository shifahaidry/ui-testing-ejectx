/// <reference types="cypress" />

// Element selector
import localElementSelector from './wsOperation.es'
import globalElementSelector from '../../support/common.es'

// Fixtures
import { urls,staticData,backupWsMessage } from '../../fixtures/wsOperation'

// Page Object
import { duplicateWorkSpace,deleteWorkSpace } from './wsOperation.po'

const newWorkSpaceName = `TestAutomation-${new Date().getTime()}`

describe('Workspace operation',{ testIsolation : false },() => {
  before(() => {
    cy.login()
      .visit('/')
  })

  after(() => {
    // cy.get(localElementSelector.manageIcon).should('be.visible').click();
    // cy.verifyRedirect(urls.manage)
    // deleteWorkSpace(newWorkSpaceName)
  })

  // Duplicate workspace
  it('Check for Workspaces file based and DB based and duplicate workspace',() => {
    // move to the Manage tab
    cy.get(localElementSelector.manageIcon).should('be.visible').click();
    cy.verifyRedirect(urls.manage)
    cy.waitForSpinner()
    duplicateWorkSpace(staticData.workSpaceToBeDuplicated,newWorkSpaceName)
  })

  // New Work space exist
  it('New workspace should be exist',() => {
    cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).should('be.exist')
  })

  // Should have same file counting to source workspace
  it('New workspace should be exist with same file counting',() => {
    cy.get(localElementSelector.labelIcon).should('be.visible').click();
    cy.verifyRedirect(urls.label)
    cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).parent().next().within(($el) => {
      cy.get($el).find(localElementSelector.fileCount).children('.file-nums').invoke('text').then((size) => {
        expect(staticData.fileCount).to.be.eq(size.split(' ')[0])
      })
    })
  })

  // TODO : Compare workspace setting
  it('New workspace setting should be same to source one',() => {

  })

  // delete image in new workspace
  it('Delete image in new workspace',() => {
    cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).dblclick()
    cy.verifyRedirect(`/explorer?dir=%2F${newWorkSpaceName}`)
    cy.get(`div[id="/${newWorkSpaceName}/.cache"]`).should('be.visible').click()
    cy.intercept('/api/deleteFiles').as('deleteImage')
    cy.get(localElementSelector.deleteImages).contains('Delete image(s)').click()
    cy.wait('@deleteImage')
  })

  it('Deleted Image should not be visible',() => {
    cy.get(`div[id="/${newWorkSpaceName}/.cache"]`).should('not.exist')
  })

  // Size comparing
  it('new workspace should have same size to source workspace',() => {
    cy.get(localElementSelector.manageIcon).should('be.visible').click();
    cy.verifyRedirect(urls.manage)
    cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).parent().next().within(($el) => {
      cy.get($el).find(localElementSelector.fileSize).children('.file-nums').invoke('text').then((size) => {
        expect(staticData.workSpaceSize.split(' ')[0]).to.be.eq(size.split(' ')[0])
        expect(staticData.workSpaceSize.split(' ')[1]).to.be.eq(size.split(' ')[1])
      })
    })
  })

  // Backup workspace
  it('Should back up the newly created workspace',() => {
    cy.intercept('/api/backup').as('backupApi')
    cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).parent().next().within(($el) => {
      cy.get($el).find(localElementSelector.backUpWorkSpace).click()
    })
    cy.get(globalElementSelector.notificationToast,{ timeout: 20000 }).contains(`Creating backup of ${newWorkSpaceName}...`).should('not.exist')
    cy.wait('@backupApi')
    const successMessage = backupWsMessage(newWorkSpaceName)
    cy.verifyToasterMessage(successMessage)
  })
  
  // backup availability in backup list
  it('Newly created workspace should be available in backup list',() => {
    cy.get(localElementSelector.backupDBWsIcon).next().contains(newWorkSpaceName).should('be.exist')
  })

   // Rename the WorkSpace
   it('new workspace should be able to rename',() => {
    cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).parent().next().within(($el) => {
      cy.get($el).find(localElementSelector.renameWorkSpace).click()
    })
    cy.get(localElementSelector.selectedWorkSpaceName).as('wsEditable')
    cy.get('@wsEditable').clear().type(newWorkSpaceName + '-edited')
    cy.get('@wsEditable').next().click()
  })
  
  // Delete duplicate workspace
  it('Delete duplicate workspace',() => {
    deleteWorkSpace(newWorkSpaceName + '-edited')
  })

  // download backup 
  it('Should download the backed up workspace',() => {
    cy.get(localElementSelector.backupDBWsIcon).next().contains(newWorkSpaceName).as('backedupWs')
    cy.get('@backedupWs').parent().next().within(($el) => {
      cy.get($el).find(localElementSelector.downloadBackup).click()
    })
    cy.get(localElementSelector.confirmDelete).contains('Download').click()
    // explicite wait for downloading
    cy.wait(20000)
    cy.verifyDownload('.zip', { contains: true });
  })

  // it('Restore the newly backed workspace',() => {
  //   cy.get(localElementSelector.backupDBWsIcon).next().contains(newWorkSpaceName).as('backedupWs')
  //   cy.intercept('/api/restore-backup').as('restoreApi')
  //   cy.get('@backedupWs').parent().next().within(($el) => {
  //     cy.get($el).find(localElementSelector.restoreBackup).click()
  //   })
  //   cy.get(localElementSelector.confirmDelete).contains('Restore').click()
  //   cy.get(globalElementSelector.notificationToast,{ timeout: 20000 }).contains(`Restoring backup...`).should('not.exist')
  //   cy.wait('@restoreApi')
  // })

   // Restored Work space availability
  // it('Restored workspace should be exist',() => {
  //   cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).should('be.exist')
  // })

  // Restored workspace should have same files
  // it('Restored workspace should have same files',() => {
  //   cy.get(localElementSelector.labelIcon).should('be.visible').click();
  //   cy.verifyRedirect(urls.label)
  //   cy.get(localElementSelector.workspaceName).contains(newWorkSpaceName).parent().next().within(($el) => {
  //     cy.get($el).find(localElementSelector.fileCount).children('.file-nums').invoke('text').then((size) => {
  //       expect(staticData.fileCount).to.be.eq(size.split(' ')[0])
  //     })
  //   })
  // })

  // TODO: After Restoring workspace setting check
  
  // Delete backup
  it('Delete backed up workspace',() => {
    // cy.get(localElementSelector.manageIcon).should('be.visible').click();
    // cy.verifyRedirect(urls.manage)
    cy.intercept('/api/deletePath').as('deleteBackupApi')
    cy.get(localElementSelector.backupDBWsIcon).next().contains(newWorkSpaceName).as('backedupWs')
    cy.get('@backedupWs').parent().next().within(($el) => {
      cy.get($el).find(localElementSelector.deleteBackup).click()
    })
    cy.get(localElementSelector.confirmDelete).contains('Delete').click()
    cy.wait('@deleteBackupApi')
  })

  // backup gone
  it('Deleted workspace should not be available in backup list',() => {
    cy.get(localElementSelector.backupDBWsIcon).next().contains(newWorkSpaceName).should('not.exist')
  })
})
