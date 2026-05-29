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
        const arg = process.argv[2];
        if (!arg) {
            console.error('Usage: tsx src/scripts/count-fellowship-members.ts <certificateNo or fellowshipId or memberCertificateNo>');
            process.exit(1);
        }
        // Try council fellowship by certificateNo or id first
        let fellowship = yield db_config_1.default.councilFellowship.findFirst({
            where: { OR: [{ certificateNo: arg }, { id: arg }] },
            select: { id: true, name: true, certificateNo: true },
        });
        // If not found, try resolving via a member certificateNo
        if (!fellowship) {
            const member = yield db_config_1.default.member.findUnique({ where: { certificateNo: arg }, select: { councilFellowshipId: true } });
            if (member === null || member === void 0 ? void 0 : member.councilFellowshipId) {
                fellowship = yield db_config_1.default.councilFellowship.findUnique({
                    where: { id: member.councilFellowshipId },
                    select: { id: true, name: true, certificateNo: true },
                });
            }
        }
        if (!fellowship) {
            console.error('Fellowship not found for identifier:', arg);
            process.exit(1);
        }
        const [totalChurches, totalMinistries, activeChurches, activeMinistries, inactiveChurches, inactiveMinistries] = yield Promise.all([
            db_config_1.default.member.count({ where: { councilFellowshipId: fellowship.id, type: { value: 'CHURCH' } } }),
            db_config_1.default.member.count({ where: { councilFellowshipId: fellowship.id, type: { value: 'MINISTRY' } } }),
            db_config_1.default.member.count({ where: { councilFellowshipId: fellowship.id, type: { value: 'CHURCH' }, isActive: true } }),
            db_config_1.default.member.count({ where: { councilFellowshipId: fellowship.id, type: { value: 'MINISTRY' }, isActive: true } }),
            db_config_1.default.member.count({ where: { councilFellowshipId: fellowship.id, type: { value: 'CHURCH' }, isActive: false } }),
            db_config_1.default.member.count({ where: { councilFellowshipId: fellowship.id, type: { value: 'MINISTRY' }, isActive: false } }),
        ]);
        console.log('Fellowship:', fellowship.certificateNo, fellowship.name);
        console.log('Total Churches:', totalChurches, '| Active:', activeChurches, '| Inactive:', inactiveChurches);
        console.log('Total Ministries:', totalMinistries, '| Active:', activeMinistries, '| Inactive:', inactiveMinistries);
    });
}
main().finally(() => db_config_1.default.$disconnect());
