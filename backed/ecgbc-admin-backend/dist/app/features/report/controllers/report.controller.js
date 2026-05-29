"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.updateMemberReport = exports.createFellowshipReport = exports.createMemberReport = exports.getReport = exports.getReports = exports.uploadReport = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const report_status_enum_1 = require("../enums/report-status.enum");
const multer_config_1 = require("../../../config/multer.config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.REPORT, multer_config_1.DESTINANTIONS.FILE.REPORT, multer_config_1.FILTERS.REPORT);
// RBAC helpers
function getAllowedFellowshipIdsByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const staff = yield db_config_1.default.staff.findUnique({ where: { email }, select: { id: true } });
        if (!staff)
            return [];
        const links = yield db_config_1.default.staffFellowship.findMany({
            where: { staffId: staff.id },
            select: { fellowshipId: true },
        });
        return links.map((l) => l.fellowshipId);
    });
}
function getAllowedFellowshipIdsFromReq(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const reqAny = req;
        const pre = (_a = reqAny.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds;
        if (pre && pre.length > 0)
            return pre;
        const email = (_b = reqAny.user) === null || _b === void 0 ? void 0 : _b.email;
        if (!email)
            return [];
        return getAllowedFellowshipIdsByEmail(email);
    });
}
function assertAccessToMemberId(req, memberId) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqAny = req;
        if (reqAny.isAdminRole)
            return;
        const member = yield db_config_1.default.member.findUnique({
            where: { id: memberId },
            select: { councilFellowshipId: true },
        });
        if (!member)
            throw new app_error_1.default(`Member with ID ${memberId} does not exist`, 400);
        const allowedFellowshipIds = yield getAllowedFellowshipIdsFromReq(req);
        const fellowshipId = member.councilFellowshipId;
        if (Array.isArray(allowedFellowshipIds) &&
            allowedFellowshipIds.length > 0 &&
            fellowshipId &&
            !allowedFellowshipIds.includes(fellowshipId)) {
            throw new app_error_1.default("Access denied for this fellowship", 403);
        }
    });
}
function assertAccessToFellowshipId(req, fellowshipId) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqAny = req;
        if (reqAny.isAdminRole)
            return;
        const allowedFellowshipIds = yield getAllowedFellowshipIdsFromReq(req);
        if (Array.isArray(allowedFellowshipIds) &&
            allowedFellowshipIds.length > 0 &&
            !allowedFellowshipIds.includes(fellowshipId)) {
            throw new app_error_1.default("Access denied for this fellowship", 403);
        }
    });
}
/**
 * Upload Middleware
 */
exports.uploadReport = {
    pre: upload.single("report"),
    post: (req, _, next) => {
        console.log("req.file");
        console.log(req.file);
        if (req.file) {
            req.body.file = req.file.filename;
        }
        next();
    },
};
exports.getReports = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 5;
    const skip = (page - 1) * limit;
    const whereFilters = Object.assign({}, req.filters);
    const [reports, total] = yield Promise.all([
        db_config_1.default.report.findMany({
            where: whereFilters,
            include: { status: true, member: true, councilFellowship: true },
            orderBy: {
                year: "desc",
            },
            take: limit,
            skip,
        }),
        db_config_1.default.report.count({
            where: whereFilters,
            take: limit,
            skip,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            reports,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const report = yield db_config_1.default.report.findUnique({
        where: {
            id: req.params.id,
        },
        include: { status: true, member: { include: { type: { select: { value: true } } } }, councilFellowship: true },
    });
    if (!report) {
        return next(new app_error_1.default(`Report with ID ${req.params.id} does not exist`, 400));
    }
    // RBAC check for single report
    if (report.member) {
        yield assertAccessToMemberId(req, report.member.id);
    }
    else if (report.councilFellowshipId) {
        yield assertAccessToFellowshipId(req, report.councilFellowshipId);
    }
    res.status(200).json({
        status: "success",
        data: {
            report,
        },
    });
}));
exports.createMemberReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { year, reportedAt, member, file, crv, remark } = req.body;
    const reportedStatus = yield db_config_1.default.dataLookup.findUnique({
        where: { value: report_status_enum_1.ReportStatus.REPORTED },
    });
    if (!reportedStatus) {
        return next(new app_error_1.default('Reported status not found in DataLookup', 500));
    }
    const reportedAtDate = new Date(reportedAt);
    // Lookup member to get councilFellowshipId
    const memberRecord = yield db_config_1.default.member.findUnique({
        where: { id: member },
        select: { id: true, councilFellowshipId: true },
    });
    if (!memberRecord) {
        return next(new app_error_1.default(`Member with ID ${member} does not exist`, 400));
    }
    // RBAC enforcement for creating member report
    yield assertAccessToMemberId(req, memberRecord.id);
    // Upsert logic: update if exists, else create
    const existingReport = yield db_config_1.default.report.findFirst({
        where: {
            memberId: member,
            year: Number(year),
        },
    });
    if (existingReport) {
        try {
            const updatedReport = yield db_config_1.default.report.update({
                where: { id: existingReport.id },
                data: {
                    reportedAt: reportedAtDate,
                    file: file || existingReport.file,
                    crv: crv || existingReport.crv,
                    remark: remark || existingReport.remark,
                    statusId: reportedStatus.id,
                },
                include: { status: true, member: true, councilFellowship: true },
            });
            res.status(200).json({
                status: "success",
                message: "Report updated successfully",
                data: { report: updatedReport },
            });
            return;
        }
        catch (updateError) {
            return next(new app_error_1.default(`Failed to update report: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`, 500));
        }
    }
    const report = yield db_config_1.default.report.create({
        data: {
            reportedAt: reportedAtDate,
            year: Number(year),
            statusId: reportedStatus.id,
            memberId: member,
            councilFellowshipId: memberRecord.councilFellowshipId,
            file: file || "",
            crv: crv || "",
            remark: remark || "",
        },
        include: { status: true, member: true, councilFellowship: true },
    });
    res.status(200).json({
        status: "success",
        data: { report },
    });
}));
exports.createFellowshipReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    let { year, fellowship, file, crv, remark } = req.body;
    const reportedStatus = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: report_status_enum_1.ReportStatus.REPORTED },
    }));
    // RBAC enforcement for creating fellowship report
    yield assertAccessToFellowshipId(req, fellowship);
    const report = yield db_config_1.default.report.create({
        data: {
            year: Number(year),
            statusId: reportedStatus.id,
            councilFellowshipId: fellowship,
            file: file ? file : "",
            crv: crv ? crv : "",
            remark: remark ? remark : "",
        },
        include: { status: true, member: true, councilFellowship: true },
    });
    res.status(200).json({
        status: "success",
        data: {
            report,
        },
    });
}));
exports.updateMemberReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const removeFile = req.body.report === 'remove';
    let { reportId, file, crv, remark, reportedAt, } = req.body;
    const reportedStatus = (yield db_config_1.default.dataLookup.findUnique({ where: { value: report_status_enum_1.ReportStatus.REPORTED } }));
    // RBAC: ensure the staff can access this report before update
    const existingReportFull = yield db_config_1.default.report.findUnique({
        where: { id: reportId },
        include: { member: { include: { type: { select: { value: true } } } } },
    });
    if (!existingReportFull) {
        return next(new app_error_1.default(`Report with ID ${reportId} does not exist`, 400));
    }
    if (existingReportFull.memberId) {
        yield assertAccessToMemberId(req, existingReportFull.memberId);
    }
    else if (existingReportFull.councilFellowshipId) {
        yield assertAccessToFellowshipId(req, existingReportFull.councilFellowshipId);
    }
    const updatedData = {
        statusId: reportedStatus.id,
    };
    if (file)
        updatedData.file = file;
    if (remark)
        updatedData.remark = remark;
    if (crv)
        updatedData.crv = crv;
    if (reportedAt)
        updatedData.reportedAt = new Date(reportedAt);
    const existingReport = yield db_config_1.default.report.findUnique({
        where: { id: reportId },
    });
    if (!existingReport) {
        return next(new app_error_1.default(`Report with ID ${reportId} does not exist`, 400));
    }
    if (removeFile) {
        const oldFilePath = existingReport.file
            ? path_1.default.join(__dirname, "../../" + multer_config_1.DESTINANTIONS.FILE.REPORT, existingReport.file)
            : null;
        if (oldFilePath && fs_1.default.existsSync(oldFilePath)) {
            try {
                fs_1.default.unlinkSync(oldFilePath);
                console.log(`Successfully deleted old file: ${oldFilePath}`);
            }
            catch (err) {
                console.error(`Error deleting old file ${oldFilePath}:`, err);
                // Optionally, you might want to return an error or log more formally
            }
        }
        updatedData.file = "";
    }
    // Handle file update/removal
    if (file !== undefined) { // Check if 'file' property exists in the request body
        const oldFilePath = existingReport.file
            ? path_1.default.join(__dirname, "../../" + multer_config_1.DESTINANTIONS.FILE.REPORT, existingReport.file)
            : null;
        // User wants to update with a new file
        if (oldFilePath && fs_1.default.existsSync(oldFilePath)) {
            try {
                fs_1.default.unlinkSync(oldFilePath);
                console.log(`Successfully deleted old file: ${oldFilePath}`);
            }
            catch (err) {
                console.error(`Error deleting old file ${oldFilePath}:`, err);
                // Optionally, you might want to return an error or log more formally
            }
        }
        updatedData.file = file; // Set new file in database
    }
    const report = yield db_config_1.default.report.update({
        where: { id: reportId },
        data: updatedData,
        include: { status: true, member: true, councilFellowship: true },
    });
    if (!report) {
        return next(new app_error_1.default(`Report with ID ${reportId} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            report,
        },
    });
}));
exports.deleteReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const reportId = req.params.id;
    if (!reportId) {
        return next(new app_error_1.default('Report ID is required', 400));
    }
    // Find the report to get its details, especially the file name
    const reportToDelete = yield db_config_1.default.report.findUnique({
        where: { id: reportId },
        include: { member: { include: { type: { select: { value: true } } } } },
    });
    if (!reportToDelete) {
        return next(new app_error_1.default(`Report with ID ${reportId} not found`, 404));
    }
    // RBAC enforcement before delete
    if (reportToDelete.memberId) {
        yield assertAccessToMemberId(req, reportToDelete.memberId);
    }
    else if (reportToDelete.councilFellowshipId) {
        yield assertAccessToFellowshipId(req, reportToDelete.councilFellowshipId);
    }
    // If the report has an associated file, delete it
    if (reportToDelete.file) {
        const filePath = path_1.default.join(__dirname, "../../" + multer_config_1.DESTINANTIONS.FILE.REPORT, reportToDelete.file);
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
                console.log(`Successfully deleted file: ${filePath}`);
            }
            catch (err) {
                console.error(`Error deleting file ${filePath}:`, err);
            }
        }
    }
    // Delete the report from the database
    yield db_config_1.default.report.delete({
        where: { id: reportId },
    });
    res.status(204).json({
        status: "success",
        data: null, // Or a success message if preferred for 204
    });
}));
