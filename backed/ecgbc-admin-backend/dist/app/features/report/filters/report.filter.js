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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = void 0;
const error_config_1 = require("../../../config/error.config");
exports.getReports = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    // Build structured Prisma where using AND/OR to support RBAC + query params
    const andClauses = [];
    // Query param filters
    if (query.memberId) {
        andClauses.push({ memberId: query.memberId });
    }
    if (query.fellowshipId) {
        andClauses.push({ councilFellowshipId: query.fellowshipId });
    }
    // RBAC scoping: if middleware populated rbac scope, restrict queries accordingly
    const isAdmin = Boolean(req.isAdminRole);
    const rbac = req.rbac;
    if (!isAdmin && rbac) {
        const { allowedFellowshipIds = [], allowedCategoryIds = [] } = rbac;
        if (allowedFellowshipIds.length > 0) {
            // Accept reports linked either directly to allowed fellowships OR via their member's fellowship
            andClauses.push({
                OR: [
                    { councilFellowshipId: { in: allowedFellowshipIds } },
                    { member: { councilFellowshipId: { in: allowedFellowshipIds } } },
                ],
            });
        }
        if (allowedCategoryIds.length > 0) {
            // Apply category scope only for member reports
            andClauses.push({ member: { memberCategoryId: { in: allowedCategoryIds } } });
        }
    }
    const filters = andClauses.length > 0 ? { AND: andClauses } : {};
    // Attach to request for controller usage
    req.filters = filters;
    next();
}));
