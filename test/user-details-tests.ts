import { User } from "../src/entity/User";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";

import { getConnection } from "typeorm";

const expect = chai.expect;
var token = "";

describe("User details listing test", () => {
  it("Should show details for a specified user (selected by id).", async () => {
    const loginResponse = await request("localhost:4000")
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
    token = loginResponse.body.data.login.token;
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `query User($id: Int!){
          user(
            id: $id)
          {
            id
            name
            email
            birthDate
          }
        }`,
        variables: {
          id: 1,
        },
      })
      .set({ Authorization: token, "Content-Type": "application/json" });
    expect(response.body.data.user.id).to.equal(1);
    expect(response.body.data.user.name).to.equal("admin");
    expect(response.body.data.user.email).to.equal("admin@taqtile.com");
    expect(response.body.data.user.birthDate).to.equal("2000-01-01");
  });
});
