import { getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { emailValidation, passwordValidation, birthDateValidation } from "../field-validations";

const saltRounds = 10;

export const createUser = async (_, args, context) => {

  jwt.verify(context.authScope, process.env.JWT_SECRET);
  const user = new User();
  user.name = args.name;

  emailValidation(args.email);
  passwordValidation(args.password);
  birthDateValidation(args.birthDate);
  
  user.email = args.email;
  user.salt = await bcrypt.genSaltSync(saltRounds);
  user.password = await bcrypt.hashSync(args.password, user.salt);
  user.birthDate = args.birthDate;

  return getRepository(User).manager.save(user)
};
