"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolesQueryValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
const query_validator_1 = __importDefault(require("../../../shared/validators/query.validator"));
exports.getRolesQueryValidator = [
    ...query_validator_1.default,
    (0, express_validator_1.query)('state').optional().isUUID().withMessage('state must be UUID'),
    validate_middleware_1.validate
];
