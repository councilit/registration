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
exports.restrictStaff = exports.verifyStaff = void 0;
exports.restrictToOwner = restrictToOwner;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("util");
const envalid_1 = require("envalid");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const permission_enum_1 = require("../../permission/enums/permission.enum");
const error_config_1 = require("../../../config/error.config");
const db_config_1 = __importDefault(require("../../../config/db.config"));
const role_type_enum_1 = require("../../role/enums/role-type.enum");
const data_lookup_enum_1 = require("../../data-lookup/enums/data-lookup.enum");
const env = (0, envalid_1.cleanEnv)(process.env, {
    JWT_ACCESS_SECRET_KEY: (0, envalid_1.str)(),
    JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)(),
    JWT_REFRESH_SECRET_KEY: (0, envalid_1.str)(),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)(),
});
exports.verifyStaff = (0, error_config_1.catchAsync)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let token = null;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new app_error_1.default("Your not logged in", 401));
    }
    //Verify token
    //@ts-ignore
    const payload = yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(token, 
    //@ts-ignore
    env.JWT_ACCESS_SECRET_KEY);
    const staff = yield db_config_1.default.staff.findUnique({
        where: {
            id: payload.staff.id,
        }, include: { role: { include: { permissions: true, type: true } } }
    });
    if (!staff) {
        return next(new app_error_1.default("The staff related to the token no longer exists", 401));
    }
    // Special-case: Ephrem should NOT be able to deactivate/restore members
    if (((_a = staff.email) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "ephibillioner@gmail.com") {
        staff.role.permissions = staff.role.permissions.filter((p) => p.codeName !== permission_enum_1.MemberPermission.MEMBER_DEACTIVATE);
    }
    // Gezu must be strictly read-only across the system
    if (((_b = staff.email) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === "gezuabiy@gmail.com") {
        staff.role.permissions = staff.role.permissions.filter((p) => String(p.codeName || "").startsWith("view_"));
    }
    // Use a local any-cast to avoid TS complaints while global augmentation stabilizes
    const reqAny = req;
    reqAny.staff = staff; // prisma type includes relations; cast to augmented AuthenticatedStaff
    reqAny.isAdminRole = ((_c = staff.role.type) === null || _c === void 0 ? void 0 : _c.value) === role_type_enum_1.RoleType.OWNER;
    // back-compat for legacy request.user usages
    reqAny.user = { email: staff.email };
    // Build base RBAC scope for all non-admin staff
    if (!reqAny.isAdminRole) {
        // Default RBAC container
        const rbac = {};
        // Fellowships scope via junction table
        try {
            const links = yield db_config_1.default.staffFellowship.findMany({
                where: { staffId: staff.id },
                select: { fellowshipId: true },
            });
            rbac.allowedFellowshipIds = links.map((l) => l.fellowshipId);
        }
        catch (_) {
            rbac.allowedFellowshipIds = [];
        }
        // Active-only if staff lacks deactivate permission
        const permissionCodes = staff.role.permissions.map((p) => p.codeName);
        rbac.activeOnly = !permissionCodes.includes(permission_enum_1.MemberPermission.MEMBER_DEACTIVATE);
        // Entity type constraints for specific scoped staff (Ephrem)
        const email = staff.email.toLowerCase();
        if (email === "ephibillioner@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        // Abinet: can see both ministries and churches within assigned fellowships
        if (email === "abateabinet94@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        // Chaltu: can see both ministries and churches within assigned fellowships
        if (email === "kiyagudina07@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        // Mercy: can see both ministries and churches within assigned fellowships
        if (email === "mehirit2067@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        // Gezu: now restricted Staff; allow both MINISTRY & CHURCH, scoped by assigned fellowships only
        if (email === "gezuabiy@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
            // No category-based derivation anymore; scope comes from StaffFellowship links
        }
        reqAny.rbac = rbac;
    }
    next();
}));
const restrictStaff = (permission) => (0, error_config_1.catchAsync)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.staff) {
        //@ts-ignore
        const permissions = req.staff.role.permissions.map((permission) => permission.codeName);
        if (!permissions.includes(permission)) {
            return next(new app_error_1.default("You're not allowed to perform current operation", 403));
        }
    }
    next();
}));
exports.restrictStaff = restrictStaff;
function restrictToOwner(req, res, next) {
    var _a;
    if (((_a = req.staff) === null || _a === void 0 ? void 0 : _a.id) != req.params.id) {
        return next(new app_error_1.default(`You can only update your own profile`, 400));
    }
    next();
}
