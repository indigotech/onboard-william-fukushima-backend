export class ValidationError extends Error {
  httpCode: number;
  type: string;
  constructor(message, code) {
    super(message);
    this.httpCode = code;
    this.name = "ValidationError";
    this.type = "CustomError";
  }
}

export class BadCredentials extends Error {
  httpCode: number;
  type: string;
  constructor(message) {
    super(message);
    this.httpCode = 401;
    this.name = "BadCredentials";
    this.type = "CustomError";
  }
}
export class NotFound extends Error {
  httpCode: number;
  type: string;
  constructor(message) {
    super(message);
    this.httpCode = 404;
    this.name = "NotFound";
    this.type = "CustomError";
  }
}

export const formatError = (error: any) => {
  const originalError = error.originalError;
  if(originalError.type === "CustomError"){
    return {
      message: originalError ? originalError.message : "Ocorreu um erro na requisição.",
      httpCode: originalError.httpCode,
      details: originalError? originalError.message : error.message,
    }
  } else{
    return {
      message: "Ocorreu um erro na requisição.",
      httpCode: originalError.httpCode,
      details: originalError? originalError.message : error.message,
    }
  } 
}