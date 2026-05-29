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
exports.deleteFile = exports.createFellowshipFile = exports.bulkUploadFellowshipFiles = exports.bulkUploadMemberFiles = exports.createMemberFile = exports.getFile = exports.getFiles = exports.uploadFellowshipFiles = exports.uploadMemberFiles = exports.uploadFile = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const multer_config_1 = require("../../../config/multer.config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.FILE, multer_config_1.DESTINANTIONS.FILE.FILE, multer_config_1.FILTERS.FILE);
const uploadWithUploadedFilename = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.FILE, multer_config_1.DESTINANTIONS.FILE.FILE, multer_config_1.FILTERS.FILE, true);
// RBAC helpers: rely on allowedFellowshipIds
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
exports.uploadFile = {
    pre: upload.single("file"),
    post: (req, _, next) => {
        console.log("req.file");
        console.log(req.file);
        if (req.file) {
            req.body.file = req.file.filename;
        }
        next();
    },
};
exports.uploadMemberFiles = {
    pre: uploadWithUploadedFilename.array("memberFiles", 5), // Allows up to 5 files with field name 'memberFiles'
    post: (req, res, next) => {
        if (req.files && Array.isArray(req.files)) {
            req.body.memberFiles = req.files.map((file) => ({
                fileName: file.originalname,
                file: file.filename,
            }));
        }
        next();
    },
};
exports.uploadFellowshipFiles = {
    pre: uploadWithUploadedFilename.array("fellowshipFiles", 5),
    post: (req, res, next) => {
        if (req.files && Array.isArray(req.files)) {
            req.body.fellowshipFiles = req.files.map((file) => ({
                fileName: file.originalname,
                file: file.filename,
            }));
        }
        next();
    },
};
exports.getFiles = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 5;
    const skip = (page - 1) * limit;
    const whereFilters = Object.assign({}, req.filters);
    console.log('Applied filters in controller:', whereFilters);
    const [files, total] = yield Promise.all([
        db_config_1.default.file.findMany({
            where: whereFilters,
            include: { member: true, councilFellowship: true },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
            skip,
        }),
        db_config_1.default.file.count({
            where: whereFilters,
            take: limit,
            skip,
        }),
    ]);
    console.log('Found files:', files.length, 'total:', total);
    res.status(200).json({
        status: "success",
        data: {
            files,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getFile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield db_config_1.default.file.findUnique({
        where: {
            id: req.params.id,
        },
        include: { member: true, councilFellowship: true },
    });
    if (!file) {
        return next(new app_error_1.default(`File with ID ${req.params.id} does not exist`, 400));
    }
    // RBAC: ensure access to referenced entity
    if (file.memberId) {
        yield assertAccessToMemberId(req, file.memberId);
    }
    else if (file.councilFellowshipId) {
        yield assertAccessToFellowshipId(req, file.councilFellowshipId);
    }
    res.status(200).json({
        status: "success",
        data: {
            file,
        },
    });
}));
exports.createMemberFile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    let { member, file, fileName } = req.body;
    // RBAC: ensure staff can access the member
    yield assertAccessToMemberId(req, member);
    const newFile = yield db_config_1.default.file.create({
        data: {
            memberId: member,
            fileName: fileName,
            file: file ? file : "",
        },
        include: { member: true, councilFellowship: true },
    });
    res.status(200).json({
        status: "success",
        data: {
            file: newFile,
        },
    });
}));
exports.bulkUploadMemberFiles = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('req.body');
    console.log(req.body);
    let { member, memberFiles, isFromSelamMinster } = req.body;
    // RBAC: ensure staff can access the member
    yield assertAccessToMemberId(req, member);
    const memberExists = yield db_config_1.default.member.findUnique({ where: { id: member } });
    if (!memberExists) {
        return next(new app_error_1.default(`Member with ID ${member} not found`, 404));
    }
    const createdFileRecords = [];
    for (const file of memberFiles) {
        const newFileRecord = yield db_config_1.default.file.create({
            data: {
                memberId: member,
                fileName: file.fileName,
                file: file ? file.file : "",
                isFromSelamMinster: isFromSelamMinster === 'true' ? true : false
            },
            include: { member: true, councilFellowship: true },
        });
        createdFileRecords.push(newFileRecord);
    }
    res.status(201).json({
        status: "success",
        message: `${memberFiles.length} files uploaded successfully.`,
        data: { files: createdFileRecords },
    });
}));
exports.bulkUploadFellowshipFiles = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { fellowship, fellowshipFiles } = req.body;
    console.log("bulkUploadFellowshipFiles body:", req.body);
    if (!fellowship) {
        return next(new app_error_1.default("Fellowship ID is required", 400));
    }
    // Check if fellowshipFiles exists
    if (!fellowshipFiles || !Array.isArray(fellowshipFiles)) {
        return next(new app_error_1.default("No valid files provided", 400));
    }
    yield assertAccessToFellowshipId(req, fellowship);
    const fellowshipExists = yield db_config_1.default.councilFellowship.findUnique({ where: { id: fellowship } });
    if (!fellowshipExists) {
        return next(new app_error_1.default(`Fellowship with ID ${fellowship} not found`, 404));
    }
    const createdFileRecords = [];
    for (const file of fellowshipFiles) {
        const newFileRecord = yield db_config_1.default.file.create({
            data: {
                councilFellowshipId: fellowship,
                fileName: file.fileName,
                file: file.file,
            },
            include: { member: true, councilFellowship: true },
        });
        createdFileRecords.push(newFileRecord);
    }
    res.status(201).json({
        status: "success",
        message: `${fellowshipFiles.length} files uploaded successfully.`,
        data: { files: createdFileRecords },
    });
}));
exports.createFellowshipFile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(req.body);
    let { file, fileName, fellowship } = req.body;
    // RBAC: ensure staff can access the fellowship
    yield assertAccessToFellowshipId(req, fellowship);
    const newFile = yield db_config_1.default.file.create({
        data: {
            councilFellowshipId: fellowship !== null && fellowship !== void 0 ? fellowship : undefined,
            fileName: (_a = fileName !== null && fileName !== void 0 ? fileName : file) !== null && _a !== void 0 ? _a : "uploaded",
            file: file ? file : "",
        },
        include: { member: true, councilFellowship: true },
    });
    res.status(200).json({
        status: "success",
        data: {
            file: newFile,
        },
    });
}));
exports.deleteFile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield db_config_1.default.file.findUnique({
        where: { id: req.params.id },
    });
    if (!file) {
        return next(new app_error_1.default(`File with ID ${req.params.id} does not exist`, 400));
    }
    // RBAC: ensure access to referenced entity before deletion
    if (file.memberId) {
        yield assertAccessToMemberId(req, file.memberId);
    }
    else if (file.councilFellowshipId) {
        yield assertAccessToFellowshipId(req, file.councilFellowshipId);
    }
    // Get the file path
    const filePath = file.file ? path_1.default.join(__dirname, "../../" + multer_config_1.DESTINANTIONS.FILE.FILE, file.file) : "";
    console.log("destination", multer_config_1.DESTINANTIONS.FILE.FILE);
    console.log("filePath", filePath);
    // Check if file exists on the disk
    try {
        if (filePath && fs_1.default.existsSync(filePath)) {
            yield fs_1.default.promises.unlink(filePath);
        }
    }
    catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
        // Don't throw - continue with database cleanup
    }
    // // Delete the file record from the database
    yield db_config_1.default.file.delete({
        where: { id: req.params.id },
    });
    res.status(200).json({
        status: "success",
        data: {
            file,
        },
    });
}));
