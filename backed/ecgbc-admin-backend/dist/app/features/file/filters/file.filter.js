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
exports.getFiles = void 0;
const error_config_1 = require("../../../config/error.config");
exports.getFiles = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    let filters = {};
    for (const key in query) {
        if (["memberId", "fellowshipId"].includes(key)) {
            const value = query[key];
            const filterKey = key === 'fellowshipId' ? 'councilFellowshipId' : key;
            filters = Object.assign(Object.assign({}, filters), { [filterKey]: value });
        }
    }
    // If memberId is present, also include files for the member's councilFellowshipId
    if (query.memberId) {
        // Fetch the member's councilFellowshipId from the DB
        const prisma = require("../../../config/db.config").default;
        const member = yield prisma.member.findUnique({
            where: { id: query.memberId },
            select: { councilFellowshipId: true },
        });
        if (member && member.councilFellowshipId) {
            // Only use OR for memberId and councilFellowshipId, do not merge with other filters
            filters = {
                OR: [
                    { memberId: query.memberId },
                    { councilFellowshipId: member.councilFellowshipId },
                ]
            };
        }
    }
    if (query.isFromSelamMinster) {
        console.log("query.isFromSelamMinster", query.isFromSelamMinster);
        filters = Object.assign(Object.assign({}, filters), { isFromSelamMinster: query.isFromSelamMinster === 'true' ? true : false });
    }
    // RBAC scoping
    const isAdmin = Boolean(req.isAdminRole);
    const rbac = req.rbac;
    console.log('isAdmin:', isAdmin);
    console.log('rbac:', rbac);
    if (!isAdmin && rbac) {
        const fellowshipScope = rbac.allowedFellowshipIds && rbac.allowedFellowshipIds.length > 0 && !query.memberId
            ? { councilFellowshipId: { in: rbac.allowedFellowshipIds } }
            : {};
        // For member files, constrain by member category via nested relation
        const categoryScope = rbac.allowedCategoryIds && rbac.allowedCategoryIds.length > 0
            ? { member: { memberCategoryId: { in: rbac.allowedCategoryIds } } }
            : {};
        // For member files, also constrain by member's fellowship
        const fellowshipMemberScope = rbac.allowedFellowshipIds && rbac.allowedFellowshipIds.length > 0
            ? { member: { councilFellowshipId: { in: rbac.allowedFellowshipIds } } }
            : {};
        filters = Object.assign(Object.assign(Object.assign(Object.assign({}, filters), fellowshipScope), categoryScope), fellowshipMemberScope);
    }
    req.filters = filters;
    console.log('File filters:', filters);
    next();
}));
