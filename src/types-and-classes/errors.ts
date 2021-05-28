class CustomError extends Error{
  httpCode: number;
  type: string;
  constructor(message, httpCode, name) {
    super(message);
    this.httpCode = httpCode;
    this.name = name
    this.type = "CustomError";
  }
}

export class ValidationError extends CustomError {
  constructor(message, code) {
    super(message, code, "ValidationError");
  }
}

export class BadCredentials extends CustomError {
  constructor(message) {
    super(message, 401, "BadCredentials");
  }
}
export class NotFound extends CustomError {
  constructor(message) {
    super(message, 404, "NotFound");
  }
}

export const formatError = (error: any) => {
  const originalError = error.originalError;
  if (originalError.type === "CustomError") {
    return {
      message: originalError
        ? originalError.message
        : "Ocorreu um erro na requisição.",
      httpCode: originalError.httpCode,
      details: originalError ? originalError.message : error.message,
    };
  } else {
    return {
      message: "Ocorreu um erro na requisição.",
      httpCode: originalError.httpCode,
      details: originalError ? originalError.message : error.message,
    };
  }
};
