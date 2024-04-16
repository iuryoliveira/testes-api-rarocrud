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
      })
        .its('status')
        .should('to.equal', 400);
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
});
