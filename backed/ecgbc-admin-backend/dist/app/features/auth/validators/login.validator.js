"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.loginValidator = [
    (0, express_validator_1.check)('email').isEmail().withMessage('Please enter a valid email address.'),
    (0, express_validator_1.check)('password').isLength({ min: 8 }).withMessage('Password must be 8 characters long'),
    validate_middleware_1.validate,
];
