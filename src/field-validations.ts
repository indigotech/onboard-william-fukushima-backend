import {ValidationError} from "./types-and-classes/errors";

const EMAIL_REGEX = /([a-z0-9])+@([a-z0-9])+.com/;
const PASSWORD_REGEX = /(?=.*[0-9])(?=.*([A-Za-z])).{7,}/;
const BIRTHDATE_REGEX =
  /(^(19|20)\d\d)[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])/;

export const emailValidation = (email) => {
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("E-mail inválido.", 400);
  }
};
export const passwordValidation = (password) => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new ValidationError(
      "Senha deve conter no mínimo 7 caracteres com pelo menos um número e uma letra.",
      400
    );
  }
};
export const birthDateValidation = (birthDate) => {
  if (!BIRTHDATE_REGEX.test(birthDate)) {
    throw new ValidationError(
      "Data de Nascimento deve estar no formato yyyy-mm-dd",
      400
    );
  }
};
