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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get counts by councilFellowshipId
        const rows = yield db_config_1.default.member.groupBy({
            by: ['councilFellowshipId'],
            _count: { _all: true },
        });
        const filtered = rows.filter((r) => r.councilFellowshipId !== null);
        const sorted = filtered.sort((a, b) => b._count._all - a._count._all).slice(0, 25);
        const ids = sorted.map((r) => r.councilFellowshipId);
        const meta = ids.length
            ? yield db_config_1.default.councilFellowship.findMany({
                where: { id: { in: ids } },
                select: { id: true, name: true, certificateNo: true },
            })
            : [];
        const map = new Map(meta.map((m) => [m.id, m]));
        console.log('Top fellowships by member count:');
        for (const r of sorted) {
            const m = map.get(r.councilFellowshipId);
            const ident = m ? `${m.certificateNo} ${m.name}` : r.councilFellowshipId;
            console.log(`${r._count._all}\t${ident}`);
        }
    });
}
main().finally(() => db_config_1.default.$disconnect());
