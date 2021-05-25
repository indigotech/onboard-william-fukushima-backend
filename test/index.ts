import * as dotenv from "dotenv";

dotenv.config({ path: "./test.env" });

import { User } from "../src/entity/User";
import { setup } from "../src/server";
import * as assert from "assert";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as chai from "chai";
import * as bcrypt from "bcrypt";

import { getConnection } from "typeorm";

const expect = chai.expect;
var token = "";

before(async () => {
  await setup();
});

require("./hello-world-tests");

require("./auth-create-user-tests");

require("./user-details-tests");

after(async () => {
  await getConnection().query('DROP TABLE "user"');
});
