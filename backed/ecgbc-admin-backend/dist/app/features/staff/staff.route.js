"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StaffController = __importStar(require("./controllers/staff.controller"));
const StaffAuthMiddleware = __importStar(require("../auth/middlewares/auth.middleware"));
const Permissions = __importStar(require("../permission/enums/permission.enum"));
const create_staff_validator_1 = require("./validators/create-staff.validator");
const get_staffs_validator_1 = require("./validators/get-staffs.validator");
const edit_staff_validator_1 = require("./validators/edit-staff.validator");
const router = express_1.default.Router();
router
    .route("/")
    .get(StaffAuthMiddleware.verifyStaff, get_staffs_validator_1.getStaffsQueryValidator, StaffAuthMiddleware.restrictStaff(Permissions.StaffPermission.STAFF_VIEW), StaffController.getStaffs)
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.StaffPermission.STAFF_ADD), StaffController.uploadImage.pre, StaffController.uploadImage.post, create_staff_validator_1.createStaffValidator, StaffController.createStaff);
router
    .route("/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.StaffPermission.STAFF_VIEW), StaffController.getStaff)
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.StaffPermission.STAFF_CHANGE), StaffController.uploadImage.pre, StaffController.uploadImage.post, edit_staff_validator_1.editStaffValidator, StaffController.updateStaff);
router
    .route("/update/:id")
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictToOwner, StaffController.uploadImage.pre, StaffController.uploadImage.post, edit_staff_validator_1.editStaffValidator, StaffController.updateStaff);
exports.default = router;
