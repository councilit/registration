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
const db_config_1 = __importDefault(require("../../app/config/db.config"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = process.env.MISSING_FELLOWSHIP_NAME || 'አዲስ ቤተ-እመነት';
        let cert = process.env.MISSING_FELLOWSHIP_CERT || '';
        const existing = yield db_config_1.default.councilFellowship.findUnique({ where: { name } });
        if (existing) {
            console.log('Already exists:', existing.name, existing.certificateNo);
            return;
        }
        if (!cert) {
            // Try a few candidate certificate numbers until unique
            const candidates = ['9776', '9001', '9002', '9003'];
            for (const c of candidates) {
                const taken = yield db_config_1.default.councilFellowship.findUnique({ where: { certificateNo: c } });
                if (!taken) {
                    cert = c;
                    break;
                }
            }
            if (!cert) {
                cert = Math.floor(1000 + Math.random() * 9000).toString();
            }
        }
        const created = yield db_config_1.default.councilFellowship.create({
            data: {
                name,
                certificateNo: cert,
                certificateIssuedDate: new Date(),
                isInEthiopia: true,
                city: 'Addis Ababa',
            },
        });
        console.log('Created fellowship:', created.name, created.certificateNo);
    });
}
main().finally(() => db_config_1.default.$disconnect());
