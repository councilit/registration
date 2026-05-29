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
const db_config_1 = __importDefault(require("../app/config/db.config"));
function normalizeCanonical(s) {
    return s
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/[ \t\r\n\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function stripAllSpaces(s) { return normalizeCanonical(s).replace(/\s+/g, ''); }
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const nameVariants = [
            'አዲስ ቤተ-እመነት',
            'አዲስ ቤተ-እምነት',
            // English/transliterations
            'Addis Bet-Emnet',
            'Addis Bet Emnet',
            'Addis Betemnet',
            'New church',
            'New Church',
        ];
        const certQuery = '7995';
        // 1) Fellowships by name variants (JS filtered for robust match)
        const allCF = yield db_config_1.default.councilFellowship.findMany({ select: { id: true, name: true, certificateNo: true } });
        const targets = nameVariants.map(n => ({ raw: n, norm: normalizeCanonical(n), nos: stripAllSpaces(n) }));
        const cfHits = [];
        for (const f of allCF) {
            const n = normalizeCanonical(f.name);
            const ns = stripAllSpaces(f.name);
            for (const t of targets) {
                if (n.includes(t.norm) || ns.includes(t.nos)) {
                    cfHits.push(f);
                    break;
                }
            }
        }
        console.log('Council Fellowship name hits:', cfHits.length);
        for (const h of cfHits)
            console.log('-', h.certificateNo, h.name);
        // 2) Fellowships by certificateNo (exact or contains)
        const cfByCertEq = yield db_config_1.default.councilFellowship.findMany({ where: { certificateNo: certQuery }, select: { id: true, name: true, certificateNo: true } });
        const cfByCertLike = yield db_config_1.default.councilFellowship.findMany({ where: { certificateNo: { contains: certQuery } }, select: { id: true, name: true, certificateNo: true } });
        console.log('CF cert=7995:', cfByCertEq.length);
        for (const h of cfByCertEq)
            console.log('-', h.certificateNo, h.name);
        console.log('CF cert contains 7995:', cfByCertLike.length);
        for (const h of cfByCertLike)
            console.log('-', h.certificateNo, h.name);
        // 3) Members by name variants (JS filtered), include their fellowship
        const allMembers = yield db_config_1.default.member.findMany({ select: { id: true, name: true, certificateNo: true, councilFellowshipId: true, isActive: true } });
        const memHits = allMembers.filter(m => {
            const n = normalizeCanonical(m.name);
            const ns = stripAllSpaces(m.name);
            return targets.some(t => n.includes(t.norm) || ns.includes(t.nos));
        });
        console.log('Member name hits:', memHits.length);
        if (memHits.length) {
            const cfIds = Array.from(new Set(memHits.map(m => m.councilFellowshipId).filter(Boolean)));
            const cfMap = new Map();
            if (cfIds.length) {
                const cfs = yield db_config_1.default.councilFellowship.findMany({ where: { id: { in: cfIds } }, select: { id: true, name: true, certificateNo: true } });
                for (const c of cfs)
                    cfMap.set(c.id, { name: c.name, certificateNo: c.certificateNo });
            }
            for (const m of memHits.slice(0, 50)) {
                const meta = m.councilFellowshipId ? cfMap.get(m.councilFellowshipId) : undefined;
                console.log('-', m.certificateNo || '', m.name, '| fellowship:', meta ? `${meta.certificateNo} ${meta.name}` : 'none', '| active:', m.isActive);
            }
            // Summarize counts by fellowship
            const byCF = new Map();
            for (const m of memHits) {
                const key = m.councilFellowshipId || 'none';
                byCF.set(key, (byCF.get(key) || 0) + 1);
            }
            console.log('Member hits by fellowship:');
            for (const [cfId, count] of byCF) {
                const meta = cfId !== 'none' ? cfMap.get(cfId) : undefined;
                console.log('-', cfId, count, meta ? `| ${meta.certificateNo} ${meta.name}` : '');
            }
        }
        // 4) Members by certificateNo exact = 7995
        const memByCert = yield db_config_1.default.member.findMany({ where: { certificateNo: certQuery }, select: { id: true, name: true, councilFellowshipId: true } });
        console.log('Members with certificateNo=7995:', memByCert.length);
        for (const m of memByCert)
            console.log('-', m.id, m.name, m.councilFellowshipId);
    });
}
main().finally(() => db_config_1.default.$disconnect());
