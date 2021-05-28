import { getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ValidationError, BadCredentials } from "../types-and-classes/errors";
import { emailValidation, passwordValidation } from "../field-validations";

export const login = async (_, args) => {
  emailValidation(args.email);
  passwordValidation(args.password);

  const user: any = await getRepository(User).manager.findOne("user", {
    email: args.email,
  });
  var token: string = "";

  if (!user) {
    throw new BadCredentials("Credenciais inválidas.");
  }

  const password: string = await bcrypt.hashSync(args.password, user.salt);

  if (password !== user.password) {
    throw new BadCredentials("Credenciais inválidas.");
  }

  const expirationTime = args.rememberMe ? "2 hours" : "2 weeks";

  token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: expirationTime,
  });

  return {
    user: user,
    token: token,
  };
};
