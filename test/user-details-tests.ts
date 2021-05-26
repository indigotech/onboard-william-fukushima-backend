import { User } from "../src/entity/User";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import { getConnection } from "typeorm";

const expect = chai.expect;
var token = "";

describe("User details listing test", () => {
  it("Should show details for a specified user (selected by id).", async () => {
    token = await jwt.sign({ id : '1' }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
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
