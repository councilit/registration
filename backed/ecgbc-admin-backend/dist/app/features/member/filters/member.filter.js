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
exports.getMembers = void 0;
const error_config_1 = require("../../../config/error.config");
exports.getMembers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = req.query;
    let filters = { isActive: true };
    for (const key in query) {
        if (["stateId", "typeId", "regionId"].includes(key)) {
            //@ts-ignore
            const value = query[key];
            filters = Object.assign(Object.assign({}, filters), { [key]: value });
        }
    }
    if (query.isInEthiopia) {
        const isInEthiopia = query.isInEthiopia === "yes";
        filters = Object.assign(Object.assign({}, filters), { isInEthiopia });
    }
    if (query._search) {
        filters = Object.assign(Object.assign({}, filters), { OR: [
                { name: { contains: query._search } },
                { certificateNo: { contains: query._search } },
                { city: { contains: query._search } },
            ] });
    }
    if (query.memberTypeChanged && query.memberTypeChanged !== "all") {
        filters = Object.assign(Object.assign({}, filters), { typeChangedAt: query.memberTypeChanged === "changed" ? { not: null } : null });
    }
    // RBAC scoping for active-only users and fellowship restrictions
    const isAdmin = Boolean(req.isAdminRole);
    const rbac = req.rbac;
    // Apply fellowship filtering
    if (query.councilFellowshipId && query.councilFellowshipId !== "all") {
        if (!isAdmin) {
            const allowed = (rbac === null || rbac === void 0 ? void 0 : rbac.allowedFellowshipIds) || [];
            if (!allowed.includes(query.councilFellowshipId)) {
                filters = Object.assign(Object.assign({}, filters), { id: { in: [] } });
            }
            else {
                filters = Object.assign(Object.assign({}, filters), { councilFellowshipId: query.councilFellowshipId });
            }
        }
        else {
            filters = Object.assign(Object.assign({}, filters), { councilFellowshipId: query.councilFellowshipId });
        }
    }
    else {
        // No specific fellowship requested (or "all")
        if (!isAdmin) {
            const allowed = (rbac === null || rbac === void 0 ? void 0 : rbac.allowedFellowshipIds) || [];
            if (allowed && allowed.length > 0) {
                filters = Object.assign(Object.assign({}, filters), { councilFellowshipId: { in: allowed } });
            }
        }
    }
    if (!isAdmin && rbac) {
        // Apply active-only filter if needed
        if (rbac.activeOnly) {
            filters = Object.assign(Object.assign({}, filters), { isActive: true });
        }
    }
    if (query.filterByReport && query.reportYear) {
        let reportFilter = {
            year: Number(query.reportYear),
            statusId: query.reportStatus,
        };
        if (!isAdmin && rbac && ((_a = rbac.allowedFellowshipIds) === null || _a === void 0 ? void 0 : _a.length)) {
            reportFilter = {
                AND: [
                    reportFilter,
                    {
                        OR: [
                            { councilFellowshipId: { in: rbac.allowedFellowshipIds } },
                            { member: { councilFellowshipId: { in: rbac.allowedFellowshipIds } } },
                        ],
                    },
                ],
            };
        }
        filters = Object.assign(Object.assign({}, filters), { reports: {
                some: reportFilter,
            } });
    }
    req.filters = filters;
    next();
}));
