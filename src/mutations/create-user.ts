import { getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {
  emailValidation,
  passwordValidation,
  birthDateValidation,
} from "../field-validations";
import { Address } from "../entity/Address";

const saltRounds = 10;

export const createUser = async (_, args, context) => {
  jwt.verify(context.authScope, process.env.JWT_SECRET);
  const user = new User();
  user.name = args.name;

  emailValidation(args.email);
  passwordValidation(args.password);
  birthDateValidation(args.birthDate);
  emailValidation(args.email);

  user.email = args.email;
  user.salt = await bcrypt.genSaltSync(saltRounds);
  user.password = await bcrypt.hashSync(args.password, user.salt);
  user.birthDate = args.birthDate;

  user.addresses = args.addresses;

  if (user.addresses) {
    await getRepository(Address).save(args.addresses);
  }
  return await getRepository(User).manager.save(user);
};
