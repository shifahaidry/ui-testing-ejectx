import "./commands";
import "cypress-mochawesome-reporter/register";

// Alternatively you can use CommonJS syntax:
// require('./commands')
Cypress.on("uncaught:exception", (err, runnable) => {
  if (err.message.includes("message")) {
    return false;
  }
  if (err.message.includes("end of input")) {
    return false;
  }
});
