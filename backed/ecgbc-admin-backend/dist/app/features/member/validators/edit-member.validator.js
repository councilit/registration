"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMemberValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.editMemberValidator = [
    (0, express_validator_1.check)('name').not().isEmpty().withMessage('name is required.'),
    (0, express_validator_1.check)("email").optional({ checkFalsy: true }).isEmail().withMessage("Email must be a valid email address."),
    validate_middleware_1.validate
];
