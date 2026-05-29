"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaffValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.createStaffValidator = [
    (0, express_validator_1.body)("firstName", "firstName is required").not().isEmpty(),
    (0, express_validator_1.body)("lastName", "lastName is required").not().isEmpty(),
    (0, express_validator_1.body)('email').isEmail().trim().escape().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (0, express_validator_1.body)('roleId').isUUID().withMessage('roleId must be UUID'),
    validate_middleware_1.validate
];
