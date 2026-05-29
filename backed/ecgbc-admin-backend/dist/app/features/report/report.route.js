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
const ReportController = __importStar(require("./controllers/report.controller"));
const ReportFilter = __importStar(require("./filters/report.filter"));
const StaffAuthMiddleware = __importStar(require("../auth/middlewares/auth.middleware"));
const Permissions = __importStar(require("../permission/enums/permission.enum"));
const create_report_validator_1 = require("./validators/create-report.validator");
const update_report_validator_1 = require("./validators/update-report.validator");
// import { editMemberValidator } from "./validators/edit-report.validator";
const router = express_1.default.Router();
router
    .route("/")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_VIEW), ReportFilter.getReports, ReportController.getReports);
router
    .route("/member")
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_CHANGE), ReportController.uploadReport.pre, ReportController.uploadReport.post, create_report_validator_1.createMemberReportValidator, ReportController.createMemberReport)
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_CHANGE), ReportController.uploadReport.pre, ReportController.uploadReport.post, update_report_validator_1.updateMemberReportValidator, ReportController.updateMemberReport);
router
    .route("/member/:id")
    .delete(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_DELETE), ReportController.deleteReport);
router
    .route("/fellowship")
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_CHANGE), ReportController.uploadReport.pre, ReportController.uploadReport.post, create_report_validator_1.createFellowshipReportValidator, ReportController.createFellowshipReport);
router
    .route("/fellowship/:id")
    .delete(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_DELETE), ReportController.deleteReport);
router
    .route("/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_VIEW), ReportController.getReport)
    .delete(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(Permissions.MemberPermission.MEMBER_DELETE), ReportController.deleteReport);
exports.default = router;
