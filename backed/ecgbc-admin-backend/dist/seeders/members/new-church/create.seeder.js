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
exports.seedMembers = void 0;
const path_1 = __importDefault(require("path"));
const node_1 = __importDefault(require("read-excel-file/node"));
const db_config_1 = __importDefault(require("../../../app/config/db.config"));
const data_lookup_enum_1 = require("../../../app/features/data-lookup/enums/data-lookup.enum");
const report_status_enum_1 = require("../../../app/features/report/enums/report-status.enum");
const region_validator_1 = require("../validators/region-validator");
const console_1 = require("console");
const member_region_helper_1 = require("../helpers/member-region.helper");
const ethiopian_date_helper_1 = require("../helpers/ethiopian-date.helper");
const member_report_helper_1 = require("../helpers/member-report.helper");
const ethiopian_number_helper_1 = require("../helpers/ethiopian-number.helper");
const crypto_1 = require("crypto");
const member_type_helper_1 = require("../helpers/member-type.helper");
const seedMembers = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('starting seedMembers for new church');
    const data = (yield (0, node_1.default)(path_1.default.join(__dirname, "new_church.xlsx")));
    (0, console_1.log)(`totalRows : `, data.length);
    // Preload existing certificateNos to avoid collisions when generating
    const existingCertRows = yield db_config_1.default.member.findMany({ select: { certificateNo: true } });
    const existingCerts = new Set(existingCertRows.map(r => r.certificateNo));
    const sessionCerts = new Set();
    const genUniqueCert = (seedNo) => {
        let base = 900000 + (Number.isFinite(seedNo) ? seedNo : 0);
        let candidate = base.toString();
        let bump = 0;
        while (existingCerts.has(candidate) || sessionCerts.has(candidate)) {
            bump += 1;
            candidate = (base + bump).toString();
        }
        sessionCerts.add(candidate);
        return candidate;
    };
    const reportedStatus = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: report_status_enum_1.ReportStatus.REPORTED },
    }));
    const notReportedStatus = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: report_status_enum_1.ReportStatus.NOT_REPORTED },
    }));
    let members = [];
    let lastRow = 0;
    let firstTime = true;
    for (const row of data.slice(3)) {
        if (firstTime) {
            console.log(`first row`);
            console.log(row);
        }
        firstTime = false;
        validateRow(row);
        try {
            if (row[0] !== null) {
                lastRow = row[0];
                const region = yield (0, member_region_helper_1.getMemberRegion)(row[3]);
                // Determine type from the provided column; if missing or unrecognized, infer from the name
                let type;
                try {
                    type = yield (0, member_type_helper_1.getMemberType)(row[2]);
                }
                catch (_a) {
                    type = yield (0, member_type_helper_1.getMemberType)(row[1]);
                }
                members.push({
                    no: row[0],
                    name: row[1],
                    type,
                    region,
                    city: row[4],
                    certificateIssuedDate: row[7] === null ? new Date() : (0, ethiopian_date_helper_1.ethToGreg)(row[7], row[0]),
                    certificateNo: row[8] === null ? genUniqueCert(row[0]) : row[8].toString(),
                    boardMembers: [],
                    reports: [],
                });
                if (row[1] !== null) {
                    const reportStatus2014 = yield (0, member_report_helper_1.getReportStatus)(row[9]);
                    const reportStatus2015 = yield (0, member_report_helper_1.getReportStatus)(row[10]);
                    const reportStatus2016 = yield (0, member_report_helper_1.getReportStatus)(row[11]);
                    const reports = [
                        {
                            year: 2014,
                            statusId: reportStatus2014.id,
                            crv: row[12] ? row[12].toString() : "",
                            remark: row[15] ? row[15].toString() : "",
                        },
                        {
                            year: 2015,
                            statusId: reportStatus2015.id,
                            crv: row[13] ? row[13].toString() : "",
                            remark: row[16] ? row[16].toString() : "",
                        },
                        {
                            year: 2016,
                            statusId: reportStatus2016.id,
                            crv: row[14] ? row[14].toString() : "",
                            remark: row[17] ? row[17].toString() : "",
                        },
                    ];
                    members = members.map((member) => {
                        if (member.no === lastRow && row[5] !== null) {
                            return Object.assign(Object.assign({}, member), { boardMembers: [
                                    ...member.boardMembers,
                                    {
                                        fullName: row[5],
                                        phoneNumber: row[6]
                                            ? (0, ethiopian_number_helper_1.formattedEthiopianPhoneNumber)(row[6].toString())
                                            : "",
                                    },
                                ], reports });
                        }
                        return member;
                    });
                }
            }
            else {
                members = members.map((member) => {
                    if (member.no === lastRow && row[5] !== null) {
                        return Object.assign(Object.assign({}, member), { boardMembers: [
                                ...member.boardMembers,
                                {
                                    fullName: row[5],
                                    phoneNumber: row[6]
                                        ? (0, ethiopian_number_helper_1.formattedEthiopianPhoneNumber)(row[6].toString())
                                        : "",
                                },
                            ] });
                    }
                    return member;
                });
            }
        }
        catch (error) {
            console.log("error in this row", row);
            console.log(error);
        }
    }
    const state = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE },
    }));
    const targetFellowshipName = "አዲስ ቤተ-እመነት";
    let fellowhip = yield db_config_1.default.councilFellowship.findUnique({ where: { name: targetFellowshipName } });
    if (!fellowhip) {
        fellowhip = yield db_config_1.default.councilFellowship.create({
            data: {
                name: targetFellowshipName,
                certificateNo: (0, crypto_1.randomInt)(1000, 9999).toString(),
                certificateIssuedDate: new Date(),
                isInEthiopia: true,
            },
        });
        console.log(`Created council fellowship`, fellowhip === null || fellowhip === void 0 ? void 0 : fellowhip.name, fellowhip === null || fellowhip === void 0 ? void 0 : fellowhip.certificateNo);
    }
    else {
        console.log(`Using existing council fellowship`, fellowhip === null || fellowhip === void 0 ? void 0 : fellowhip.name, fellowhip === null || fellowhip === void 0 ? void 0 : fellowhip.certificateNo);
    }
    console.log(`council fellowhsip `, fellowhip === null || fellowhip === void 0 ? void 0 : fellowhip.name);
    yield Promise.all(members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            yield db_config_1.default.member.create({
                data: {
                    name: member.name,
                    certificateNo: member.certificateNo,
                    certificateIssuedDate: member.certificateIssuedDate,
                    country: "Ethiopia",
                    regionId: member.region.id,
                    city: member.city,
                    councilFellowshipId: fellowhip.id,
                    stateId: state.id,
                    typeId: member.type.id,
                    boardMembers: {
                        create: member.boardMembers.map((bm) => (Object.assign({}, bm))),
                    },
                    reports: {
                        create: member.reports.map((r) => (Object.assign({}, r))),
                    },
                    isInEthiopia: true,
                },
            });
        }
        catch (error) {
            const metaTarget = ((_a = error === null || error === void 0 ? void 0 : error.meta) === null || _a === void 0 ? void 0 : _a.target) || '';
            let newName = member.name;
            let newCert = member.certificateNo;
            let changed = false;
            if (metaTarget.includes('Member_certificateNo_key')) {
                newCert = genUniqueCert(member.no);
                changed = true;
            }
            if (metaTarget.includes('Member_name_key')) {
                newName = `${member.name} (${member.no})`;
                changed = true;
            }
            if (changed) {
                try {
                    yield db_config_1.default.member.create({
                        data: {
                            name: newName,
                            certificateNo: newCert,
                            certificateIssuedDate: member.certificateIssuedDate,
                            country: "Ethiopia",
                            regionId: member.region.id,
                            city: member.city,
                            councilFellowshipId: fellowhip.id,
                            stateId: state.id,
                            typeId: member.type.id,
                            boardMembers: { create: member.boardMembers.map((bm) => (Object.assign({}, bm))) },
                            reports: { create: member.reports.map((r) => (Object.assign({}, r))) },
                            isInEthiopia: true,
                        },
                    });
                    return;
                }
                catch (e) {
                    console.error(`Retry failed for member: ${member.name} (row ${member.no})`, e);
                }
            }
            console.error(`Error creating member: ${member.name} (Certificate No: ${member.certificateNo})`, error);
        }
    })));
});
exports.seedMembers = seedMembers;
function validateRow(row) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (row[0] !== null) {
                yield (0, region_validator_1.validateRegion)(row[3], row[0]);
            }
        }
        catch (error) {
            console.log("error in validateRow");
            console.log(error);
        }
    });
}
