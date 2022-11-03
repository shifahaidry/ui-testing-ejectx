/* eslint-disable */
/// <reference types="Cypress" />

context('Workspace settings', () => {
    beforeEach(() => {
        cy.login();
    cy.intercept("/api/config").as("config");
    cy.visit("/").wait("@config", { timeout: 80000 });
    });

    // this test contains too much as I don't have the framework currently. Just copy the important parts when merging into the "real" tests.

    it('Workspace Settings', () =>{
      // open Workspace settings
      cy.get(':nth-child(5) > .folder-label > .options > :nth-child(2) > [title="Workspace Settings"] > .bi-gear-fill').click();

      // test the new stuff
      // sections should be collapsed at the beginning
      
      cy.get(':nth-child(1) > :nth-child(1) > h5').parent().should('not.have.class', 'expanded'); // Image group collapsed
      cy.get(':nth-child(1) > :nth-child(2) > h5').parent().should('not.have.class', 'expanded'); // Labeling group collapsed
      cy.get(':nth-child(1) > :nth-child(3) > h5').parent().should('not.have.class', 'expanded'); // Workspace group collapsed

      // open first section and check the relevant content there
      cy.get(':nth-child(1) > :nth-child(1) > h5').click(); // expand Image group
      cy.get(':nth-child(1) > :nth-child(1) > h5').should('contain', 'Image');
      cy.get(':nth-child(1) > :nth-child(1) > h5').parent().should('have.class', 'expanded');

      cy.get(':nth-child(3) > :nth-child(2) > .row > .col > code').should('have.css', 'color', 'rgb(0, 0, 255)'); // Color of Contrast setting
      cy.get(':nth-child(4) > :nth-child(2) > .row > .col > code').should('have.css', 'color', 'rgb(0, 0, 255)'); // Color of Brightness setting
      cy.get('.expanded > :nth-child(2) > :nth-child(5) > .mr-auto > div').should('contain', 'Zoom');
      cy.get(':nth-child(5) > :nth-child(2) > .row > .col > code').should('have.css', 'color', 'rgb(0, 0, 255)'); // Color of Zoom setting

      cy.get('#imageFit').children().should('contain', 'Full Image');
      cy.get('#imageFit').children().should('contain', 'Image Focus ');

      // open second section and check the relevant content there
      cy.get(':nth-child(1) > :nth-child(2) > h5').click(); // expand Labeling group
      cy.get(':nth-child(1) > :nth-child(2) > h5').should('contain', 'Labeling');
      cy.get(':nth-child(1) > :nth-child(2) > h5').parent().should('have.class', 'expanded');

      // new function: 
      // when "Confirm method" is selected, automatically set "Confirm Button" to "Right" and deactivate "Move menu". 
      // when "Confirm method" is deactivated, set "Confirm Button" to "Top" and activate "Move menu". 
      cy.get('#forwardOnly').should('be.checked');  // it is already checked from other settings
      cy.get('#forwardOnly').click({force:true});
      cy.get('#forwardOnly').should('not.be.checked'); // after clicking it should be un-selected
      cy.get('#moveMenu').should('be.checked'); 
      cy.get('#forwardOnly').click({force:true}); 
      cy.get('#forwardOnly').should('be.checked'); // clicking again selects it
      cy.get('#moveMenu').should('not.be.checked');
      // but how to test the setting in the field "Confirm Button"?

      // open third section
      cy.get(':nth-child(1) > :nth-child(3) > h5').click(); // expand Workspace group
      cy.get(':nth-child(1) > :nth-child(3) > h5').should('contain', 'Workspace');
      cy.get(':nth-child(1) > :nth-child(3) > h5').parent().should('have.class', 'expanded');

      cy.get('.btn-secondary').click(); // click cancel at the end
    });

})