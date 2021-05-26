import * as dotenv from "dotenv";

dotenv.config({ path: "./test.env" });

import { User } from "../src/entity/User";
import { setup } from "../src/server";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";
import {server} from "../src/server";
import { getConnection } from "typeorm";

const expect = chai.expect;

before(async () => {
  await setup();
  const admin = new User();
  admin.email = "admin@taqtile.com";
  admin.name = "admin";
  admin.birthDate = "2000-01-01";
  admin.salt = await bcrypt.genSaltSync(10);
  admin.password = await bcrypt.hashSync(process.env.ADMIN_PASS, admin.salt);
  await getConnection().manager.save(admin);
});

require("./hello-world-tests");

require("./auth-create-user-tests");

require("./user-details-tests");

require("./login-test");

after(async () => {
  await getConnection().query('DROP TABLE "user"');
  await server.stop();
});
