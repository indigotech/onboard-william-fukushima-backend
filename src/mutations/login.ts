import { getConnection } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ValidationError, BadCredentials } from "../types-and-classes/errors";
import { CompleteUserType } from "../types-and-classes/dataTypes";

const EMAIL_REGEX = /([a-z0-9])+@([a-z0-9])+.com/;
const PASSWORD_REGEX = /(?=.*[0-9])(?=.*([A-Za-z])).{7,}/;
const BIRTHDATE_REGEX =
  /(^(19|20)\d\d)[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])/;

export const login = async (_, args) => {
  if (!EMAIL_REGEX.test(args.email)) {
    throw new ValidationError("E-mail inválido.", 400);
  }
  if (!PASSWORD_REGEX.test(args.password)) {
    throw new ValidationError(
      "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra.",
      400
    );
  }
  const user: any = await getConnection().manager.findOne("user", {
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
