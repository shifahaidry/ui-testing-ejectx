# UI Testing EjectX

Automated UI testing via Cypress of the SVTrain / EjectX user interface

# Running Tests

Install dependencies by running `npm install`

Provide the base URL to the location of the app you would like to test and credentials in `cypress.json`.

Run `npx cypress run` to run tests headlessly or `npx cypress open` to open the Cypress Visual Test Runner on the root directory of this project.

# Generate Mochawesome Report

To generate a HTML report _after_ you run the test with `npx cypress run`. 

Report should be at cypress/reports
