"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissionsQueryValidator = void 0;
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.getPermissionsQueryValidator = [
    // query('term').isString().isLength({ min: 1 }).withMessage('Search term must be at least 3 characters long'),
    validate_middleware_1.validate
];
