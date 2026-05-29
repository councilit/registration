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
const validateMemberReport = (row) => __awaiter(void 0, void 0, void 0, function* () {
    const memberReport2014 = row[9];
    const memberReport2015 = row[10];
    const memberReport2016 = row[11];
    const validReportTypes = [1, 0, "1", "0", null];
    // console.log(`${row[3]} at row ${row[1]}`);
    if (validReportTypes.includes(memberReport2014) &&
        validReportTypes.includes(memberReport2015) &&
        validReportTypes.includes(memberReport2016))
        return true;
    //   console.log(`row`);
    //   console.log(row);
    throw new Error(`Invalid report status [${memberReport2014} , ${memberReport2015} , ${memberReport2016}] at row ${row[0]}`);
});
exports.validateMemberReport = validateMemberReport;
