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
exports.updateRole = exports.createRole = exports.getRole = exports.getRoles = void 0;
const role_type_enum_1 = require("../enums/role-type.enum");
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const data_lookup_enum_1 = require("../../data-lookup/enums/data-lookup.enum");
exports.getRoles = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = query._page || 1;
    const limit = query._limit || 5;
    const skip = (page - 1) * limit;
    const [roles, total] = yield Promise.all([db_config_1.default.role.findMany({
            where: {},
            include: { permissions: true, },
            take: limit,
            skip,
        }), db_config_1.default.role.count({
            where: {},
            take: limit,
            skip,
        })]);
    res.status(200).json({
        status: "success",
        data: {
            roles,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getRole = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield db_config_1.default.role.findUnique({
        where: {
            id: req.params.id,
        },
        include: {}
    });
    if (!role) {
        return next(new app_error_1.default(`Role with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            role,
        },
    });
}));
exports.createRole = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, permissions } = req.body;
    const state = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE }
    }));
    const type = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: role_type_enum_1.RoleType.CUSTOM }
    }));
    const role = yield db_config_1.default.role.create({
        data: {
            name: name,
            description: description,
            stateId: state.id,
            typeId: type.id,
            permissions: {
                connect: permissions.map((permission) => ({
                    id: permission
                }))
            }
        },
        include: { permissions: true }
    });
    res.status(200).json({
        status: "success",
        data: {
            role,
        },
    });
}));
exports.updateRole = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, permissions } = req.body;
    let role = yield db_config_1.default.role.findUnique({ where: { id: req.params.id }, include: { permissions: true } });
    if (!role) {
        return next(new app_error_1.default(`Role with ID ${req.params.id} does not exist`, 400));
    }
    const existingPermissions = role.permissions.map(permission => permission.id) || [];
    const permissionsToAdd = permissions.filter((permissionId) => !existingPermissions.includes(permissionId));
    const permissionsToRemove = existingPermissions.filter(permissionId => !permissions.includes(permissionId));
    let updatedData = {};
    if (name)
        updatedData.name = name;
    if (description)
        updatedData.description = description;
    role = yield db_config_1.default.role.update({ where: { id: req.params.id }, data: Object.assign({ permissions: {
                connect: permissionsToAdd.map((permissionId) => ({ id: permissionId })),
                disconnect: permissionsToRemove.map((permissionId) => ({ id: permissionId })),
            } }, updatedData), include: {
            permissions: true
        } });
    res.status(200).json({
        status: "success",
        data: {
            role,
        },
    });
}));
