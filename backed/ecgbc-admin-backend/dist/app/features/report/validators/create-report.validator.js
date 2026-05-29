"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFellowshipReportValidator = exports.createMemberReportValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.createMemberReportValidator = [
    (0, express_validator_1.body)("year").not().isEmpty().withMessage("year is required."),
    (0, express_validator_1.body)("reportedAt")
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage("reportedAt is required."),
    (0, express_validator_1.body)("member").isUUID().withMessage("member must be UUID"),
    // body("report").notEmpty().withMessage("Report file is required."),
    validate_middleware_1.validate,
];
exports.createFellowshipReportValidator = [
    (0, express_validator_1.body)("year").not().isEmpty().withMessage("year is required."),
    validate_middleware_1.validate,
];
