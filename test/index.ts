import * as dotenv from "dotenv";

dotenv.config({ path: "./test.env" });

import { setup } from "../server";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";

import { getConnection } from "typeorm";

const expect = chai.expect;

before(async () => {
  await setup();
  await getConnection().manager.clear("User");
});

beforeEach(async () => {
  await getConnection().manager.clear("User");
});

describe("Hello World Query", () => {
  it("Should respond with Hello World! json object.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `query hello{
        hello{
           hello
          }
        }`,
      });
    await expect(response.statusCode).to.equal(200);
    await expect(response.body)
      .to.have.property("data")
      .to.have.property("hello")
      .to.have.property("hello")
      .to.equal("Hello World!");
  });
});

describe("createUser Mutation", () => {
  it("Should create a user in the database.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
        createUser(
          name: $name,
          email: $email,
          password: $password,
          birthDate: $birthDate)
        {
          id
          name
          email
          password
          birthDate
        }
      }`,
        variables: {
          name: "a",
          email: "amdi@asdfasdf.com",
          password: "1234asfdf",
          birthDate: "2001-08-03",
        },
      });
    expect(response.body.data.createUser.id).to.be.a("number");
    expect(response.body.data.createUser.name).to.equal("a");
    expect(response.body.data.createUser.email).to.equal("amdi@asdfasdf.com");
    expect(response.body.data.createUser.birthDate).to.equal("2001-08-03");
  });
});

const DUPLICATE_ERROR_TEXT = /duplicate key value violates unique constraint.*/;

describe("createUser Mutation", () => {
  it("Should create a duplicate user in the database.", async () => {
    const response1 = await request("localhost:4000")
      .post("/")
      .send({
        query: `mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
        createUser(
          name: $name,
          email: $email,
          password: $password,
          birthDate: $birthDate)
        {
          id
          name
          email
          password
          birthDate
        }
      }`,
        variables: {
          name: "a",
          email: "amdi@asdfasdf.com",
          password: "1234asfdf",
          birthDate: "2001-08-03",
        },
      });
    const response2 = await request("localhost:4000")
      .post("/")
      .send({
        query: `mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
        createUser(
          name: $name,
          email: $email,
          password: $password,
          birthDate: $birthDate)
        {
          id
          name
          email
          password
          birthDate
        }
      }`,
        variables: {
          name: "a",
          email: "amdi@asdfasdf.com",
          password: "1234asfdf",
          birthDate: "2001-08-03",
        },
      });
    console.log(response2.body.errors[0].message);
    expect(DUPLICATE_ERROR_TEXT.test(response2.body.errors[0].message)).to.equal(
      true
    );
  });
});

describe("createUser Mutation", () => {
  it("Should Fail to create users - E-mail Error.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
        createUser(
          name: $name,
          email: $email,
          password: $password,
          birthDate: $birthDate)
        {
          id
          name
          email
          password
          birthDate
        }
      }`,
        variables: {
          name: "a",
          email: "amdiasdfasdf",
          password: "1234asfdf",
          birthDate: "2001-08-03",
        },
      });
    expect(response.body.errors[0].message).to.equal("E-mail inválido.");
  });
  it("Should Fail to create users - Password Error.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
      createUser(
        name: $name,
        email: $email,
        password: $password,
        birthDate: $birthDate)
      {
        id
        name
        email
        password
        birthDate
      }
    }`,
        variables: {
          name: "a",
          email: "amdi@asdfasdf.com",
          password: "12345",
          birthDate: "2001-08-03",
        },
      });
    expect(response.body.errors[0].message).to.equal(
      "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra."
    );
  });
  it("Should Fail to create users - Birth Date Error.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
      createUser(
        name: $name,
        email: $email,
        password: $password,
        birthDate: $birthDate)
      {
        id
        name
        email
        password
        birthDate
      }
    }`,
        variables: {
          name: "a",
          email: "amdi@asdfasdf.com",
          password: "1234asfdf",
          birthDate: "2001/08/03",
        },
      });
    expect(response.body.errors[0].message).to.equal(
      "Data de Nascimento deve estar no formato yyyy-mm-dd"
    );
  });
});
