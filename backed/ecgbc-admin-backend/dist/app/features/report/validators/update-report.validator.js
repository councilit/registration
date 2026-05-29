"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFellowshipReportValidator = exports.updateMemberReportValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.updateMemberReportValidator = [
    (0, express_validator_1.body)("reportId").isUUID().withMessage("report must be UUID"),
    // body("report").notEmpty().withMessage("Report file is required."),
    validate_middleware_1.validate,
];
exports.updateFellowshipReportValidator = [
    (0, express_validator_1.body)("year").not().isEmpty().withMessage("year is required."),
    (0, express_validator_1.body)("member").isUUID().withMessage("member must be UUID"),
    validate_middleware_1.validate,
];
