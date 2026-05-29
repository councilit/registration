"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editRoleValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.editRoleValidator = [
    (0, express_validator_1.check)('name').optional().isString().withMessage('name should be a string'),
    (0, express_validator_1.check)('description').optional().isString().withMessage('description should be a string'),
    (0, express_validator_1.check)('permissions')
        .optional()
        .isArray().withMessage('The field must be an array.')
        .custom((value) => {
        const isValid = value.every((id) => {
            return typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
        });
        if (!isValid) {
            throw new Error('permissions must be an array of valid UUIDs.');
        }
        return true;
    }),
    validate_middleware_1.validate
];
