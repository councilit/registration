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
console.log("Starting the staff fellowship listing script...");
function list(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const staff = yield db_config_1.default.staff.findUnique({ where: { email }, select: { id: true, email: true, fullName: true } });
        if (!staff) {
            console.log('No staff found for', email);
            return;
        }
        const links = yield db_config_1.default.staffFellowship.findMany({
            where: { staffId: staff.id },
            select: { fellowshipId: true },
        });
        const ids = links.map((l) => l.fellowshipId);
        const fellowships = ids.length
            ? yield db_config_1.default.councilFellowship.findMany({
                where: { id: { in: ids } },
                select: { id: true, name: true, certificateNo: true },
                orderBy: { name: 'asc' },
            })
            : [];
        console.log(`Staff: ${staff.fullName} <${staff.email}>`);
        console.log(`Linked fellowships (${fellowships.length}):`);
        for (const f of fellowships)
            console.log('-', f.certificateNo, f.name);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const emails = process.argv.slice(2);
        for (const e of emails) {
            yield list(e);
            console.log('');
        }
    });
}
main().finally(() => db_config_1.default.$disconnect());
