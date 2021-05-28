import { User } from "../src/entity/User";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { user } from "../src/queries/user";
import { getRepository } from "typeorm";

const loginRequest = async (args) =>
  await request("localhost:4000")
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
        email: args.email,
        password: args.password,
        rememberMe: args.rememberMe,
      },
    });

const expect = chai.expect;

describe("login test", () => {
  it("Should login a user in the database and return Token.", async () => {
    const admin = new User();
    admin.email = "admin@taqtile.com";
    admin.name = "admin";
    admin.birthDate = "2000-01-01";
    admin.salt = await bcrypt.genSaltSync(10);
    admin.password = await bcrypt.hashSync("1234qwer", admin.salt);
    await getRepository(User).manager.save(admin);

    const response: any = await loginRequest({
      email: "admin@taqtile.com",
      password: "1234qwer",
      rememberMe: false,
    });

    expect(response.body.data.login.token).to.be.a("string");
    expect(response.body.data.login.user.email).to.equal("admin@taqtile.com");
    expect(response.body.data.login.user.name).to.equal("admin");
    expect(response.body.data.login.user.id).to.be.a("number");
    expect(response.body.data.login.user.birthDate).to.equal("2000-01-01");
    expect(
      jwt.verify(response.body.data.login.token, process.env.JWT_SECRET).id
    ).to.be.a("number");
  });
});

describe("login test - fail case", () => {
  it("Should fail to login a user in the database and return ValidationError - pass.", async () => {
    const admin = new User();
    admin.email = "admin@taqtile.com";
    admin.name = "admin";
    admin.birthDate = "2000-01-01";
    admin.salt = await bcrypt.genSaltSync(10);
    admin.password = await bcrypt.hashSync("1234qwer", admin.salt);
    await getRepository(User).manager.save(admin);

    const response: any = await loginRequest({
      email: "admin@taqtile.com",
      password: "aasd",
      rememberMe: false,
    });

    expect(response.body.errors[0].message).to.equal(
      "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra."
    );
    expect(response.body.errors[0].httpCode).to.equal(400);
  });

  it("Should fail to login a user in the database and return ValidationError - email.", async () => {
    const admin = new User();
    admin.email = "admin@taqtile.com";
    admin.name = "admin";
    admin.birthDate = "2000-01-01";
    admin.salt = await bcrypt.genSaltSync(10);
    admin.password = await bcrypt.hashSync("1234qwer", admin.salt);
    await getRepository(User).manager.save(admin);

    const response: any = await loginRequest({
      email: "admintaqtile.com",
      password: "1234qwer",
      rememberMe: false,
    });

    expect(response.body.errors[0].message).to.equal("E-mail inválido.");
    expect(response.body.errors[0].httpCode).to.equal(400);
  });

  it("Should fail to login a user in the database and return BadCredentials error - Invalid user", async () => {
    const admin = new User();
    admin.email = "admi@taqtile.com";
    admin.name = "admin";
    admin.birthDate = "2000-01-01";
    admin.salt = await bcrypt.genSaltSync(10);
    admin.password = await bcrypt.hashSync("1234qwer", admin.salt);
    await getRepository(User).manager.save(admin);

    const response: any = await loginRequest({
      email: "admin@taqtile.com",
      password: "1234qwer",
      rememberMe: false,
    });

    expect(response.body.errors[0].message).to.equal("Credenciais inválidas.");
    expect(response.body.errors[0].httpCode).to.equal(401);
  });

  it("Should fail to login a user in the database and return BadCredentials error - Wrong pass.", async () => {
    const admin = new User();
    admin.email = "admin@taqtile.com";
    admin.name = "admin";
    admin.birthDate = "2000-01-01";
    admin.salt = await bcrypt.genSaltSync(10);
    admin.password = await bcrypt.hashSync("1234qwer", admin.salt);
    await getRepository(User).manager.save(admin);

    const response: any = await loginRequest({
      email: "admin@taqtile.com",
      password: "coxinha123",
      rememberMe: false,
    });

    expect(response.body.errors[0].message).to.equal("Credenciais inválidas.");
    expect(response.body.errors[0].httpCode).to.equal(401);
  });
});
