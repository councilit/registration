"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inactiveMemberValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.inactiveMemberValidator = [
    (0, express_validator_1.check)("reason").not().isEmpty().withMessage("reason is required."),
    validate_middleware_1.validate,
];
