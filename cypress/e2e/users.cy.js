import { da, faker } from "@faker-js/faker";
const { METHOD_HTTP } = require("../support/method-http.js");
const user = require("../fixtures/user/responses/usuario.json");

describe("Testes da rota /users", function () {
  describe("Testes de Bad requests", function () {
    it("Deve receber bad request ao tentar cadastrar um usuário sem e-mail", function () {
      cy.request({
        method: "POST",
        url: "/users",
        body: {
          name: "iury oliveira",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.undefined;
      });
    });

    it("Deve receber bad request ao tentar cadastrar um usuário sem o nome", function () {
      cy.request({
        method: "POST",
        url: "/users",
        body: {
          email: "i@t.com",
        },
        failOnStatusCode: false,
      })
        .its("status")
        .should("to.equal", 400);
    });

    it("Deve receber bad request ao tentar cadastrar um usuário com e-mail inválido", function () {
      cy.request({
        method: "POST",
        url: "/users",
        body: {
          name: "iury oliveira",
          email: ".com",
        },
        failOnStatusCode: false,
      })
        .its("status")
        .should("to.equal", 400);
    });
  });

  describe("Testes de criação de usuário", function () {
    var idUsuario;

    afterEach(function () {
      cy.deletarUsuario(idUsuario);
    });

    it("Deve ser possível criar usuário com dados válidos", function () {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      cy.request("POST", "/users", {
        name: name,
        email: email,
      }).then(function (response) {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property("id");
        expect(response.body).to.have.property("createdAt");
        expect(response.body).to.have.property("updatedAt");
        expect(response.body.id).to.be.an("string");
        expect(response.body.createdAt).to.be.an("string");
        expect(response.body.updatedAt).to.be.an("string");
        expect(response.body.createdAt).to.equal(response.body.updatedAt);
        expect(response.body.name).to.equal(name);
        expect(response.body.email).to.equal(email);

        idUsuario = response.body.id;
      });
    });

    it("Não deve ser possível cadastrar usuário com e-mail já utilizado", function () {
      const name = faker.person.fullName();
      const email = faker.internet.email();

      cy.request("POST", "/users", {
        name: name,
        email: email,
      }).then((response) => {
        idUsuario = response.body.id;

        cy.request({
          method: "POST",
          url: "/users",
          body: {
            name: name,
            email: email,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(422);
          expect(response.body.error).to.equal("User already exists.");
        });
      });
    });
  });

  describe("Testes de consulta de usuário", function () {
    var usuarioCriado;

    before(function () {
      cy.criarUsuario().then((dados) => {
        usuarioCriado = dados;
      });
    });

    after(function () {
      cy.deletarUsuario(usuarioCriado.id);
    });

    it("Deve ser possível consultar um usuário por id", function () {
      cy.request("/users/" + usuarioCriado.id).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(usuarioCriado);
        expect(response.body.email).to.equal(usuarioCriado.email);
      });
    });

    it("Não deve ser possível consultar um usuário não cadastrado", function () {
      cy.request({
        method: "GET",
        url: "/users/3fa85f64-5717-4562-b3fc-2c963f66afa6",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
        expect(response.body).to.be.empty;
      });
    });

    it("Deve receber um bad request ao consultar um id inválido", function () {
      cy.request({
        method: "GET",
        url: "/users/1234-asdadsa-899",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.empty;
      });
    });

    it("Deve ser possível consultar a lista de todos os usuários", function () {
      cy.request("/users").then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
        expect(response.body).to.deep.includes(usuarioCriado);

        response.body.forEach(function (usuario) {
          cy.log(usuario.id);
          if (usuario.id === usuarioCriado.id) {
            expect(usuario.email).to.equal(usuarioCriado.email);
          }
        });
      });
    });
  });
  describe("Testes relacionados a atualização de usuários", function () {
    var usuarioCriado;

    before(function () {
      cy.criarUsuario().then((dados) => {
        usuarioCriado = dados;
      });
    });

    after(function () {
      cy.deletarUsuario(usuarioCriado.id);
    });

    it("Atualizar usuario com sucesso", function () {
      var userComId = "/users/" + usuarioCriado.id;
      var bodyRequisicao = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
      }).then((response) => {
        expect(response.status).to.be.eq(200);
        expect(response.body).to.have.keys(user);
        expect(response.body.id).to.be.eq(usuarioCriado.id);
        expect(response.body.name).to.be.eq(bodyRequisicao.name);
        expect(response.body.email).to.be.eq(bodyRequisicao.email);
        expect(response.body.createdAt).to.be.a("string");
        expect(response.body.createdAt).to.not.empty;
        expect(response.body.updatedAt).to.be.a("string");
        expect(response.body.updatedAt).to.not.empty;
      });
    });

    it("Deve retornar not found ao tentar atualizar um usuário que não existe", function () {
      var userComId = "/users/8e769999-efc4-46e2-b2af-426e160e290c";
      var bodyRequisicao = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(404);
      });
    });

    it("Deve retornar bad request ao tentar atualizar um usuário com id inválido", function () {
      var userComId = "/users/10";
      var bodyRequisicao = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(400);
      });
    });
    it("Deve retornar erro ao atualizar um usuário com um email ja existente", function () {
      var userComId = "/users/" + usuarioCriado.id;
      var mensagemErro = "E-mail already in use.";

      var bodyRequisicao = {
        name: faker.person.fullName(),
        email: " ",
      };

      cy.listaTodosUsuarios().then((data) => {
        bodyRequisicao.email = data[0].email;
      });

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(422);
        expect(response.body.error).to.be.eq(mensagemErro);
      });
    });

    it("Deve retornar erro tentar atualizar um usuário sem o parâmetro email", function () {
      var userComId = "/users/" + usuarioCriado.id;

      var bodyRequisicao = {
        name: faker.person.fullName(),
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(400);
      });
    });

    it("Deve retornar erro tentar atualizar um usuário sem o parâmetro nome", function () {
      var userComId = "/users/" + usuarioCriado.id;

      var bodyRequisicao = {
        email: faker.internet.email(),
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(400);
      });
    });

    it("Deve retornar erro tentar atualizar um usuário com parâmetro nome com dado null", function () {
      var userComId = "/users/" + usuarioCriado.id;

      var bodyRequisicao = {
        name: null,
        email: faker.internet.email(),
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(400);
      });
    });
    it("Deve retornar erro tentar atualizar um usuário com parâmetro email com dado null", function () {
      var userComId = "/users/" + usuarioCriado.id;

      var bodyRequisicao = {
        name: faker.person.fullName(),
        email: null,
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(400);
      });
    });

    it("Deve retornar erro tentar atualizar um usuário com parâmetro nome com string vazia", function () {
      var userComId = "/users/" + usuarioCriado.id;

      var bodyRequisicao = {
        name: "",
        email: faker.internet.email(),
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(400);
      });
    });

    it("Deve retornar erro tentar atualizar um usuário com parâmetro email com string vazia", function () {
      var userComId = "/users/" + usuarioCriado.id;

      var bodyRequisicao = {
        name: faker.person.fullName(),
        email: "",
      };

      cy.request({
        method: METHOD_HTTP.PUT,
        url: userComId,
        body: bodyRequisicao,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.eq(400);
      });
    });
  });
});
