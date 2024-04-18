import { faker } from '@faker-js/faker';
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('deletarUsuario', function (id) {
  cy.request('DELETE', 'users/' + id);
});

Cypress.Commands.add('criarUsuario', function () {
  return cy
    .request('POST', '/users', {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    })
    .then((response) => {
      return response.body;
    });
});
