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
exports.seedRolePermissions = void 0;
const path_1 = __importDefault(require("path"));
const node_1 = __importDefault(require("read-excel-file/node"));
const db_config_1 = __importDefault(require("../../app/config/db.config"));
const role_type_enum_1 = require("../../app/features/role/enums/role-type.enum");
const seedRolePermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = (yield (0, node_1.default)(path_1.default.join(__dirname, "data.xlsx")));
    const rolePermissions = [];
    const permissions = yield db_config_1.default.permission.findMany();
    const ownerRole = (yield db_config_1.default.role.findFirst({
        where: { type: {
                value: role_type_enum_1.RoleType.OWNER
            } }
    }));
    const adminRole = (yield db_config_1.default.role.findFirst({
        where: { type: {
                value: role_type_enum_1.RoleType.ADMIN
            } }
    }));
    const lookAdminRole = (yield db_config_1.default.role.findFirst({
        where: { type: {
                value: role_type_enum_1.RoleType.LOOK_ADMIN
            } }
    }));
    for (const row of data.slice(1)) {
        const permission = permissions.find((permission) => permission.codeName === row[0]);
        if (row[1] === "✔️") {
            rolePermissions.push({
                roleId: ownerRole.id,
                permissionId: permission === null || permission === void 0 ? void 0 : permission.id
            });
        }
        if (row[2] === "✔️") {
            rolePermissions.push({
                roleId: adminRole.id,
                permissionId: permission === null || permission === void 0 ? void 0 : permission.id
            });
        }
        if (row[3] === "✔️") {
            rolePermissions.push({
                roleId: lookAdminRole.id,
                permissionId: permission === null || permission === void 0 ? void 0 : permission.id
            });
        }
    }
    yield Promise.all(rolePermissions.map((rolePermission) => __awaiter(void 0, void 0, void 0, function* () {
        const role = yield db_config_1.default.role.findUnique({
            where: { id: rolePermission.roleId },
            include: { permissions: true }, // Include permissions in the query
        });
        const permissionExists = role === null || role === void 0 ? void 0 : role.permissions.some((permission) => permission.id === rolePermission.permissionId);
        if (!permissionExists) {
            yield db_config_1.default.role.update({
                where: { id: rolePermission.roleId },
                data: {
                    permissions: {
                        connect: {
                            id: rolePermission.permissionId
                        }
                    }
                },
            });
        }
    })));
});
exports.seedRolePermissions = seedRolePermissions;
