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
import { userSeeds } from "../src/seeding/seeds";

const expect = chai.expect;
var token = "";

const getUsers = async (offset, limit) =>
  await getRepository(User).find({
    select: ["id", "name", "email", "birthDate"],
    order: {
      name: "ASC",
    },
    skip: offset,
    take: limit,
  });

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

describe("Users paginated list test", function () {
  it("Should return a list of users for a specified limit and no offset.", async () => {
    await userSeeding();
    const expectedUsers = await getUsers(0, 10);
    token = await jwt.sign({ id: "1" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    
    const response = await usersQueryRequest({});

    expect(response.body.data.users.count).to.equal(50);
    expect(response.body.data.users.users.length).to.equal(10);
    expect(response.body.data.users.users).to.have.deep.members(expectedUsers);
    expect(response.body.data.users.hasNextPage).to.equal(true);
    expect(response.body.data.users.hasPreviousPage).to.equal(false);
    expect(response.body.data.users.offset).to.equal(0);
    expect(response.body.data.users.limit).to.equal(10);
  });

  it("Should return a list of users for a specified limit and middle page.", async () => {
    await userSeeding();
    const expectedUsers = await getUsers(20, 20);

    const response = await usersQueryRequest({ limit: 20, offset: 20 });

    expect(response.body.data.users.count).to.equal(50);
    expect(response.body.data.users.users.length).to.equal(20);
    expect(response.body.data.users.users).to.have.deep.members(expectedUsers);
    expect(response.body.data.users.hasNextPage).to.equal(true);
    expect(response.body.data.users.hasPreviousPage).to.equal(true);
    expect(response.body.data.users.offset).to.equal(20);
    expect(response.body.data.users.limit).to.equal(20);
  });

  it("Should return a list of users for a specified limit and last page.", async () => {
    await userSeeding();
    const expectedUsers = await getUsers(40, 10);

    const response = await usersQueryRequest({ limit: 10, offset: 40 });

    expect(response.body.data.users.count).to.equal(50);
    expect(response.body.data.users.users.length).to.equal(10);
    expect(response.body.data.users.users).to.have.deep.members(expectedUsers);
    expect(response.body.data.users.hasNextPage).to.equal(false);
    expect(response.body.data.users.hasPreviousPage).to.equal(true);
    expect(response.body.data.users.offset).to.equal(40);
    expect(response.body.data.users.limit).to.equal(10);
  });

  it("Should return a list of users for a specified limit and last page (requesting more than existing number of queries)", async () => {
    await userSeeding();
    const expectedUsers = await getUsers(40, 20);

    const response = await usersQueryRequest({ limit: 20, offset: 40 });

    expect(response.body.data.users.count).to.equal(50);
    expect(response.body.data.users.users.length).to.equal(10);
    expect(response.body.data.users.users).to.have.deep.members(expectedUsers);
    expect(response.body.data.users.hasNextPage).to.equal(false);
    expect(response.body.data.users.hasPreviousPage).to.equal(true);
    expect(response.body.data.users.offset).to.equal(40);
    expect(response.body.data.users.limit).to.equal(20);
  });
});
