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
exports.updateStaff = exports.createStaff = exports.getStaff = exports.getStaffs = exports.uploadImage = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const data_lookup_enum_1 = require("../../data-lookup/enums/data-lookup.enum");
const multer_config_1 = require("../../../config/multer.config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.AVATAR, multer_config_1.DESTINANTIONS.IMAGE.AVATAR, multer_config_1.FILTERS.IMAGE);
/**
 * Upload Middleware
 */
exports.uploadImage = {
    pre: upload.single("avatar"),
    post: (req, _, next) => {
        console.log("req.file");
        console.log(req.file);
        if (req.file) {
            req.body.avatar = req.file.filename;
        }
        next();
    },
};
exports.getStaffs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = query._page || 1;
    const limit = query._limit || 5;
    const skip = (page - 1) * limit;
    const [staffs, total] = yield Promise.all([
        db_config_1.default.staff.findMany({
            where: {},
            include: { role: true, state: true },
            take: limit,
            skip,
        }),
        db_config_1.default.staff.count({
            where: {},
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            staffs,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const staff = yield db_config_1.default.staff.findUnique({
        where: {
            id: req.params.id,
        },
        include: { role: true, state: true },
    });
    if (!staff) {
        return next(new app_error_1.default(`Staff with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            staff,
        },
    });
}));
exports.createStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, phoneNumber, password, avatar, roleId, stateId, } = req.body;
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    let state;
    if (stateId) {
        state = (yield db_config_1.default.dataLookup.findUnique({
            where: { id: stateId },
        }));
    }
    else {
        state = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE },
        }));
    }
    const staff = yield db_config_1.default.staff.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`,
            email: email,
            phoneNumber: phoneNumber ? phoneNumber : "",
            password: hashedPassword,
            avatar: avatar ? avatar : "",
            roleId: roleId,
            stateId: state.id,
        },
        include: { role: true, state: true },
    });
    res.status(200).json({
        status: "success",
        data: {
            staff,
        },
    });
}));
exports.updateStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, phoneNumber, password, avatar, roleId, stateId, } = req.body;
    let updatedData = {};
    if (firstName)
        updatedData.firstName = firstName;
    if (lastName)
        updatedData.lastName = lastName;
    if (email)
        updatedData.email = email;
    if (phoneNumber)
        updatedData.phoneNumber = phoneNumber;
    if (avatar)
        updatedData.avatar = avatar;
    if (password)
        updatedData.password = yield bcryptjs_1.default.hash(password, 10);
    if (stateId)
        updatedData.stateId = stateId;
    if (roleId)
        updatedData.roleId = roleId;
    // console.log(`updatedData `, updatedData);
    const staff = yield db_config_1.default.staff.update({
        where: { id: req.params.id },
        data: updatedData,
        include: {
            role: {
                include: {
                    type: true,
                    permissions: {
                        select: {
                            id: true,
                            codeName: true,
                        },
                    },
                },
            },
            state: true,
        },
    });
    if (!staff) {
        return next(new app_error_1.default(`Staff with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            staff,
        },
    });
}));
