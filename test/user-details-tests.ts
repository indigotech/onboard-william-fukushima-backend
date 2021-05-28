import { User } from "../src/entity/User";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";

const expect = chai.expect;
var token = "";
const userQueryRequest = async (args) =>
  await request("localhost:4000")
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
        id: args.id,
      },
    })
    .set({ Authorization: token, "Content-Type": "application/json" });

describe("User details test", () => {
  it("Should show details for a specified user (selected by id).", async () => {
    const admin = new User();
    admin.email = "admin@taqtile.com";
    admin.name = "admin";
    admin.birthDate = "2000-01-01";
    admin.salt = await bcrypt.genSaltSync(10);
    admin.password = await bcrypt.hashSync("1234qwer", admin.salt);
    await getRepository(User).manager.save(admin);
    const user: any = await getRepository(User).manager.findOne("user", {
      email: "admin@taqtile.com",
    });
    token = await jwt.sign({ id: "1" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const response = await userQueryRequest({ id: user.id });

    expect(response.body.data.user.id).to.be.a("number");
    expect(response.body.data.user.name).to.equal("admin");
    expect(response.body.data.user.email).to.equal("admin@taqtile.com");
    expect(response.body.data.user.birthDate).to.equal("2000-01-01");
  });
});

describe("User details test - fail case. ID not found", () => {
  it("Should fail to find ID.", async () => {
    const admin = new User();
    admin.email = "admin@taqtile.com";
    admin.name = "admin";
    admin.birthDate = "2000-01-01";
    admin.salt = await bcrypt.genSaltSync(10);
    admin.password = await bcrypt.hashSync("1234qwer", admin.salt);
    await getRepository(User).manager.save(admin);
    token = await jwt.sign({ id: "1" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const response = await userQueryRequest({ id: 0 });

    expect(response.body.errors[0].message).to.equal("ID não listado.");
    expect(response.body.errors[0].httpCode).to.equal(404);
  });
});
