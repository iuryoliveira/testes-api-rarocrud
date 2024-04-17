import { faker } from '@faker-js/faker';

describe('Testes da rota /users', function () {
  describe('Testes de Bad requests', function () {
    it('Deve receber bad request ao tentar cadastrar um usuário sem e-mail', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: 'iury oliveira',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.undefined;
      });
    });

    it('Deve receber bad request ao tentar cadastrar um usuário sem o nome', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          email: 'i@t.com',
        },
        failOnStatusCode: false,
      })
        .its('status')
        .should('to.equal', 400);
    });

    it('Deve receber bad request ao tentar cadastrar um usuário com e-mail inválido', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: 'iury oliveira',
          email: '.com',
        },
        failOnStatusCode: false,
      })
        .its('status')
        .should('to.equal', 400);
    });
  });

  describe('Testes de criação de usuário', function () {
    var idUsuario;

    afterEach(function () {
      cy.deletarUsuario(idUsuario);
    });

    it('Deve ser possível criar usuário com dados válidos', function () {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      cy.request('POST', '/users', {
        name: name,
        email: email,
      }).then(function (response) {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('createdAt');
        expect(response.body).to.have.property('updatedAt');
        expect(response.body.name).to.equal(name);
        expect(response.body.email).to.equal(email);

        idUsuario = response.body.id;
      });
    });

    it('Não deve ser possível cadastrar usuário com e-mail já utilizado', function () {
      const name = faker.person.fullName();
      const email = faker.internet.email();

      cy.request('POST', '/users', {
        name: name,
        email: email,
      }).then((response) => {
        idUsuario = response.body.id;

        cy.request({
          method: 'POST',
          url: '/users',
          body: {
            name: name,
            email: email,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(422);
          expect(response.body.error).to.equal('User already exists.');
        });
      });
    });
  });
});
