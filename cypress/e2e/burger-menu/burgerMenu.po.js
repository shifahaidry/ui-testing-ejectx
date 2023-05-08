import localElementSelector from './burgerMenu.es'

export class BurgerMenuPage {
  shouldVisiblePageAndClick(linkName,shouldClick = false) {
    cy.get(localElementSelector.navLink).contains(linkName).should('be.visible')
    if (shouldClick) {
      cy.get(localElementSelector.navLink).contains(linkName).click()
    }
  }

  adminLinkButtonVisibility(buttonText,shouldClick = false) {
    cy.get(localElementSelector.adminLinkButton).contains(buttonText).should('be.visible')
    if (shouldClick) {
      cy.get(localElementSelector.adminLinkButton).contains(buttonText).click()
    }
  }
}
