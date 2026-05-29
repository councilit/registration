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
exports.updateFellowship = exports.createFellowship = exports.getFellowship = exports.getFellowships = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
// Helper to get allowed fellowship IDs for the current staff
function getAllowedFellowshipIds(email) {
    return __awaiter(this, void 0, void 0, function* () {
        // Cast prisma to any to bypass mismatched generated types and fetch via junction relation
        const staff = yield db_config_1.default.staff.findUnique({
            where: { email },
            include: { fellowships: { select: { fellowshipId: true } } },
        });
        if (!staff || !staff.fellowships)
            return [];
        return staff.fellowships.map((f) => f.fellowshipId);
    });
}
exports.getFellowships = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 5;
    const skip = (page - 1) * limit;
    const isAdmin = Boolean(req.isAdminRole);
    // Prefer precomputed scope from middleware if present
    const scopeIds = (_a = req.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds;
    const allowedFellowshipIds = scopeIds !== null && scopeIds !== void 0 ? scopeIds : (((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) ? yield getAllowedFellowshipIds(req.user.email) : []);
    // Admins see all; non-admins must be scoped (empty scope => no results)
    const whereClause = isAdmin
        ? {}
        : (allowedFellowshipIds && allowedFellowshipIds.length > 0
            ? { id: { in: allowedFellowshipIds } }
            : { id: { in: [] } });
    const [fellowships, total] = yield Promise.all([
        db_config_1.default.councilFellowship.findMany({
            where: whereClause,
            include: { boardMembers: true, files: true, region: true }, // Include region details
            take: limit,
            skip,
        }),
        db_config_1.default.councilFellowship.count({ where: whereClause }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            fellowships,
            meta: { page, limit, total },
        },
    });
}));
exports.getFellowship = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const isAdmin = Boolean(req.isAdminRole);
    const scopeIds = (_a = req.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds;
    const allowedFellowshipIds = scopeIds !== null && scopeIds !== void 0 ? scopeIds : (((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) ? yield getAllowedFellowshipIds(req.user.email) : []);
    if (!isAdmin) {
        // Must have access to the requested id
        if (!allowedFellowshipIds.length || !allowedFellowshipIds.includes(req.params.id)) {
            return next(new app_error_1.default(`Fellowship with ID ${req.params.id} does not exist or you do not have access`, 403));
        }
    }
    const fellowship = yield db_config_1.default.councilFellowship.findUnique({
        where: { id: req.params.id },
        include: { boardMembers: true, files: true, region: true }, // Include region details
    });
    if (!fellowship) {
        return next(new app_error_1.default(`Fellowship with ID ${req.params.id} does not exist or you do not have access`, 403));
    }
    res.status(200).json({
        status: "success",
        data: { fellowship },
    });
}));
exports.createFellowship = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Only admins can create fellowships to avoid out-of-scope creations for scoped users
    if (!req.isAdminRole) {
        return next(new app_error_1.default("Access denied: Only admins can create fellowships", 403));
    }
    let { name, country, regionId, // <-- use regionId instead of region
    city, subcity, zone, district, houseNumber, poBoxNumber, email, phoneNumber, certificateNo, certificateIssuedDate, isInEthiopia, boardMembers, } = req.body;
    const fellowship = yield db_config_1.default.councilFellowship.create({
        data: {
            name,
            certificateNo,
            certificateIssuedDate: new Date(certificateIssuedDate),
            isInEthiopia,
            country,
            regionId, // <-- use regionId
            city,
            subcity: subcity || "",
            zone: zone || "",
            district: district || "",
            houseNumber: houseNumber || "",
            poBoxNumber: poBoxNumber || "",
            email: email || "",
            phoneNumber: phoneNumber || "",
            boardMembers: {
                create: boardMembers,
            },
        },
        include: { boardMembers: true },
    });
    res.status(200).json({
        status: "success",
        data: { fellowship },
    });
}));
exports.updateFellowship = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let { name, email, phoneNumber, certificateNo, certificateIssuedDate, isInEthiopia, boardMembers, regionId, region, // Support 'region' alias for regionId
    country, city, subcity, zone, district, houseNumber, poBoxNumber, } = req.body;
    // Prefer precomputed RBAC scope; fallback to StaffFellowship junction
    const precomputed = (_a = req.rbac) === null || _a === void 0 ? void 0 : _a.allowedFellowshipIds;
    const allowedFellowshipIds = precomputed !== null && precomputed !== void 0 ? precomputed : (((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) ? yield getAllowedFellowshipIds(req.user.email) : []);
    const isAdmin = Boolean(req.isAdminRole);
    if (!isAdmin) {
        // Must have access to the requested id
        if (!allowedFellowshipIds.length || !allowedFellowshipIds.includes(req.params.id)) {
            return next(new app_error_1.default(`Fellowship with ID ${req.params.id} does not exist or you do not have access`, 403));
        }
    }
    let updatedData = { isInEthiopia: Boolean(isInEthiopia) };
    if (name)
        updatedData.name = name;
    if (email)
        updatedData.email = email;
    if (phoneNumber)
        updatedData.phoneNumber = phoneNumber;
    if (certificateNo)
        updatedData.certificateNo = certificateNo;
    if (certificateIssuedDate)
        updatedData.certificateIssuedDate = new Date(certificateIssuedDate);
    // Handle regionId from either regionId or region field
    if (regionId)
        updatedData.regionId = regionId;
    else if (region)
        updatedData.regionId = region;
    if (country)
        updatedData.country = country;
    if (city)
        updatedData.city = city;
    if (subcity)
        updatedData.subcity = subcity;
    if (zone)
        updatedData.zone = zone;
    if (district)
        updatedData.district = district;
    if (houseNumber)
        updatedData.houseNumber = houseNumber;
    if (poBoxNumber)
        updatedData.poBoxNumber = poBoxNumber;
    if (boardMembers) {
        // 1. Get existing board member IDs for the fellowship
        const existingIds = yield db_config_1.default.boardMember.findMany({
            where: { councilFellowshipId: req.params.id },
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
        // 3. Upsert (update or create) the others
        yield Promise.all(boardMembers.map((boardMember) => __awaiter(void 0, void 0, void 0, function* () {
            yield db_config_1.default.boardMember.upsert({
                where: { id: boardMember.id },
                update: {
                    fullName: boardMember.fullName,
                    phoneNumber: boardMember.phoneNumber,
                },
                create: {
                    councilFellowshipId: req.params.id,
                    fullName: boardMember.fullName,
                    phoneNumber: boardMember.phoneNumber,
                },
            });
        })));
    }
    const fellowship = yield db_config_1.default.councilFellowship.update({
        where: { id: req.params.id },
        data: Object.assign({}, updatedData),
        include: { boardMembers: true },
    });
    // Process new files if any
    const files = req.files;
    if (files && files.length > 0) {
        yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            yield db_config_1.default.file.create({
                data: {
                    fileName: file.originalname,
                    file: `files/file/${file.filename}`,
                    councilFellowshipId: fellowship.id,
                },
            });
        })));
        // Re-fetch to include new files
        const reFetched = yield db_config_1.default.councilFellowship.findUnique({
            where: { id: fellowship.id },
            include: { boardMembers: true, files: true }
        });
        return res.status(200).json({ status: "success", data: { fellowship: reFetched } });
    }
    res.status(200).json({
        status: "success",
        data: { fellowship },
    });
}));
