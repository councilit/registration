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
const FileController = __importStar(require("./controllers/file.controller"));
const FilesFilter = __importStar(require("./filters/file.filter"));
const StaffAuthMiddleware = __importStar(require("../auth/middlewares/auth.middleware"));
const Permissions = __importStar(require("../permission/enums/permission.enum"));
const create_file_validator_1 = require("./validators/create-file.validator");
// import { editMemberValidator } from "./validators/edit-report.validator";
const router = express_1.default.Router();
router
    .route("/")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_VIEW), FilesFilter.getFiles, FileController.getFiles);
router
    .route("/member")
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_CHANGE), FileController.uploadFile.pre, FileController.uploadFile.post, create_file_validator_1.createMemberFileValidator, FileController.createMemberFile);
router
    .route("/member/bulk-upload")
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_CHANGE), FileController.uploadMemberFiles.pre, FileController.uploadMemberFiles.post, create_file_validator_1.createMemberFileValidator, FileController.bulkUploadMemberFiles);
router
    .route("/fellowship/bulk-upload")
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_CHANGE), // Reuse CHANGE permission or define FELLOWSHIP_CHANGE
FileController.uploadFellowshipFiles.pre, FileController.uploadFellowshipFiles.post, FileController.bulkUploadFellowshipFiles);
router
    .route("/fellowship")
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_CHANGE), FileController.uploadFile.pre, FileController.uploadFile.post, FileController.createFellowshipFile);
router
    .route("/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_VIEW), FileController.getFile)
    .delete(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_DELETE), FileController.deleteFile);
exports.default = router;
