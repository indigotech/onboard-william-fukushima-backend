import { userSeeds } from "./seeds";
import * as request from "supertest";
import { gql } from "apollo-server";
import * as jwt from "jsonwebtoken";
import { UserType } from "../types-and-classes/dataTypes";
import { getRepository } from "typeorm";
import { User } from "../entity/User"
import { user } from "../queries/user";
import * as bcrypt from "bcrypt";

export const userSeeding = async () => {

  const token = await jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
  const users = [];

  for (const user of userSeeds){
    const newUser = new User();
    newUser.name = user.name
    newUser.email = user.email;
    newUser.salt = await bcrypt.genSaltSync(1);
    newUser.password = await bcrypt.hashSync(user.password, newUser.salt);
    newUser.birthDate = user.birthDate;
    users.push(newUser);
  };
  await getRepository(User).save(users);
};
