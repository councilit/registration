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
require("dotenv/config");
const db_config_1 = __importDefault(require("../app/config/db.config"));
function normalizeCanonical(s) {
    return s
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/[ \t\r\n\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function stripAllSpaces(s) {
    return normalizeCanonical(s).replace(/\s+/g, '');
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const q = process.argv.slice(2).join(' ');
        const all = yield db_config_1.default.councilFellowship.findMany({ select: { id: true, name: true, certificateNo: true } });
        const targetNorm = normalizeCanonical(q);
        const targetNoSpace = stripAllSpaces(q);
        const hits = all.filter(f => {
            const n = normalizeCanonical(f.name);
            const ns = stripAllSpaces(f.name);
            return (n.includes(targetNorm) ||
                ns.includes(targetNoSpace) ||
                // Also match by certificateNo (exact or partial, space-insensitive)
                f.certificateNo.includes(targetNoSpace));
        });
        console.log('Query:', q);
        console.log('Matches:', hits.length);
        for (const h of hits) {
            console.log('-', h.certificateNo, h.name);
        }
    });
}
main().finally(() => db_config_1.default.$disconnect());
