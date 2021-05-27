import { User } from "../src/entity/User";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { userSeeding } from "../src/seeding/seeding";
import { argsToArgsConfig } from "graphql/type/definition";

const expect = chai.expect;
var token = "";

const usersQueryRequest = async (args) =>
  await request("localhost:4000")
    .post("/")
    .send({
      query: `query Users($limit: Int,$offset: Int){
        users(limit: $limit, offset: $offset){
          users{
              id
              name
              email
              birthDate
              }
          limit
          offset
          count
          hasPreviousPage
          hasNextPage
        }
      }`,
      variables: {
        limit: args.limit,
        offset: args.offset,
      },
    })
    .set({ Authorization: token, "Content-Type": "application/json" });


describe("Users paginated list test", function(){
  this.timeout(0);
  it("Should return a list of users for a specified limit and no offset.", async () => {
    await userSeeding();
    token = await jwt.sign({ id: "1" }, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

    const response = await usersQueryRequest({ limit: 20 });

    expect(response.body.data.users.count).to.equal(20);
    expect(response.body.data.users.users.length).to.equal(20);
    expect(response.body.data.users.hasNextPage).to.equal(true);
    expect(response.body.data.users.hasPreviousPage).to.equal(false);
    expect(response.body.data.users.offset).to.equal(0);
    expect(response.body.data.users.limit).to.equal(20);
  });

  it("Should return a list of users for a specified limit and middle page.", async () => {
    await userSeeding();
    
    const response = await usersQueryRequest({ limit: 20, offset: 20 });

    expect(response.body.data.users.count).to.equal(20);
    expect(response.body.data.users.users.length).to.equal(20);
    expect(response.body.data.users.hasNextPage).to.equal(true);
    expect(response.body.data.users.hasPreviousPage).to.equal(true);
    expect(response.body.data.users.offset).to.equal(20);
    expect(response.body.data.users.limit).to.equal(20);
  });

  it("Should return a list of users for a specified limit and last page.", async () => {
    await userSeeding();

    const response = await usersQueryRequest({ limit: 10, offset: 40 });

    expect(response.body.data.users.count).to.equal(10);
    expect(response.body.data.users.users.length).to.equal(10);
    expect(response.body.data.users.hasNextPage).to.equal(false);
    expect(response.body.data.users.hasPreviousPage).to.equal(true);
    expect(response.body.data.users.offset).to.equal(40);
    expect(response.body.data.users.limit).to.equal(10);
  });

  it("Should return a list of users for a specified limit and no offset.", async () => {
    await userSeeding();

    const response = await usersQueryRequest({ limit: 20, offset: 40 });

    expect(response.body.data.users.count).to.equal(10);
    expect(response.body.data.users.users.length).to.equal(10);
    expect(response.body.data.users.hasNextPage).to.equal(false);
    expect(response.body.data.users.hasPreviousPage).to.equal(true);
    expect(response.body.data.users.offset).to.equal(40);
    expect(response.body.data.users.limit).to.equal(20);
  });
});
