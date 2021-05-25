export class ValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "ValidationError";
  }
  code = 0;
}

export class BadCredentials extends Error {
  constructor(message) {
    super(message);
    this.code = 401;
    this.name = "BadCredentials";
  }
  code = 0;
}
export class NotFound extends Error {
  constructor(message) {
    super(message);
    this.code = 404;
    this.name = "BadCredentials";
  }
  code = 0;
}
