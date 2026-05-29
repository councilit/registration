"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validateAbstractQuery = [
    (0, express_validator_1.query)('_page')
        .optional()
        .isInt({ min: 1 }).withMessage('_page must be a positive integer')
        .toInt(),
    (0, express_validator_1.query)('_limit')
        .optional()
        .isInt({ min: 1 }).withMessage('_limit must be a positive integer')
        .toInt(),
    (0, express_validator_1.query)('_search')
        .optional()
        .isString().withMessage('_search must be a string')
];
exports.default = validateAbstractQuery;
