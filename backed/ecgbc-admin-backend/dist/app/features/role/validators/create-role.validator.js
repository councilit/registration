"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoleValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.createRoleValidator = [
    (0, express_validator_1.check)('name').not().isEmpty().withMessage('name is required.'),
    (0, express_validator_1.check)('description').not().isEmpty().withMessage('description is required.'),
    (0, express_validator_1.check)('permissions')
        .isArray().withMessage('The field must be an array.')
        .custom((value) => {
        if (value.length > 0) {
            const isValid = value.every((id) => {
                return typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
            });
            if (!isValid) {
                throw new Error('permissions must be an array of valid UUIDs.');
            }
            return true;
        }
        else {
            throw new Error('permissions must be an array of valid UUIDs.');
        }
    }),
    validate_middleware_1.validate
];
