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
import { getRepository} from "typeorm";

const expect = chai.expect;

before(async () => {
  await setup();

});
beforeEach(async () => {
  await getRepository(User).manager.clear("user");
});

require("./hello-world-tests");

require("./auth-create-user-tests");

require("./user-details-tests");

require("./login-test");

after(async () => {
  await getRepository(User).query('DROP TABLE "user"');
  await server.stop();
});
