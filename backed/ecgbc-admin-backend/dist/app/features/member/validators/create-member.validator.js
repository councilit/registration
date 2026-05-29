"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMemberValidator = void 0;
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
// name,location,certificateNo,certificateIssuedDate,isInEthiopia,councilFellowshipId,memberCategoryId,typeId,stateId
exports.createMemberValidator = [
    (0, express_validator_1.check)("name").not().isEmpty().withMessage("name is required."),
    // check('regionId').optional().not().isEmpty().withMessage('regionId is required.'),
    (0, express_validator_1.check)("certificateNo")
        .not()
        .isEmpty()
        .withMessage("certificateNo is required."),
    (0, express_validator_1.check)("certificateIssuedDate")
        .not()
        .isEmpty()
        .withMessage("certificateIssuedDate is required."),
    (0, express_validator_1.check)("councilFellowshipId")
        .not()
        .isEmpty()
        .withMessage("councilFellowshipId is required."),
    (0, express_validator_1.check)("typeId").not().isEmpty().withMessage("typeId is required."),
    // check('stateId').not().isEmpty().withMessage('stateId is required.'),
    (0, express_validator_1.check)("isInEthiopia").isBoolean().withMessage("isInEthiopia is required."),
    validate_middleware_1.validate,
];
