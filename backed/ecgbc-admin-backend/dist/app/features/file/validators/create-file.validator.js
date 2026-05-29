"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFellowshipFileValidator = exports.createMemberFilesValidator = exports.createMemberFileValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.createMemberFileValidator = [
    (0, express_validator_1.body)("member").isUUID().withMessage("member must be UUID"),
    (0, express_validator_1.body)("memberFiles").notEmpty().withMessage("File name is required."),
    validate_middleware_1.validate,
];
exports.createMemberFilesValidator = [
    (0, express_validator_1.body)("member").isUUID().withMessage("member must be UUID"),
    (0, express_validator_1.body)("memberFiles").isArray().withMessage("Files must be an array"),
    validate_middleware_1.validate,
];
exports.createFellowshipFileValidator = [
    (0, express_validator_1.body)("member").isUUID().withMessage("member must be UUID"),
    validate_middleware_1.validate,
];
