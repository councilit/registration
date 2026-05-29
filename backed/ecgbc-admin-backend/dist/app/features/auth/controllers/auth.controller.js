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
exports.getDashboardStats = exports.loginStaff = exports.getAuthenticatedStaff = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("util");
const envalid_1 = require("envalid");
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const db_config_1 = __importDefault(require("../../../config/db.config"));
const data_lookup_enum_1 = require("../../data-lookup/enums/data-lookup.enum");
const week_helper_1 = require("../../../shared/helpers/week.helper");
const permission_enum_1 = require("../../permission/enums/permission.enum");
const role_type_enum_1 = require("../../role/enums/role-type.enum");
const env = (0, envalid_1.cleanEnv)(process.env, {
    JWT_ACCESS_SECRET_KEY: (0, envalid_1.str)(),
    JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)(),
    JWT_REFRESH_SECRET_KEY: (0, envalid_1.str)(),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)(),
});
exports.getAuthenticatedStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let staff = yield db_config_1.default.staff.findFirst({
        where: { id: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id }, // narrow cast to accommodate Request augmentation
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
        },
    });
    // Strip MEMBER_DEACTIVATE for Ephrem in response so UI hides deactivate/restore
    if (((_b = staff === null || staff === void 0 ? void 0 : staff.email) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === "ephibillioner@gmail.com") {
        staff.role.permissions = staff.role.permissions.filter((p) => p.codeName !== permission_enum_1.MemberPermission.MEMBER_DEACTIVATE);
    }
    // Gezu must be strictly read-only in UI and API checks
    if (((_c = staff === null || staff === void 0 ? void 0 : staff.email) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "gezuabiy@gmail.com") {
        staff.role.permissions = staff.role.permissions.filter((p) => String(p.codeName || "").startsWith("view_"));
    }
    // Include RBAC information for frontend filtering
    const rbac = req.rbac;
    res.json({
        data: {
            status: "success",
            staff,
            rbac,
        },
    });
}));
exports.loginStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { email, password } = req.body;
    let staff = yield db_config_1.default.staff.findFirst({
        where: { email: email, state: { value: data_lookup_enum_1.CommonObjectState.ACTIVE } },
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
        return next(new app_error_1.default(`Staff not found`, 400));
    }
    // Strip MEMBER_DEACTIVATE for Ephrem in response so UI hides deactivate/restore
    if (((_a = staff.email) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "ephibillioner@gmail.com") {
        staff.role.permissions = staff.role.permissions.filter((p) => p.codeName !== permission_enum_1.MemberPermission.MEMBER_DEACTIVATE);
    }
    // Gezu must be strictly read-only in UI and API checks
    if (((_b = staff.email) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === "gezuabiy@gmail.com") {
        staff.role.permissions = staff.role.permissions.filter((p) => String(p.codeName || "").startsWith("view_"));
    }
    //Check Password
    const isMatch = yield bcryptjs_1.default.compare(password, staff.password);
    if (!isMatch) {
        return res.status(400).json({
            errors: [{ msg: "Password not correct." }],
        });
    }
    // Build RBAC scope for frontend filtering
    let rbac = null;
    const isAdmin = ((_c = staff.role.type) === null || _c === void 0 ? void 0 : _c.value) === role_type_enum_1.RoleType.OWNER;
    if (!isAdmin) {
        rbac = {};
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
        // Entity type constraints for specific scoped staff
        const email = staff.email.toLowerCase();
        if (email === "ephibillioner@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        if (email === "abateabinet94@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        if (email === "kiyagudina07@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        if (email === "mehirit2067@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
        if (email === "gezuabiy@gmail.com") {
            rbac.allowedTypeValues = [data_lookup_enum_1.MemberType.MINISTRY, data_lookup_enum_1.MemberType.CHURCH];
        }
    }
    //Return jsonwebtoken :to login the user
    const payload = {
        staff: {
            id: staff.id,
        },
    };
    const accessToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.sign)(payload, 
    //@ts-ignore
    env.JWT_ACCESS_SECRET_KEY, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
    const refreshToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.sign)(payload, 
    //@ts-ignore
    env.JWT_REFRESH_SECRET_KEY, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
    res.status(200).json({
        data: {
            status: "success",
            staff,
            accessToken,
            refreshToken,
            rbac,
        },
    });
}));
exports.getDashboardStats = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { startOfWeek, endOfWeek } = (0, week_helper_1.getWeekRange)();
    // RBAC-aware stats: admins see all; scoped staff (e.g., gezu) see only allowed scope
    const reqAny = req;
    const isAdmin = !!reqAny.isAdminRole;
    if (isAdmin) {
        let [totalCouncilFellowships, weeklyCouncilFellowships] = yield Promise.all([
            db_config_1.default.councilFellowship.count({
                where: {},
            }),
            db_config_1.default.councilFellowship.count({
                where: {
                    createdAt: {
                        gte: startOfWeek,
                        lte: endOfWeek,
                    },
                },
            }),
        ]);
        let [totalChurches, weeklyChurches] = yield Promise.all([
            db_config_1.default.member.count({
                where: {
                    isActive: true,
                    type: {
                        value: data_lookup_enum_1.MemberType.CHURCH,
                    },
                },
            }),
            db_config_1.default.member.count({
                where: {
                    isActive: true,
                    type: {
                        value: data_lookup_enum_1.MemberType.CHURCH,
                    },
                    createdAt: {
                        gte: startOfWeek,
                        lte: endOfWeek,
                    },
                },
            }),
        ]);
        let [totalMinistries, weeklyMinistries] = yield Promise.all([
            db_config_1.default.member.count({
                where: {
                    isActive: true,
                    type: {
                        value: data_lookup_enum_1.MemberType.MINISTRY,
                    },
                },
            }),
            db_config_1.default.member.count({
                where: {
                    isActive: true,
                    type: {
                        value: data_lookup_enum_1.MemberType.MINISTRY,
                    },
                    createdAt: {
                        gte: startOfWeek,
                        lte: endOfWeek,
                    },
                },
            }),
        ]);
        // Total deleted (for super admin)
        let totalDeleted = 0;
        if (isAdmin) {
            // Assuming 'objecjt_state_deleted' based on previous checks
            // We should fetch the ID first to be safe, or use the value if querying by lookup value is supported by your logic directly, 
            // but typically we query by stateId or join. Let's use the lookup value relation filtering.
            totalDeleted = yield db_config_1.default.member.count({
                where: {
                    state: {
                        value: data_lookup_enum_1.CommonObjectState.DELETED
                    }
                }
            });
        }
        const stat = {
            totalChurches,
            weeklyChurches,
            totalMinistries,
            weeklyMinistries,
            totalCouncilFellowships,
            weeklyCouncilFellowships,
            churchesVisible: true,
            totalDeleted, // Add to response
        };
        return res.json({
            data: {
                status: "success",
                stat,
            },
        });
    }
    // Non-admin: scope by RBAC
    const allowedFellowshipIds = (_b = (_a = reqAny.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds) !== null && _b !== void 0 ? _b : [];
    const allowedCategoryIds = (_c = reqAny.rbac) === null || _c === void 0 ? void 0 : _c.allowedCategoryIds;
    const allowedTypeValues = (_d = reqAny.rbac) === null || _d === void 0 ? void 0 : _d.allowedTypeValues;
    // If no scoped fellowships, everything is zero
    if (!allowedFellowshipIds || allowedFellowshipIds.length === 0) {
        const stat = {
            totalChurches: 0,
            weeklyChurches: 0,
            totalMinistries: 0,
            weeklyMinistries: 0,
            totalCouncilFellowships: 0,
            weeklyCouncilFellowships: 0,
            churchesVisible: Array.isArray(allowedTypeValues) ? allowedTypeValues.includes(data_lookup_enum_1.MemberType.CHURCH) : true,
        };
        return res.json({ data: { status: "success", stat } });
    }
    const fellowshipIdFilter = { id: { in: allowedFellowshipIds } };
    const [totalCouncilFellowships, weeklyCouncilFellowships] = yield Promise.all([
        db_config_1.default.councilFellowship.count({ where: fellowshipIdFilter }),
        db_config_1.default.councilFellowship.count({
            where: Object.assign(Object.assign({}, fellowshipIdFilter), { createdAt: { gte: startOfWeek, lte: endOfWeek } }),
        }),
    ]);
    // Ministries within allowed fellowships and categories
    const baseMinistryWhere = {
        isActive: true,
        type: { value: data_lookup_enum_1.MemberType.MINISTRY },
        councilFellowshipId: { in: allowedFellowshipIds },
    };
    if (Array.isArray(allowedCategoryIds) && allowedCategoryIds.length > 0) {
        baseMinistryWhere.memberCategoryId = { in: allowedCategoryIds };
    }
    const [totalMinistries, weeklyMinistries] = yield Promise.all([
        db_config_1.default.member.count({ where: baseMinistryWhere }),
        db_config_1.default.member.count({
            where: Object.assign(Object.assign({}, baseMinistryWhere), { createdAt: { gte: startOfWeek, lte: endOfWeek } }),
        }),
    ]);
    // Churches within allowed fellowships (only when permitted by allowedTypeValues)
    const canSeeChurches = !Array.isArray(allowedTypeValues) || allowedTypeValues.includes(data_lookup_enum_1.MemberType.CHURCH);
    let totalChurches = 0;
    let weeklyChurches = 0;
    if (canSeeChurches) {
        const baseChurchWhere = {
            isActive: true,
            type: { value: data_lookup_enum_1.MemberType.CHURCH },
            councilFellowshipId: { in: allowedFellowshipIds },
        };
        [totalChurches, weeklyChurches] = yield Promise.all([
            db_config_1.default.member.count({ where: baseChurchWhere }),
            db_config_1.default.member.count({
                where: Object.assign(Object.assign({}, baseChurchWhere), { createdAt: { gte: startOfWeek, lte: endOfWeek } }),
            }),
        ]);
    }
    const stat = {
        totalChurches,
        weeklyChurches,
        totalMinistries,
        weeklyMinistries,
        totalCouncilFellowships,
        weeklyCouncilFellowships,
        churchesVisible: canSeeChurches,
    };
    res.json({
        data: {
            status: "success",
            stat,
        },
    });
}));
