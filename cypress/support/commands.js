import { faker } from '@faker-js/faker';


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
