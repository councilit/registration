"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataLookupsQueryValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.getDataLookupsQueryValidator = [
    (0, express_validator_1.query)('type').optional().isString().notEmpty().withMessage('Type is required'),
    (0, express_validator_1.query)('category').optional().isString().notEmpty().withMessage('Category is required'),
    validate_middleware_1.validate
];
