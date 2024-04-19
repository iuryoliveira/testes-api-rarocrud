import { METHOD_HTTP } from './method-http';

Cypress.Commands.add('listaTodosUsuarios', function (id) {
  cy.request(METHOD_HTTP.GET, '/users').then((response) => {
    return response.body;
  });
});

Cypress.Commands.add('listaTodosUsuarios2', function (id) {
  cy.request(METHOD_HTTP.GET, '/users').then((response) => {
    return response.body;
  });
});
