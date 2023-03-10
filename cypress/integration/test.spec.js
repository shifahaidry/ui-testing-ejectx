import NumberParser from "../../helper/number-parser";

/// <reference types="cypress" />

describe("Authentication Tests", function () {
  beforeEach(() => {
    cy.visit("/login");
  });
  it("Wrong username", function () {
    cy.get('input[type="text"]', { timeout: 60000 }).clear().type("abc");
    cy.get('input[type="password"]').type(Cypress.env("tester_password"));
    cy.intercept("/api/login").as("unauthorized");
    cy.get('button[type="button"]')
      .contains("login", { matchCase: false })
      .click()
      .wait("@unauthorized", { timeout: 60000 });
    cy.get(".error-message").should("be.visible");
  });
  it("Correct credentials", function () {
    cy.get('input[type="text"]', { timeout: 60000 })
      .clear()
      .type(Cypress.env("tester_username"));
    cy.get('input[type="password"]').type(Cypress.env("tester_password"));
    cy.get('button[type="button"]')
      .contains("login", { matchCase: false })
      .click();
    cy.url({ timeout: 60000 }).should("not.include", "login");
  });
});
describe("Workspace tests", function () {
  beforeEach(() => {
    cy.login();
    cy.intercept("/api/config").as("config");
    cy.visit("/").wait("@config", { timeout: 80000 });
  });

  it("Page loads", function () {
    cy.get('[data-step="Label"]', { timeout: 60000 }).should("be.visible");
    cy.get('[data-step="Train"]').should("be.visible");
    cy.get('[data-step="Test"]').should("be.visible");
    cy.get('[data-step="Validate"]').should("be.visible");
    cy.get(".navbar-nav.ml-auto").should("contain", Cypress.env("tester_username"));
  });

  it("Burger menu opens", function() {
    cy.get('.burger-menu').should("be.visible");
    cy.get('.burger-menu').click();
  });

  it("Help page", function () {
    cy.get('.burger-menu').should("be.visible");
    cy.get('.burger-menu').click();
    cy.get('[href="/help"]', { timeout: 60000 }).click();
    cy.url({ timeout: 50000 }).should("include", "help");
    cy.contains("Getting started", { matchCase: false }).should("be.visible");
    cy.get('[class="nav-item logo"]').click();
    cy.get(".folder-label", { timeout: 50000 }).eq(0).should("be.visible");
  });
  it("Open Test1_Referenz1", function () {
    cy.intercept("GET", "/api/getFiles**", {
      statusCode: 200,
    }).as("getFiles");
    cy.get(".folder-label", { timeout: 60000 })
      .contains("Test1_Referenz1")
      .dblclick()
      .wait("@getFiles", { timeout: 50000 });
    cy.get("strong").contains("Test1_Referenz1");
    cy.get('[class="nav-item logo"]').click();
  });
  it("Selected workspace", function () {
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).contains(
      "Test1_Referenz1"
    );
    cy.get('[class="folder-label selected"]')
      .should("have.css", "background")
      .and("includes", "(0, 96, 255)");
    cy.get('[class="folder-label selected"]').within(() => {
      cy.get('[class="file-nums option-progress-text"]')
        .invoke("text")
        .should("contain", "13.028");
    });
  });
  it("Note1 and Note2", function () {
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get('[class="file-nums option-progress-text"]')
        .invoke("text")
        .should("contain", "13.028");
      cy.get('div [title=Notes] svg').click({ force: true });
    });
    cy.get('[class="modal-content"]').within(() => {
      cy.get("#textarea").clear().type("Hello world 1");
      cy.get('[type="checkbox"]')
        .invoke("is", ":checked")
        .then((checked) => {
          if (checked) {
            cy.get('[type="checkbox"]').uncheck({ force: true });
          }
        });

      cy.get('[type="checkbox"]').should("not.be.checked");
      cy.intercept("api/notes").as("noteSaved");
      cy.intercept("api/getFolders*").as("foldersUpdated");

      cy.get("button:contains(Save)").click().wait("@noteSaved");
      cy.wait("@foldersUpdated", { timeout: 60000 });
    });

    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get('[title="Notes"]').within(() => {
        cy.get('[class*="svg-icon"]')
          .invoke("attr", "class")
          .should("not.include", "highlight");
      });
    });

    cy.get('[class="folder-label selected"]').within(() => {
      cy.get('div [title=Notes] svg').click({ force: true });
    });

    cy.get('[class="modal-content"]').within(() => {
      cy.get("#textarea").invoke("val").should("eq", "Hello world 1");
      cy.get("#textarea").clear().type("Test 2");
      cy.get("label:contains(Highlight Note)").click();
      cy.get('[type="checkbox"]').should("be.checked");
      cy.get("button:contains(Save)").click().wait("@noteSaved");
      cy.wait("@foldersUpdated", { timeout: 60000 });
    });

    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get('[title="Notes"]').within(() => {
        cy.get('[class*="svg-icon"]')
          .invoke("attr", "class")
          .should("include", "highlight");
      });
    });
  });

  it("Workspace settings", function () {
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get('[title="Workspace Settings"]').within(() => {
        cy.get('[class="bi-gear-fill b-icon bi clickable-icon"]').click();
      });
    });
    cy.get('[class="modal-content"]').within(() => {
      cy.get("section").contains("Image").click();
      cy.get("div").contains("Images per page").parent().parent().within(() => {
        cy.get('input[type="number"]')
          .as("filePerPage")
          .clear()
          .type("0")
      });
      cy.get("section").contains("Labeling").click();
      cy.get("div").contains("Move menu").parent().parent().within(() => {
        cy.get('input[type="checkbox"]')
          .as("moveMenu")
          .invoke("is", ":checked")
          .then((checked) => {
            if (checked) {
              cy.get("@moveMenu").uncheck({ force: true });
            }
          });
      });
      cy.get("div").contains("New folder").parent().parent().within(() => {
        cy.get('input[type="checkbox"]')
          .as("newFolder")
          .invoke("is", ":checked")
          .then((checked) => {
            if (!checked) {
              cy.get("@newFolder").check({ force: true });
            }
          });
      });
      cy.get("section").contains("Image").click();
      cy.get("div").contains("View").parent().parent().within(() => {
        cy.get('select#imageFit')
          .as("imageFit")
          .select("fill");
      });

      cy.intercept("/api/saveConfig").as("saveConfig");
      cy.get("button:contains(Save)").click().wait("@saveConfig");
    });
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get('[title="Workspace Settings"]').within(() => {
        cy.get('[class="bi-gear-fill b-icon bi clickable-icon"]').click();
      });
    });
    cy.get('[class="modal-content"]').within(() => {
      cy.get("div").contains("Images per page").parent().parent().within(() => {
        cy.get("@filePerPage").invoke("val").should("eq", "0");
      });
      cy.get("div").contains("Move menu").parent().parent().within(() => {
        cy.get("@moveMenu").should("not.be.checked");
      });
      cy.get("div").contains("New folder").parent().parent().within(() => {
        cy.get("@newFolder").should("be.checked");
      });
      cy.get("div").contains("View").parent().parent().within(() => {
        cy.get("@imageFit").should("have.value", "fill");
      });
    });
  });
  it("Workspace settings 2", function () {
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get('[title="Workspace Settings"]').within(() => {
        cy.get('[class="bi-gear-fill b-icon bi clickable-icon"]').click();
      });
    });
    cy.get('[class="modal-content"]').within(() => {
      cy.get("section").contains("Image").click();
      cy.get("div").contains("Images per page").parent().parent().within(() => {
        cy.get('input[type="number"]')
          .as("filePerPage")
          .clear()
          .type("-1")
      });
      cy.get("section").contains("Labeling").click();
      cy.get("div").contains("Move menu").parent().parent().within(() => {
        cy.get('input[type="checkbox"]')
          .as("moveMenu")
          .invoke("is", ":checked")
          .then((checked) => {
            if (!checked) {
              cy.get("@moveMenu").check({ force: true });
            }
          });
      });
      cy.get("div").contains("New folder").parent().parent().within(() => {
        cy.get('input[type="checkbox"]')
          .as("newFolder")
          .invoke("is", ":checked")
          .then((checked) => {
            if (checked) {
              cy.get("@newFolder").uncheck({ force: true });
            }
          });
      });
      cy.get("section").contains("Image").click();
      cy.get("div").contains("View").parent().parent().within(() => {
        cy.get('select#imageFit')
          .as("imageFit")
          .select("fit");
      });

      cy.intercept("/api/saveConfig").as("saveConfig");
      cy.get("button:contains(Save)").click().wait("@saveConfig");
    });
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get('[title="Workspace Settings"]').within(() => {
        cy.get('[class="bi-gear-fill b-icon bi clickable-icon"]').click();
      });
    });
    cy.get('[class="modal-content"]').within(() => {
      cy.get("div").contains("Images per page").parent().parent().within(() => {
        cy.get("@filePerPage").invoke("val").should("eq", "-1");
      });
      cy.get("div").contains("Move menu").parent().parent().within(() => {
        cy.get("@moveMenu").should("be.checked");
      });
      cy.get("div").contains("New folder").parent().parent().within(() => {
        cy.get("@newFolder").should("not.be.checked");
      });
      cy.get("div").contains("View").parent().parent().within(() => {
        cy.get("@imageFit").should("have.value", "fit");
      });
    });
  });
  it("Check subfolders", function () {
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get(
        '[class="bi-triangle-fill option-icon clickable-icon b-icon bi"] > g'
      ).then(($el) => {
        if ($el.is("[transform]")) {
          cy.intercept("/api/getFolders**").as("getFolders");
          cy.get(
            '[class="bi-triangle-fill option-icon clickable-icon b-icon bi"]'
          ).click();
        }
      });
    });
    cy.get('[class="folder-label selected"]').parent().within( () => {
      cy.get("span:contains(test)").should("exist");
      cy.get("span:contains(train)").should("exist");
      cy.get("span:contains(validate)").parent().should("exist");
    });
  });

  it("'train' folder data", function () {
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get(
        '[class="bi-triangle-fill option-icon clickable-icon b-icon bi"] > g'
      ).then(($el) => {
        if ($el.is("[transform]")) {
          cy.intercept("/api/getFolders**").as("getFolders");
          cy.get(
            '[class="bi-triangle-fill option-icon clickable-icon b-icon bi"]'
          ).click();
        }
      });
    });

    cy.get('[class="folder-label selected"]').parent().within( () => {
      cy.get('span:contains(train)')
        .parent()
        .parent()
        .within(() => {
          cy.get('[class="file-nums option-progress-text"]')
            .invoke("text")
            .should("contain", "10.527");
          cy.intercept(RegExp("/api/getStatistic.*")).as("trainStatistic");

          cy.get('[title="AI Statistic"]').within(() => {
            cy.get(
              '[class="bi-bar-chart-fill b-icon bi clickable-icon"]'
            ).click();
          });
        });
    });
    cy.get('[class="modal-content"]').within(() => {
      cy.get("tbody > tr:nth-child(1) > td:nth-child(3) > span:nth-child(1) > a > span")
        .should(($el) => {
        const goodGood = new NumberParser("en").parse($el.text());
        expect(goodGood).to.be.greaterThan(4000);
        expect(goodGood).to.be.lessThan(6000);
      });
      cy.get("tbody > tr:nth-child(1) > td:nth-child(4) > span:nth-child(1) > a > span")
        .should(($el) => {
          const goodBad = new NumberParser("en").parse($el.text());
          expect(goodBad).to.be.greaterThan(0);
          expect(goodBad).to.be.lessThan(1000);
      });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(2) > span:nth-child(1) > a > span")
        .should(($el) => {
          const badGood = new NumberParser("en").parse($el.text());
          expect(badGood).to.be.greaterThan(0);
          expect(badGood).to.be.lessThan(1000);
      });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(3) > span:nth-child(1) > a > span")
        .should(($el) => {
          const badBad = new NumberParser("en").parse($el.text());
          expect(badBad).to.be.greaterThan(4000);
          expect(badBad).to.be.lessThan(6000);
      });

      cy.get("#percentageView").click();
      cy.get("tbody > tr:nth-child(1) > td:nth-child(3) > span:nth-child(1) > a > span")
        .should(($el) => {
          const goodGood = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(goodGood).to.be.greaterThan(80);
          expect(goodGood).to.be.lessThan(101);
        });
      cy.get("tbody > tr:nth-child(1) > td:nth-child(4) > span:nth-child(1) > a > span")
        .should(($el) => {
          const goodBad = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(goodBad).to.be.greaterThan(0);
          expect(goodBad).to.be.lessThan(20);
        });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(2) > span:nth-child(1) > a > span")
        .should(($el) => {
          const badGood = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(badGood).to.be.greaterThan(0);
          expect(badGood).to.be.lessThan(20);
        });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(3) > span:nth-child(1) > a > span")
        .should(($el) => {
          const badBad = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(badBad).to.be.greaterThan(80);
          expect(badBad).to.be.lessThan(101);
        });

      cy.get("button:contains(Close)").click();
    });
  });
  it("'test' folder data", function () {
    cy.get('[class="folder-label selected"]', { timeout: 60000 }).within(() => {
      cy.get(
        '[class="bi-triangle-fill option-icon clickable-icon b-icon bi"] > g'
      ).then(($el) => {
        if ($el.is("[transform]")) {
          cy.intercept("/api/getFolders**").as("getFolders");
          cy.get(
            '[class="bi-triangle-fill option-icon clickable-icon b-icon bi"]'
          ).click();
        }
      });
    });
    cy.get('[class="folder-label selected"]').parent().within( () => {
      cy.get("span:contains(test)")
        .parent()
        .parent()
        .within(() => {
          cy.get('[class="file-nums option-progress-text"]')
            .invoke("text")
            .should("contain", "1.251");
          cy.get('[title="AI Statistic"]').within(() => {
            cy.intercept(RegExp("/api/getStatistic.*")).as("trainStatistic");
            cy.get(
              '[class="bi-bar-chart-fill b-icon bi clickable-icon"]'
            ).click();
          });
        });
    });

    cy.get('[class="modal-content"]').within(() => {
      cy.get('tbody > tr:nth-child(1) > td:nth-child(3) > span:nth-child(1)')
        .should(($el) => {
          const goodGood = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(goodGood).to.be.greaterThan(500);
          expect(goodGood).to.be.lessThan(700);
        });
      cy.get('tbody > tr:nth-child(1) > td:nth-child(4) > span:nth-child(1)')
        .should(($el) => {
          const goodBad = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(goodBad).to.be.greaterThan(0);
          expect(goodBad).to.be.lessThan(200);
        });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(2) > span:nth-child(1)")
        .should(($el) => {
          const badGood = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(badGood).to.be.greaterThan(0);
          expect(badGood).to.be.lessThan(200);
        });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(3) > span:nth-child(1)")
        .should(($el) => {
          const badBad = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(badBad).to.be.greaterThan(500);
          expect(badBad).to.be.lessThan(700);
        });

      cy.get("#percentageView").click();
      cy.get("tbody > tr:nth-child(1) > td:nth-child(3) > span:nth-child(1) > a > span")
        .should(($el) => {
          const goodGood = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(goodGood).to.be.greaterThan(80);
          expect(goodGood).to.be.lessThan(101);
        });
      cy.get("tbody > tr:nth-child(1) > td:nth-child(4) > span:nth-child(1) > a > span")
        .should(($el) => {
          const goodBad = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(goodBad).to.be.greaterThan(0);
          expect(goodBad).to.be.lessThan(20);
        });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(2) > span:nth-child(1) > a > span")
        .should(($el) => {
          const badGood = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(badGood).to.be.greaterThan(0);
          expect(badGood).to.be.lessThan(20);
        });
      cy.get("tbody > tr:nth-child(2) > td:nth-child(3) > span:nth-child(1) > a > span")
        .should(($el) => {
          const badBad = new NumberParser("en").parse($el.text().replace(/%/, ''));
          expect(badBad).to.be.greaterThan(80);
          expect(badBad).to.be.lessThan(101);
        });

      cy.get("button:contains(Close)").click();
    });
  });
  it("Tensorflow Settings", function (){
    // open Train page and then Tensorflow settings
    cy.get('[data-step="Train"]').click();
    cy.get('.mt-2').click();

    // test the new stuff

    // sections should be collapsed at the beginning
    cy.get(':nth-child(1) > h5').parent().should('not.have.class', 'expanded'); 
    cy.get(':nth-child(2) > h5').parent().should('not.have.class', 'expanded'); 
    cy.get(':nth-child(3) > h5').parent().should('not.have.class', 'expanded'); 
    cy.get(':nth-child(4) > h5').parent().should('not.have.class', 'expanded'); 
    cy.get(':nth-child(5) > h5').parent().should('not.have.class', 'expanded'); 

    // First section: AI training
    // cy.get('.modal-body >:nth-child(1) >h5').click(); // this is commented because clicking on the header to expand the section only yields an error

    // these lines still work as all parts are already in the code (just hidden from human eye). It looks bad but still works. :(
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(1) > .mr-auto > div').should('contain', 'Max Train Steps');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(2) > input'); // we should test here if it only allows numbers, no text

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > .mr-auto > div').should('contain', 'Image size');
    // cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > .mr-auto > div').should('contain', 'Auto');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(2) > div > div:nth-child(1) > div.mr-auto.col-6').should('contain', 'width');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > input'); 
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(2) > div > div:nth-child(2) > div.mr-auto.col-6').should('contain', 'height');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(2) > div > :nth-child(2) > div:nth-child(2) > input');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(2) > div > div:nth-child(3) > div.mr-auto.col-6').should('contain', 'depth');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > :nth-child(2) > div > :nth-child(3) > div:nth-child(2) > input');
    // testing for the content of the input for width, heigt and depth does not seem to work here.

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(3) > .mr-auto > div').should('contain', 'Training Classes');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(3) > :nth-child(2) > div > ul'); // just checks if the list (that contains the classes) exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(4) > .mr-auto > div').should('contain', 'Begin new model');
    cy.get('#overwrite_model'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(5) > .mr-auto > div').should('contain', 'Rename images');
    cy.get('#rename_after_test'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(6) > .mr-auto > div').should('contain', 'GPU');
    cy.get('#GPU'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(7) > .mr-auto > div').should('contain', 'Optimizer');
    cy.get('#optimizer'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(8) > .mr-auto > div').should('contain', 'Epsilon');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(9) > .mr-auto > div').should('contain', 'Learning rate');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(9) > :nth-child(2) > input'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(10) > .mr-auto > div').should('contain', 'Batch Size');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(10) > :nth-child(2) > input'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(11) > .mr-auto > div').should('contain', 'Shuffle buffer');

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(12) > .mr-auto > div').should('contain', 'Save best only');
    cy.get('#save_best_only'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(13) > .mr-auto > div').should('contain', 'Validation frequency');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(13) > :nth-child(2) > input'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(14) > .mr-auto > div').should('contain', 'Metrics');
    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(14) > :nth-child(2) > div > ul'); // just checks if the list (that contains the classes) exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(15) > .mr-auto > div').should('contain', 'Monitor');
    cy.get('#monitor'); // just checks if the element exists

    cy.get(':nth-child(1) > :nth-child(2) > :nth-child(16) > .mr-auto > div').should('contain', 'Monitor mode');
    cy.get('#monitor_mode').should('contain', 'max').and('contain','min'); // checks if the element exists and contains the relevant selections

    // second section: AI model 
    // cy.get(':nth-child(2) > h5').click();
    cy.get(':nth-child(2) > :nth-child(2) > :nth-child(1) > .mr-auto > div').should('contain', 'Network architecture');
    cy.get(':nth-child(2) > :nth-child(2) > :nth-child(1) > :nth-child(2) > input');

    cy.get(':nth-child(2) > :nth-child(2) > :nth-child(2) > .mr-auto > div').should('contain', 'Activation function');
    cy.get(':nth-child(2) > :nth-child(2) > :nth-child(2) > :nth-child(2) > input');

    cy.get(':nth-child(2) > :nth-child(2) > :nth-child(3) > .mr-auto > div').should('contain', 'Dropout rate');
    cy.get(':nth-child(2) > :nth-child(2) > :nth-child(3) > :nth-child(2) > input');

    // third section: Data processing
    // cy.get(':nth-child(3) > h5').click();
    cy.get(':nth-child(3) > :nth-child(2) > :nth-child(1) > .mr-auto > div').should('contain', 'Augmentation count');
    cy.get(':nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(2) > input');


    cy.get(':nth-child(3) > :nth-child(2) > :nth-child(2) > .mr-auto > div').should('contain', 'Batch normalization');
    cy.get('#batch_normalization');

    cy.get(':nth-child(3) > :nth-child(2) > :nth-child(3) > .mr-auto > div').should('contain', 'Balance dataset');
    cy.get('#balance_dataset_to_max');

    cy.get(':nth-child(3) > :nth-child(2) > :nth-child(4) > .mr-auto > div').should('contain', 'Heatmap Types');
    cy.get('#heatmap_types');


    // fourth section: Augmentations
    // cy.get(':nth-child(4) > h5').click();
    // this is set dynamically by user, so we can't assume anything for this test. 

    // fifth section: Scripts and Folders
    // cy.get(':nth-child(5) > h5').click();
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(1) > .mr-auto > div').should('contain', 'The numbers of lines to be displayed');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(1) > :nth-child(2) > input');
      
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(2) > .mr-auto > div').should('contain', 'Tenser Board Url');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(2) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(3) > .mr-auto > div').should('contain', 'Training path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(3) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(4) > .mr-auto > div').should('contain', 'Validation path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(4) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(5) > .mr-auto > div').should('contain', 'Testset path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(5) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(6) > .mr-auto > div').should('contain', 'Model path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(6) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(7) > .mr-auto > div').should('contain', 'Heatmap path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(7) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(8) > .mr-auto > div').should('contain', 'Stop file');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(8) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(9) > .mr-auto > div').should('contain', 'Classes to model');
    cy.get('#pack_classes_to_model');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(10) > .mr-auto > div').should('contain', 'Test output path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(10) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(11) > .mr-auto > div').should('contain', 'Augmentation path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(11) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(12) > .mr-auto > div').should('contain', 'Training script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(12) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(13) > .mr-auto > div').should('contain', 'Test script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(13) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(14) > .mr-auto > div').should('contain', 'Validate script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(14) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(15) > .mr-auto > div').should('contain', 'Training2 script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(15) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(16) > .mr-auto > div').should('contain', 'Test2 script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(16) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(17) > .mr-auto > div').should('contain', 'Validate2 script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(17) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(18) > .mr-auto > div').should('contain', 'Stop train script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(18) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(19) > .mr-auto > div').should('contain', 'Stop test script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(19) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(20) > .mr-auto > div').should('contain', 'Stop validate script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(20) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(21) > .mr-auto > div').should('contain', 'Export model script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(21) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(22) > .mr-auto > div').should('contain', 'Export result script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(22) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(23) > .mr-auto > div').should('contain', 'Export images script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(23) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(24) > .mr-auto > div').should('contain', 'Report script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(24) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(25) > .mr-auto > div').should('contain', 'split data script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(25) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(26) > .mr-auto > div').should('contain', 'Visualize heatmap script');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(26) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(27) > .mr-auto > div').should('contain', 'Log training path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(27) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(28) > .mr-auto > div').should('contain', 'Log test path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(28) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(29) > .mr-auto > div').should('contain', 'Log validate path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(29) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(30) > .mr-auto > div').should('contain', 'Field export model path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(30) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(31) > .mr-auto > div').should('contain', 'Field export result path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(31) > :nth-child(2) > input');

    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(32) > .mr-auto > div').should('contain', 'Field export images path');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(32) > :nth-child(2) > input');

    cy.get('button[class="close"]').click();
  })
});

