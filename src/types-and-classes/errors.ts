export class ValidationError extends Error {
  code: number;
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "ValidationError";
  }
}

export class BadCredentials extends Error {
  code: number;
  constructor(message) {
    super(message);
    this.code = 401;
    this.name = "BadCredentials";
  }
}
export class NotFound extends Error {
  code: number;
  constructor(message) {
    super(message);
    this.code = 404;
    this.name = "BadCredentials";
  }
}
