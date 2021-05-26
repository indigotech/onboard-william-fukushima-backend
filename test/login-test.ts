import { User } from "../src/entity/User";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import { createConnections, getConnection } from "typeorm";
import { user } from "../src/queries/user";

const expect = chai.expect;
describe("login Mutation", () => {
  it("Should login a user in the database and return Token.", async () => {
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `
      mutation Login($email : String!, $password : String!, $rememberMe : Boolean){
        login(
          email: $email,
          password: $password,
          rememberMe: $rememberMe
        )
          {
            user{
              id
              name
              email
              birthDate
            }
            token
          }
      }`,
        variables: {
          email: "admin@taqtile.com",
          password: process.env.ADMIN_PASS,
          rememberMe: false,
        },
      });
    expect(response.body.data.login.token).to.be.a("string");
    expect(response.body.data.login.user.email).to.equal("admin@taqtile.com");
    expect(response.body.data.login.user.name).to.equal("admin");
    expect(response.body.data.login.user.id).to.equal(1);
    expect(response.body.data.login.user.birthDate).to.equal("2000-01-01");
    expect(jwt.verify(response.body.data.login.token, process.env.JWT_SECRET).id).to.equal(1);
  });
});
