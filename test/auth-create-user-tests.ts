import { User } from "../src/entity/User";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { CompleteUserType } from "../src/dataTypes";

import { createConnections, getConnection } from "typeorm";

const expect = chai.expect;

var token = "";

const DUPLICATE_ERROR_TEXT = /duplicate key value violates unique constraint.*/;
const createUser = `
mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
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
}`;

describe("login and createUser w/ auth Mutations", () => {
  it("Should create a user in the database.", async () => {

    token = await jwt.sign({ id : '1' }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: createUser,
        variables: {
          name: "a",
          email: "a@a.com",
          password: "1234asfdf",
          birthDate: "2001-08-03",
        },
      })
      .set({ Authorization: token, "Content-Type": "application/json" });
    expect(response.body.data.createUser.id).to.be.a("number");
    expect(response.body.data.createUser.name).to.equal("a");
    expect(response.body.data.createUser.email).to.equal("a@a.com");
    expect(response.body.data.createUser.birthDate).to.equal("2001-08-03");

    const createdUser: any = await getConnection().manager.findOne("User", {
      email: "a@a.com",
    });

    expect(createdUser.id).to.equal(2);
    expect(createdUser.name).to.equal("a");
    expect(createdUser.email).to.equal("a@a.com");
    expect(createdUser.birthDate).to.equal("2001-08-03");
    expect(createdUser.salt).to.be.a("String");
    expect(createdUser.password).to.be.a("String");
  });
});

describe("login and createUser w/ auth Mutations - Duplicate Error case", () => {
  it("Should create a duplicate user in the database.", async () => {
    const user = new User();
    user.name = "b";
    user.email = "b@b.com";
    user.salt = await bcrypt.genSaltSync(10);
    user.password = await bcrypt.hashSync("1234afdsavcz", user.salt);
    user.birthDate = "2001-09-15";
    await getConnection().manager.save(user);
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: createUser,
        variables: {
          name: "b2",
          email: "b@b.com",
          password: "1234asfdf",
          birthDate: "2001-08-03",
        },
      })
      .set({ Authorization: token, "Content-Type": "application/json" });
    expect(DUPLICATE_ERROR_TEXT.test(response.body.errors[0].message)).to.equal(
      true
    );
  });
});

describe("createUser Mutation - Validation Error cases", () => {
  it("Should Fail to create users - E-mail Error.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: createUser,
        variables: {
          name: "a",
          email: "amdiasdfasdf",
          password: "1234asfdf",
          birthDate: "2001-08-03",
        },
      })
      .set({ Authorization: token, "Content-Type": "application/json" });
    expect(response.body.errors[0].message).to.equal("E-mail inválido.");
  });
  it("Should Fail to create users - Password Error.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: createUser,
        variables: {
          name: "c",
          email: "c@c.com",
          password: "12345",
          birthDate: "2001-08-03",
        },
      })
      .set({ Authorization: token, "Content-Type": "application/json" });
    expect(response.body.errors[0].message).to.equal(
      "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra."
    );
  });
  it("Should Fail to create users - Birth Date Error.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: createUser,
        variables: {
          name: "c",
          email: "c@c.com",
          password: "1234asfdf",
          birthDate: "2001/08/03",
        },
      })
      .set({ Authorization: token, "Content-Type": "application/json" });
    expect(response.body.errors[0].message).to.equal(
      "Data de Nascimento deve estar no formato yyyy-mm-dd"
    );
  });
});