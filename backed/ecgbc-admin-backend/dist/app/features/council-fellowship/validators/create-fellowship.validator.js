"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFellowshipValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.createFellowshipValidator = [
    (0, express_validator_1.check)("name").not().isEmpty().withMessage("name is required."),
    (0, express_validator_1.check)("region").not().isEmpty().withMessage("region is required."),
    (0, express_validator_1.check)("certificateNo")
        .not()
        .isEmpty()
        .withMessage("certificateNo is required."),
    (0, express_validator_1.check)("certificateIssuedDate")
        .not()
        .isEmpty()
        .withMessage("certificateIssuedDate is required."),
    (0, express_validator_1.check)("isInEthiopia").isBoolean().withMessage("isInEthiopia is required."),
    validate_middleware_1.validate,
];
