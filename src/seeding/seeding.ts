import { userSeeds } from "./seeds";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as jwt from "jsonwebtoken";
import { UserType } from "../types-and-classes/dataTypes";

export const userSeeding = async () => {

  const token = await jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
  for(const user of userSeeds){
    const response = await request("localhost:4000")
      .post("/")
      .send({
        query: `
              mutation CreateUser($name: String!, $email: String!, $password: String!, $birthDate: String!){
                createUser(
                  name: $name,
                  email: $email,
                  password: $password,
                  birthDate: $birthDate)
                {
                  id
                  name
                  email
                  password
                  birthDate
                }
              }`,
        variables: {
          name: user.name,
          email: user.email,
          password: user.password,
          birthDate: user.birthDate,
        },
      })
      .set({ Authorization: token, "Content-Type": "application/json" });
  };
};
