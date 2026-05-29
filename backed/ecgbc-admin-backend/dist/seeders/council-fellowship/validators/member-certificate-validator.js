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
const validateMemberCertificate = (row) => __awaiter(void 0, void 0, void 0, function* () {
    const memberCertificateIssuedDate = row[7];
    const memberCertificateNo = row[8];
    if (memberCertificateIssuedDate && memberCertificateNo)
        return true;
    //   console.log(`row`);
    //   console.log(row);
    throw new Error(`Invalid certificate data at row ${row[0]}`);
});
exports.validateMemberCertificate = validateMemberCertificate;
