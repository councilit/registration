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
exports.validateMemberCertificate = void 0;
const ethiopian_date_helper_1 = require("../helpers/ethiopian-date.helper");
const validateMemberCertificate = (memberCertificateIssuedDate, memberCertificateNo, row) => __awaiter(void 0, void 0, void 0, function* () {
    const date = (0, ethiopian_date_helper_1.ethToGreg)(memberCertificateIssuedDate, row);
    if (memberCertificateIssuedDate && memberCertificateNo)
        return true;
    //   console.log(`row`);
    //   console.log(row);
    console.log(`memberCertificateIssuedDate `, memberCertificateIssuedDate);
    console.log(`memberCertificateNo `, memberCertificateNo);
    throw new Error(`Invalid certificate data at row ${row}`);
});
exports.validateMemberCertificate = validateMemberCertificate;
