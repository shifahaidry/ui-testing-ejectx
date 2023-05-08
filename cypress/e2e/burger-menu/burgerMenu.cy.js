// Local Element selector
import localElement from './burgerMenu.es'

// Fixture
import { downloadedFileDetails } from '../../fixtures/burgerMenu'

// Page object
import { BurgerMenuPage } from './burgerMenu.po'
const burgerMenu = new BurgerMenuPage()


describe('Verify Burger Menu on site should have proper link', {testIsolation : false} ,() => {
  before(() => {
    cy.login()
      .visit('/')
  })

  it('Admin Page should show Audit log', () => {
    cy.get(localElement.burgerMenuIcon).should('be.visible').click()
    burgerMenu.shouldVisiblePageAndClick('Admin page',true)
    cy.verifyRedirect('/admin')
    cy.get(localElement.adminMenuTitle).contains('Admin Panel').should('be.visible')
    burgerMenu.adminLinkButtonVisibility('Show Audit Trail',true)
    cy.get(localElement.mainContent).contains('"/Test1_Referenz1"')
  })

  it('Admin Page should show Download Audit log', () => {
    burgerMenu.adminLinkButtonVisibility('Download Audit Trail',true)
    cy.verifyDownload(downloadedFileDetails.fileName);
  })

  it('Burger Menu should show About / Licence Page link', () => {
    cy.get(localElement.burgerMenuIcon).should('be.visible').click()
    burgerMenu.shouldVisiblePageAndClick('About / License',true)
    cy.verifyRedirect('/about')
    cy.get(localElement.aboutPageHeader).contains('Körber Pharma Inspection').should('be.visible')
  })
})
