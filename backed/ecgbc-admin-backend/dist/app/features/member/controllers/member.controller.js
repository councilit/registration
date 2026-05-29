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
exports.hardDeleteMember = exports.restoreDeletedToInactive = exports.getDeletedMembers = exports.permanentlyDeleteMember = exports.getDeletedCount = exports.checkCertificateNumber = exports.inactiveMember = exports.activeMember = exports.updateMember = exports.createMember = exports.getMember = exports.getMembers = exports.getInactiveMembers = exports.restoreMember = exports.softDeleteMember = exports.getInactiveCount = exports.getAllInactiveMembers = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const data_lookup_enum_1 = require("../../data-lookup/enums/data-lookup.enum");
// Helper to get allowed ministry fellowship IDs for current staff by email
function getAllowedMinistryIdsByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const staff = yield db_config_1.default.staff.findUnique({
            where: { email },
            select: { id: true },
        });
        if (!staff)
            return [];
        // Use junction table to read linked fellowships; cast prisma to any to bypass outdated types
        const links = yield db_config_1.default.staffFellowship.findMany({
            where: { staffId: staff.id },
            select: { fellowshipId: true },
        });
        return links.map((l) => l.fellowshipId);
    });
}
// Utility: read allowed fellowships from request or junction table
function getAllowedFellowshipIdsFromReq(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const reqAny = req;
        const pre = (_a = reqAny.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds;
        if (pre && pre.length > 0)
            return pre;
        const email = (_b = reqAny.staff) === null || _b === void 0 ? void 0 : _b.email;
        if (!email)
            return [];
        return getAllowedMinistryIdsByEmail(email);
    });
}
function assertAccessToMember(req, memberId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const reqAny = req;
        if (reqAny.isAdminRole)
            return; // full access
        // Fetch member to check fellowship scope and active flag
        const member = yield db_config_1.default.member.findUnique({
            where: { id: memberId },
            select: { councilFellowshipId: true, isActive: true },
        });
        if (!member)
            throw new app_error_1.default(`Member with ID ${memberId} does not exist`, 400);
        // All non-admins: must be within assigned council fellowships
        const allowedFellowshipIds = yield getAllowedFellowshipIdsFromReq(req);
        if (Array.isArray(allowedFellowshipIds) &&
            allowedFellowshipIds.length > 0 &&
            !allowedFellowshipIds.includes(member.councilFellowshipId)) {
            throw new app_error_1.default("Access denied: You do not have access to this council fellowship", 403);
        }
        // Active-only users cannot view/act on inactive members
        if (((_a = reqAny === null || reqAny === void 0 ? void 0 : reqAny.rbac) === null || _a === void 0 ? void 0 : _a.activeOnly) && member.isActive === false) {
            throw new app_error_1.default("Access denied: Inactive records are not visible", 403);
        }
    });
}
exports.getAllInactiveMembers = (0, error_config_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Admins see all; scoped users see none unless they have deactivate permission, which is handled by route guard
    const reqAny = req;
    const isAdmin = !!reqAny.isAdminRole;
    console.log(`getAllInactiveMembers: isAdmin=${isAdmin}, user email=${(_a = reqAny.staff) === null || _a === void 0 ? void 0 : _a.email}`);
    const [inactiveState, deletedState] = yield Promise.all([
        db_config_1.default.dataLookup.findFirst({ where: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE } }),
        db_config_1.default.dataLookup.findFirst({ where: { value: data_lookup_enum_1.CommonObjectState.DELETED } })
    ]);
    console.log(`getAllInactiveMembers: inactiveState=${inactiveState === null || inactiveState === void 0 ? void 0 : inactiveState.id}, deletedState=${deletedState === null || deletedState === void 0 ? void 0 : deletedState.id}`);
    let where = {
        AND: [
            {
                OR: [
                    { isActive: false },
                    { stateId: inactiveState === null || inactiveState === void 0 ? void 0 : inactiveState.id }
                ]
            },
            deletedState ? { stateId: { not: deletedState.id } } : {}
        ]
    };
    console.log(`getAllInactiveMembers: where clause:`, JSON.stringify(where, null, 2));
    if (!isAdmin) {
        const allowedFellowshipIds = (_c = (_b = reqAny.rbac) === null || _b === void 0 ? void 0 : _b.allowedFellowshipIds) !== null && _c !== void 0 ? _c : [];
        where = Object.assign(Object.assign({}, where), (allowedFellowshipIds.length > 0 ? { councilFellowshipId: { in: allowedFellowshipIds } } : { id: { in: [] } }));
    }
    const members = yield db_config_1.default.member.findMany({
        where,
        include: {
            type: true,
            boardMembers: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
        }
    });
    console.log(`getAllInactiveMembers: found ${members.length} inactive members`);
    console.log(`getAllInactiveMembers: first few members:`, members.slice(0, 3).map(m => ({ id: m.id, name: m.name, isActive: m.isActive, stateId: m.stateId })));
    // Also check total count of inactive members
    const totalInactive = yield db_config_1.default.member.count({ where: { isActive: false } });
    console.log(`getAllInactiveMembers: total inactive members in DB: ${totalInactive}`);
    const responseData = {
        status: "success",
        data: { members },
    };
    console.log(`getAllInactiveMembers: sending response with ${members.length} members`);
    res.status(200).json(responseData);
}));
exports.getInactiveCount = (0, error_config_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const reqAny = req;
    const isAdmin = !!reqAny.isAdminRole;
    const [inactiveState, deletedState] = yield Promise.all([
        db_config_1.default.dataLookup.findFirst({ where: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE } }),
        db_config_1.default.dataLookup.findFirst({ where: { value: data_lookup_enum_1.CommonObjectState.DELETED } })
    ]);
    let where = {
        AND: [
            {
                OR: [
                    { isActive: false },
                    { stateId: inactiveState === null || inactiveState === void 0 ? void 0 : inactiveState.id }
                ]
            },
            deletedState ? { stateId: { not: deletedState.id } } : {}
        ]
    };
    if (!isAdmin) {
        const allowedFellowshipIds = (_b = (_a = reqAny.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds) !== null && _b !== void 0 ? _b : [];
        where = {
            AND: [
                where,
                ...(allowedFellowshipIds.length > 0 ? [{ councilFellowshipId: { in: allowedFellowshipIds } }] : [{ id: { in: [] } }]),
            ]
        };
    }
    const count = yield db_config_1.default.member.count({ where });
    console.log(`getInactiveCount: ${count} (Admin: ${isAdmin})`);
    res.status(200).json({
        status: "success",
        data: { count },
    });
}));
// Soft delete a member (mark as inactive)
exports.softDeleteMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertAccessToMember(req, req.params.id);
    const { id } = req.params;
    const inactiveState = yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE },
    });
    const member = yield db_config_1.default.member.update({
        where: { id },
        data: {
            isActive: false,
            stateId: inactiveState.id,
            reasonForInactive: req.body.reason || "Marked inactive by admin",
        },
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
            councilFellowship: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Restore a member (mark as active)
exports.restoreMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertAccessToMember(req, req.params.id);
    const { id } = req.params;
    const activeState = yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE },
    });
    const member = yield db_config_1.default.member.update({
        where: { id },
        data: {
            isActive: true,
            stateId: activeState.id,
            reasonForInactive: null,
        },
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
            councilFellowship: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Get inactive members (paginated)
exports.getInactiveMembers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { page = 1, limit = 10 } = req.query;
    const reqAny = req;
    const isAdmin = !!reqAny.isAdminRole;
    let where = {
        AND: [
            {
                OR: [
                    { isActive: false },
                    { state: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE } }
                ]
            },
            {
                state: {
                    value: { not: data_lookup_enum_1.CommonObjectState.DELETED }
                }
            }
        ]
    };
    if (!isAdmin) {
        const allowedFellowshipIds = (_b = (_a = reqAny.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds) !== null && _b !== void 0 ? _b : [];
        where = {
            AND: [
                where,
                ...(allowedFellowshipIds.length > 0 ? [{ councilFellowshipId: { in: allowedFellowshipIds } }] : [{ id: { in: [] } }]),
            ]
        };
    }
    const members = yield db_config_1.default.member.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
            type: true,
            boardMembers: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
        }
    });
    const total = yield db_config_1.default.member.count({
        where,
    });
    res.status(200).json({
        status: "success",
        data: {
            members,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        },
    });
}));
// Main getMembers
exports.getMembers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 5;
    const skip = (page - 1) * limit;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    if (!userEmail) {
        return next(new app_error_1.default("User email not found in request", 401));
    }
    // Prefer RBAC precomputed fellowship scope if present
    const reqAny = req;
    const allowedFellowshipIds = ((_c = (_b = reqAny.rbac) === null || _b === void 0 ? void 0 : _b.allowedFellowshipIds) === null || _c === void 0 ? void 0 : _c.length)
        ? reqAny.rbac.allowedFellowshipIds
        : []; // await getAllowedMinistryIdsByEmail(userEmail);
    const filters = Object.assign({}, req.filters);
    const [members, total] = yield Promise.all([
        db_config_1.default.member.findMany({
            where: filters,
            include: {
                boardMembers: true,
                type: true,
                previousType: true,
                state: true,
                region: true,
                reports: {
                    include: {
                        status: true
                    }
                },
                councilFellowship: true,
            },
            take: limit,
            skip,
        }),
        db_config_1.default.member.count({
            where: filters,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            members,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
// Get single member
exports.getMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertAccessToMember(req, req.params.id);
    const member = yield db_config_1.default.member.findUnique({
        where: { id: req.params.id },
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
            councilFellowship: true,
        },
    });
    if (!member) {
        return next(new app_error_1.default(`Member with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Create member
exports.createMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const reqAny = req;
    let { name, country, regionId, city, subcity, zone, district, houseNumber, poBoxNumber, email, phoneNumber, certificateNo, certificateIssuedDate, isInEthiopia, councilFellowshipId, typeId, stateId, boardMembers, memberFiles, memberCategoryId, } = req.body;
    // Non-admins can only create inside their assigned fellowships
    if (!reqAny.isAdminRole) {
        const allowedFellowshipIds = yield getAllowedFellowshipIdsFromReq(req);
        if (Array.isArray(allowedFellowshipIds) &&
            allowedFellowshipIds.length > 0 &&
            (!councilFellowshipId || !allowedFellowshipIds.includes(councilFellowshipId))) {
            return next(new app_error_1.default("Access denied: You cannot create outside your council fellowships", 403));
        }
    }
    boardMembers = JSON.parse(boardMembers);
    if (!stateId) {
        const state = (yield db_config_1.default.dataLookup.findFirst({
            where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE },
        }));
        stateId = state.id;
    }
    const member = yield db_config_1.default.member.create({
        data: Object.assign(Object.assign(Object.assign(Object.assign({ name,
            councilFellowshipId,
            certificateNo, certificateIssuedDate: new Date(certificateIssuedDate), isInEthiopia: isInEthiopia == 'true', country }, (regionId && { regionId })), { city, subcity: subcity || "", zone: zone || "", district: district || "", houseNumber: houseNumber || "", poBoxNumber: poBoxNumber || "", email: email || "", phoneNumber: phoneNumber || "", typeId,
            stateId }), (memberCategoryId ? { memberCategoryId } : {})), { boardMembers: {
                create: boardMembers,
            } }),
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
        },
    });
    for (const file of memberFiles) {
        yield db_config_1.default.file.create({
            data: {
                memberId: member.id,
                fileName: file.fileName,
                file: (file === null || file === void 0 ? void 0 : file.file) || "",
            },
            include: { member: true, councilFellowship: true },
        });
    }
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Update member
exports.updateMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertAccessToMember(req, req.params.id);
    const { name, certificateNo, certificateIssuedDate, isInEthiopia, councilFellowshipId, memberCategoryId, regionId, stateId, phoneNumber, email, typeId, boardMembers, city, subcity, zone, district, houseNumber, poBoxNumber, } = req.body;
    const memberId = req.params.id;
    let currentMember = yield db_config_1.default.member.findUnique({
        where: { id: memberId },
        include: {},
    });
    if (!currentMember) {
        return next(new app_error_1.default(`Member with ID ${memberId} does not exist`, 400));
    }
    // RBAC: prevent moving to out-of-scope fellowship for non-admins
    const reqAny = req;
    if (!reqAny.isAdminRole && councilFellowshipId) {
        const allowedFellowshipIds = yield getAllowedFellowshipIdsFromReq(req);
        if (Array.isArray(allowedFellowshipIds) &&
            allowedFellowshipIds.length > 0 &&
            !allowedFellowshipIds.includes(councilFellowshipId)) {
            return next(new app_error_1.default("Access denied: You cannot move member to an out-of-scope fellowship", 403));
        }
    }
    let updatedData = { isInEthiopia: Boolean(isInEthiopia) };
    if (typeId && typeId !== currentMember.typeId) {
        updatedData.previousTypeId = currentMember.typeId;
        updatedData.typeChangedAt = new Date();
        updatedData.typeId = typeId;
    }
    else if (typeId) {
        updatedData.typeId = typeId;
    }
    if (regionId)
        updatedData.regionId = regionId;
    if (stateId)
        updatedData.stateId = stateId;
    if (name)
        updatedData.name = name;
    updatedData.email = email;
    updatedData.phoneNumber = phoneNumber;
    updatedData.city = city;
    updatedData.subcity = subcity;
    updatedData.zone = zone;
    updatedData.district = district;
    updatedData.houseNumber = houseNumber;
    updatedData.poBoxNumber = poBoxNumber;
    if (certificateNo)
        updatedData.certificateNo = certificateNo;
    if (certificateIssuedDate)
        updatedData.certificateIssuedDate = new Date(certificateIssuedDate);
    if (councilFellowshipId)
        updatedData.councilFellowshipId = councilFellowshipId;
    if (memberCategoryId)
        updatedData.memberCategoryId = memberCategoryId;
    if (boardMembers) {
        // 1. Get existing board member IDs for the member
        const existingIds = yield db_config_1.default.boardMember.findMany({
            where: { memberId: req.params.id },
            select: { id: true },
        });
        const incomingIds = boardMembers.map((bm) => bm.id);
        // 2. Identify and delete board members not present in the new list
        const toDelete = existingIds
            .filter((existing) => !incomingIds.includes(existing.id))
            .map((e) => e.id);
        if (toDelete.length > 0) {
            yield db_config_1.default.boardMember.deleteMany({
                where: { id: { in: toDelete } },
            });
        }
        // 3. Upsert (update or create) the remaining ones
        console.log('boardMembers update debug', {
            incomingCount: boardMembers.length,
            existingCount: existingIds.length,
            toDeleteCount: toDelete.length,
            toDeleteIds: toDelete
        });
        yield Promise.all(boardMembers.map((boardMember) => __awaiter(void 0, void 0, void 0, function* () {
            yield db_config_1.default.boardMember.upsert({
                where: { id: boardMember.id },
                update: {
                    fullName: boardMember.fullName,
                    phoneNumber: boardMember.phoneNumber,
                },
                create: {
                    councilFellowshipId: currentMember.councilFellowshipId,
                    memberId: currentMember === null || currentMember === void 0 ? void 0 : currentMember.id,
                    fullName: boardMember.fullName,
                    phoneNumber: boardMember.phoneNumber,
                },
            });
        })));
    }
    const member = yield db_config_1.default.member.update({
        where: { id: req.params.id },
        data: Object.assign({}, updatedData),
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Activate member
exports.activeMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertAccessToMember(req, req.params.id);
    let member = yield db_config_1.default.member.findUnique({
        where: { id: req.params.id },
        include: {},
    });
    if (!member) {
        return next(new app_error_1.default(`Member with ID ${req.params.id} does not exist`, 400));
    }
    const activeState = (yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE },
    }));
    member = yield db_config_1.default.member.update({
        where: { id: req.params.id },
        data: {
            stateId: activeState.id,
            isActive: true,
            reasonForInactive: null,
        },
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Inactivate member
exports.inactiveMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertAccessToMember(req, req.params.id);
    const { reason } = req.body;
    let member = yield db_config_1.default.member.findUnique({
        where: { id: req.params.id },
        include: {},
    });
    if (!member) {
        return next(new app_error_1.default(`Member with ID ${req.params.id} does not exist`, 400));
    }
    const inactiveState = (yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE },
    }));
    member = yield db_config_1.default.member.update({
        where: { id: req.params.id },
        data: {
            stateId: inactiveState.id,
            isActive: false,
            reasonForInactive: reason,
        },
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
exports.checkCertificateNumber = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { certificateNo } = req.params;
    if (!certificateNo) {
        return next(new app_error_1.default("Certificate number is required", 400));
    }
    const existingMember = yield db_config_1.default.member.findUnique({
        where: { certificateNo },
        select: { id: true, name: true },
    });
    res.status(200).json({
        status: "success",
        data: {
            exists: !!existingMember,
            member: existingMember ? { id: existingMember.id, name: existingMember.name } : null,
        },
    });
}));
exports.getDeletedCount = (0, error_config_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqAny = req;
    // Ensure only super admin can access this count if needed, or stick to RBAC
    if (!reqAny.isAdminRole) {
        // If you want to restrict it completely to SuperAdmin:
        // return next(new AppError("Access denied", 403));
        // If you want to allow it but return 0 or scoped count:
    }
    // Assuming "DELETED" state is tracked. 
    // NOTE: You need to make sure 'object_state_deleted' exists in your DataLookup
    const deletedState = yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.DELETED },
    });
    if (!deletedState) {
        return res.status(200).json({ status: "success", data: { count: 0 } });
    }
    let where = {
        stateId: deletedState.id
    };
    const count = yield db_config_1.default.member.count({ where });
    res.status(200).json({
        status: "success",
        data: { count },
    });
}));
exports.permanentlyDeleteMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Use assertAccessToMember or custom logic. 
    // Typically "permanent delete" (trash) might be restricted to Admins or specific permissions
    // await assertAccessToMember(req, req.params.id); 
    const { id } = req.params;
    const deletedState = yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.DELETED },
    });
    if (!deletedState) {
        return next(new app_error_1.default("Deleted state not configured in system", 500));
    }
    console.log('Permanently deleting member:', id);
    console.log('Target Deleted State:', deletedState.id, deletedState.value);
    const currentMember = yield db_config_1.default.member.findUnique({
        where: { id },
        select: { reasonForInactive: true },
    });
    const reasonForInactive = req.body.reason || (currentMember === null || currentMember === void 0 ? void 0 : currentMember.reasonForInactive) || "Moved to trash";
    const member = yield db_config_1.default.member.update({
        where: { id },
        data: {
            isActive: false,
            stateId: deletedState.id,
            reasonForInactive,
        },
        include: {
            boardMembers: true,
            type: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
            councilFellowship: true,
        },
    });
    console.log('Member updated:', member.id, member.stateId);
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Get Deleted members (paginated)
exports.getDeletedMembers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = req.query;
    const deletedState = yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.DELETED },
    });
    if (!deletedState) {
        return res.status(200).json({
            status: "success",
            data: { members: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        });
    }
    let where = {
        stateId: deletedState.id
    };
    const members = yield db_config_1.default.member.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
            type: true,
            boardMembers: true,
            previousType: true,
            state: true,
            region: true,
            reports: true,
        }
    });
    const total = yield db_config_1.default.member.count({
        where,
    });
    res.status(200).json({
        status: "success",
        data: {
            members,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        },
    });
}));
exports.restoreDeletedToInactive = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertAccessToMember(req, req.params.id);
    const { id } = req.params;
    const inactiveState = yield db_config_1.default.dataLookup.findFirst({
        where: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE },
    });
    if (!inactiveState) {
        return next(new app_error_1.default("Inactive state configuration missing", 500));
    }
    const member = yield db_config_1.default.member.update({
        where: { id },
        data: {
            isActive: false, // Remains false as it is inactive
            stateId: inactiveState.id,
            reasonForInactive: "Restored from Deleted Records",
        },
        include: {
            type: true,
            state: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: { member },
    });
}));
// Hard delete member (permanently remove from database)
exports.hardDeleteMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Check if member exists
    const member = yield db_config_1.default.member.findUnique({ where: { id } });
    if (!member) {
        return next(new app_error_1.default("Member not found", 404));
    }
    // Delete related records manually because Cascade is not enabled in schema
    yield db_config_1.default.boardMember.deleteMany({ where: { memberId: id } });
    yield db_config_1.default.report.deleteMany({ where: { memberId: id } });
    yield db_config_1.default.file.deleteMany({ where: { memberId: id } });
    // Delete the member
    yield db_config_1.default.member.delete({
        where: { id },
    });
    res.status(204).json({
        status: "success",
        data: null,
    });
}));
