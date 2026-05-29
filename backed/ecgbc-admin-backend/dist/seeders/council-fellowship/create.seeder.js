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
exports.seedCouncilFellowships = void 0;
const path_1 = __importDefault(require("path"));
const node_1 = __importDefault(require("read-excel-file/node"));
const db_config_1 = __importDefault(require("../../app/config/db.config"));
const console_1 = require("console");
const ethiopian_number_helper_1 = require("./helpers/ethiopian-number.helper");
const ethiopian_date_helper_1 = require("./helpers/ethiopian-date.helper");
const member_region_helper_1 = require("./helpers/member-region.helper");
const seedCouncilFellowships = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = (yield (0, node_1.default)(path_1.default.join(__dirname, "fellowships.xlsx")));
    console.log("total rows", data.length);
    let councilFellowships = [];
    let lastRow = 0;
    //   log("data");
    //   log(data);
    for (const row of data.slice(4)) {
        try {
            // validateRow(row);
            if (row[0] !== null) {
                // log("row");
                // log(row);
                lastRow = row[0];
                (0, console_1.log)("lastRow", lastRow);
                const region = yield (0, member_region_helper_1.getMemberRegion)(row[3]);
                councilFellowships.push({
                    no: row[0],
                    name: row[1],
                    type: row[2],
                    region,
                    city: row[4],
                    certificateIssuedDate: (0, ethiopian_date_helper_1.ethToGreg)(row[7]),
                    certificateNo: row[8].toString(),
                    boardMembers: [],
                    reports: [],
                });
                if (row[1] !== null) {
                    councilFellowships = councilFellowships.map((councilFellowship) => {
                        var _a;
                        if (councilFellowship.no === lastRow &&
                            row[5] !== null &&
                            row[6] !== null) {
                            return Object.assign(Object.assign({}, councilFellowship), { boardMembers: [
                                    ...councilFellowship.boardMembers,
                                    {
                                        fullName: row[5],
                                        phoneNumber: (0, ethiopian_number_helper_1.formattedEthiopianPhoneNumber)((_a = row[6]) === null || _a === void 0 ? void 0 : _a.toString()),
                                    },
                                ] });
                        }
                        return councilFellowship;
                    });
                }
            }
            else {
                councilFellowships = councilFellowships.map((councilFellowship) => {
                    var _a;
                    if (councilFellowship.no === lastRow &&
                        row[5] !== null &&
                        row[6] !== null) {
                        return Object.assign(Object.assign({}, councilFellowship), { boardMembers: [
                                ...councilFellowship.boardMembers,
                                {
                                    fullName: row[5],
                                    phoneNumber: (0, ethiopian_number_helper_1.formattedEthiopianPhoneNumber)((_a = row[6]) === null || _a === void 0 ? void 0 : _a.toString()),
                                },
                            ] });
                    }
                    return councilFellowship;
                });
            }
        }
        catch (error) {
            (0, console_1.log)("error in row");
            (0, console_1.log)(row);
            (0, console_1.log)(error);
        }
    }
    // log("councilFellowships");
    // log(councilFellowships);
    try {
        yield Promise.all(councilFellowships.map((councilFellowship) => __awaiter(void 0, void 0, void 0, function* () {
            yield db_config_1.default.councilFellowship.upsert({
                where: { certificateNo: councilFellowship.certificateNo.toString() }, // Assuming 'email' is a unique field
                update: {}, // If you don't want to update, keep it empty
                create: {
                    name: councilFellowship.name,
                    certificateNo: councilFellowship.certificateNo,
                    certificateIssuedDate: councilFellowship.certificateIssuedDate,
                    city: councilFellowship.city,
                    boardMembers: {
                        create: councilFellowship.boardMembers,
                    },
                    isInEthiopia: true,
                },
            });
        })));
        console.log("councilFellowships created successfully");
        // Ensure “አዲስ ቤተ-እመነት” exists even if not present in the sheet
        const missingName = "አዲስ ቤተ-እመነት";
        const existing = yield db_config_1.default.councilFellowship.findUnique({ where: { name: missingName } });
        if (!existing) {
            // Generate a unique 4-digit certificate number not used yet
            const used = new Set((yield db_config_1.default.councilFellowship.findMany({ select: { certificateNo: true } })).map((x) => x.certificateNo));
            let candidate = 9001;
            while (used.has(candidate.toString()))
                candidate++;
            const created = yield db_config_1.default.councilFellowship.create({
                data: {
                    name: missingName,
                    certificateNo: candidate.toString(),
                    certificateIssuedDate: new Date(),
                    isInEthiopia: true,
                    city: "Addis Ababa",
                },
            });
            console.log("Ensured missing fellowship created:", created.name, created.certificateNo);
        }
    }
    catch (error) {
        (0, console_1.log)("error in upsert councilFellowship");
        (0, console_1.log)(error);
    }
});
exports.seedCouncilFellowships = seedCouncilFellowships;
function validateRow(row) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // log("row[0] ", row[0]);
            if (row[1] !== null) {
                // await validateMemberType(row);
                // await validateRegion(row);
                // await validateMemberCertificate(row);
                // await validateMemberReport(row);
            }
        }
        catch (error) {
            (0, console_1.log)("error in validateRow");
            (0, console_1.log)(error);
        }
    });
}
