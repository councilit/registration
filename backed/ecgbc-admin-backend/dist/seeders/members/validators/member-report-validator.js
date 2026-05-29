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
exports.validateMemberReport = void 0;
const validateMemberReport = (memberReport2014, memberReport2015, memberReport2016, row) => __awaiter(void 0, void 0, void 0, function* () {
    const validReportTypes = [
        1,
        0,
        "1",
        "0",
        "Reported",
        "NOT REPORTED",
        "REPORTED",
        null
    ];
    // console.log(`${row[3]} at row ${row[1]}`);
    if (validReportTypes.includes(memberReport2014) &&
        validReportTypes.includes(memberReport2015) &&
        validReportTypes.includes(memberReport2016))
        return true;
    //   console.log(`row`);
    //   console.log(row);
    console.log(`Invalid report status ${row}`);
    console.log(`memberReport2014 `, memberReport2014);
    console.log(`memberReport2015 `, memberReport2015);
    console.log(`memberReport2016 `, memberReport2016);
    throw new Error(`Invalid report status ${row}`);
});
exports.validateMemberReport = validateMemberReport;
