'use strict';

const util = require('util');

/*******************************************************************
 *   4xx - client errors
 *******************************************************************/
function BadRequestError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 400;
}

exports.BadRequestError = BadRequestError;
util.inherits(exports.BadRequestError, Error);

function UnauthorizedError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 401;
}

exports.UnauthorizedError = UnauthorizedError;
util.inherits(exports.UnauthorizedError, Error);

function ForbiddenError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 403;
}

exports.ForbiddenError = ForbiddenError;
util.inherits(exports.ForbiddenError, Error);

function NotFoundError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 404;
}

exports.NotFoundError = NotFoundError;
util.inherits(exports.NotFoundError, Error);

function MethodNotAllowedError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 405;
}

exports.MethodNotAllowedError = MethodNotAllowedError;
util.inherits(exports.MethodNotAllowedError, Error);

/*******************************************************************
 *   5xx - server errors
 *******************************************************************/
function InternalServerError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 500;
}

exports.InternalServerError = InternalServerError;
util.inherits(exports.InternalServerError, Error);

function NotImplementedError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 501;
}

exports.NotImplementedError = NotImplementedError;
util.inherits(exports.NotImplementedError, Error);

function BadGatewayError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 502;
}

exports.BadGatewayError = BadGatewayError;
util.inherits(exports.BadGatewayError, Error);

function ServiceUnavailableError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 503;
}

exports.ServiceUnavailableError = ServiceUnavailableError;
util.inherits(exports.ServiceUnavailableError, Error);

function InsufficientStorageError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 507;
}

exports.InsufficientStorageError = InsufficientStorageError;
util.inherits(exports.InsufficientStorageError, Error);

function NetworkAuthenticationRequiredError(message) {
     Error.captureStackTrace(this, this.constructor);
     this.name = this.constructor.name;
     this.message = message;
     this.httpStatusCode = 511;
}

exports.NetworkAuthenticationRequiredError = NetworkAuthenticationRequiredError;
util.inherits(exports.NetworkAuthenticationRequiredError, Error);