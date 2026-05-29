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
exports.getReportStatus = void 0;
const db_config_1 = __importDefault(require("../../../app/config/db.config"));
const report_status_enum_1 = require("../../../app/features/report/enums/report-status.enum");
const getReportStatus = (report) => __awaiter(void 0, void 0, void 0, function* () {
    //   console.log("report", report);
    const reportedTypes = [1, "1", "Reported", "REPORTED"];
    const notReportedTypes = [0, "0", "NOT REPORTED"];
    let reportStatus = null;
    if (reportedTypes.includes(report)) {
        reportStatus = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: report_status_enum_1.ReportStatus.REPORTED },
        }));
        return reportStatus;
    }
    //   if (notReportedTypes.includes(report)) {
    reportStatus = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: report_status_enum_1.ReportStatus.NOT_REPORTED },
    }));
    return reportStatus;
    //   }
    //   throw new Error(`report status : ${report} not found`);
});
exports.getReportStatus = getReportStatus;
