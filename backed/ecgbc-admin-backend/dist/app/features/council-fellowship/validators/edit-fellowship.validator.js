"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFellowshipValidator = void 0;
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
exports.editFellowshipValidator = [
    // check('name').not().isEmpty().withMessage('name is required.'),
    // check('description').not().isEmpty().withMessage('description is required.'),
    validate_middleware_1.validate
];
