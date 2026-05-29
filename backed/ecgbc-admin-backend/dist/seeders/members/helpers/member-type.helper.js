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
exports.getMemberType = void 0;
const db_config_1 = __importDefault(require("../../../app/config/db.config"));
const data_lookup_enum_1 = require("../../../app/features/data-lookup/enums/data-lookup.enum");
function normalizeCanonical(s) {
    return (s || "")
        .toString()
        .normalize("NFKC")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[\t\r\n\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function stripAllSpacesLower(s) { return normalizeCanonical(s).replace(/\s+/g, "").toLowerCase(); }
const getMemberType = (memberType) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = memberType || "";
    const norm = stripAllSpacesLower(raw);
    const CHURCH_KEYS = new Set([
        stripAllSpacesLower("ቤተክርስቲያን"),
        stripAllSpacesLower("ቤተ ክርስቲያን"),
        stripAllSpacesLower("ቤ/ክርስቲያን"),
        stripAllSpacesLower("church"),
    ]);
    const MINISTRY_KEYS = new Set([
        stripAllSpacesLower("ሚኒስትሪ"),
        stripAllSpacesLower("ሚኒስቴሪ"),
        stripAllSpacesLower("ሚንስትሪ"),
        stripAllSpacesLower("ministry"),
        // Common Amharic variants meaning "Center"
        stripAllSpacesLower("ማእከል"),
        stripAllSpacesLower("ማዕከል"),
        stripAllSpacesLower("ማአከል"),
        stripAllSpacesLower("center"),
    ]);
    if (CHURCH_KEYS.has(norm)) {
        return (yield db_config_1.default.dataLookup.findUnique({ where: { value: data_lookup_enum_1.MemberType.CHURCH } }));
    }
    if (MINISTRY_KEYS.has(norm)) {
        return (yield db_config_1.default.dataLookup.findUnique({ where: { value: data_lookup_enum_1.MemberType.MINISTRY } }));
    }
    // Fallback: try simple contains checks on common tokens
    if (norm.includes(stripAllSpacesLower("ቤተ")) || norm.includes("church")) {
        return (yield db_config_1.default.dataLookup.findUnique({ where: { value: data_lookup_enum_1.MemberType.CHURCH } }));
    }
    if (norm.includes("ministry") ||
        norm.includes(stripAllSpacesLower("ሚኒስ")) ||
        norm.includes(stripAllSpacesLower("ማእከል")) ||
        norm.includes(stripAllSpacesLower("ማዕከል")) ||
        norm.includes(stripAllSpacesLower("ማአከል")) ||
        norm.includes("center")) {
        return (yield db_config_1.default.dataLookup.findUnique({ where: { value: data_lookup_enum_1.MemberType.MINISTRY } }));
    }
    throw new Error(`memberType ${memberType} not found`);
});
exports.getMemberType = getMemberType;
