"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = exports.FILTERS = exports.FILENAME = exports.DESTINANTIONS = exports.RESOURCES = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const app_error_1 = __importDefault(require("../shared/errors/app.error"));
exports.RESOURCES = {
    AVATAR: "AVATAR",
    REPORT: "REPORT",
    FILE: "FILE",
};
exports.DESTINANTIONS = {
    IMAGE: {
        AVATAR: "../../../public/images/avatar",
    },
    FILE: {
        REPORT: "../../../public/files/report",
        FILE: "../../../public/files/file",
    },
};
exports.FILENAME = {
    AVATAR: (originalname) => `avatar-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    REPORT: (originalname) => `report-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    FILE: (originalname) => `file-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    ORIGINAL: (originalname) => {
        const ext = originalname.substring(originalname.lastIndexOf('.'));
        const nameWithoutExt = originalname.substring(0, originalname.lastIndexOf('.'));
        return `${nameWithoutExt}-${(0, uuid_1.v4)()}${ext}`;
    },
};
exports.FILTERS = {
    IMAGE: {
        CONTENT: ["image/png", "image/jpg", "image/jpeg"],
        MESSAGE: "Only .png, .jpg and .jpeg format allowed!",
    },
    REPORT: {
        CONTENT: ["application/pdf"],
        MESSAGE: "Only .pdf format allowed!",
    },
    FILE: {
        CONTENT: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/jpg",
        ],
        MESSAGE: "Only .pdf, .doc, .xls, .png, .jpg, .jpeg format allowed!",
    },
};
const multerConfig = (resource, destination, filter, useOriginalname = false) => {
    /**
     * Multer disk storage
     */
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path_1.default.join(__dirname, destination));
        },
        filename: function (req, file, cb) {
            cb(null, useOriginalname ? exports.FILENAME['ORIGINAL'](file.originalname) : exports.FILENAME[resource](file.originalname));
        },
    });
    /**
     * Multer file upload with filters
     */
    const upload = (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 1024 * 1024 * 1024,
            fieldSize: 1024 * 1024 * 1024,
        },
        fileFilter: function (req, file, cb) {
            if (filter.CONTENT.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(null, false);
                return cb(new app_error_1.default(filter.MESSAGE, 400));
            }
        },
    });
    return upload;
};
exports.multerConfig = multerConfig;
