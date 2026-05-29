"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorController = exports.catchAsync = void 0;
const app_error_1 = __importDefault(require("../shared/errors/app.error"));
const catchAsync = (controller) => (req, res, next) => Promise.resolve(controller(req, res, next)).catch(next);
exports.catchAsync = catchAsync;
const errorController = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    // console.log('err.code');
    // console.log(err.code);
    // console.log(err)
    if (err.name == "TokenExpiredError") {
        err = new app_error_1.default("The token has expired", 401);
    }
    else if (err.name == "JsonWebTokenError") {
        err = new app_error_1.default("The token is invalid", 401);
    }
    else if (err.code === "P2025") {
        err = new app_error_1.default(`${err.meta.modelName} not found`, 400);
    }
    else if (err.code === "P2002") {
        err = new app_error_1.default(`${err.meta.modelName} already exists`, 400);
    }
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        console.log(err);
        res.status(err.statusCode).json({
            status: err.status,
            message: "Oops, something went wrong!",
            err,
        });
    }
    next();
};
exports.errorController = errorController;
