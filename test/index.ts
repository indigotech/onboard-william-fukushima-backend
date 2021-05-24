import { setup } from "../server";

const assert = require("assert");
const request = require("supertest");
const { gql } = require("apollo-server");


before(async () => {
  await setup();
});

describe("Hello World Query", function () {
  it("Should respond with Hello World! json object", function (done) {
    request("localhost:4000")
      .post("/")
      .send({
        query: `query hello{
        hello{
           hello
          }
        }`,
      })
      .set("Accept", "application/json")
      .expect(
        200,
        {
          data: {
            hello: { hello: "Hello World!" },
          },
        },
        done
      );
  });
});
