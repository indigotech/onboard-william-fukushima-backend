import { User } from "../src/entity/User";

import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";

import { getConnection } from "typeorm";

const expect = chai.expect;
var token = "";

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
