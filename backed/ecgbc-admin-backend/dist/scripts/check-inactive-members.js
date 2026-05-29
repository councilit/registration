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
const data_lookup_enum_1 = require("../app/features/data-lookup/enums/data-lookup.enum");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const [inactiveByFlag, inactiveByState, combinedInactive] = yield Promise.all([
            db_config_1.default.member.count({ where: { isActive: false } }),
            db_config_1.default.member.count({ where: { state: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE } } }),
            db_config_1.default.member.count({
                where: {
                    OR: [
                        { isActive: false },
                        { state: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE } },
                    ],
                },
            }),
        ]);
        const activeButStateInactive = yield db_config_1.default.member.findMany({
            where: {
                isActive: true,
                state: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE },
            },
            select: {
                id: true,
                name: true,
                certificateNo: true,
                isActive: true,
            },
            orderBy: { name: 'asc' },
        });
        const inactiveButStateActive = yield db_config_1.default.member.findMany({
            where: {
                isActive: false,
                state: { value: data_lookup_enum_1.CommonObjectState.ACTIVE },
            },
            select: {
                id: true,
                name: true,
                certificateNo: true,
                isActive: true,
            },
            orderBy: { name: 'asc' },
        });
        console.log('Inactive members metrics:');
        console.log(' - isActive = false:', inactiveByFlag);
        console.log(' - state = IN_ACTIVE:', inactiveByState);
        console.log(' - union of both conditions:', combinedInactive);
        if (activeButStateInactive.length > 0) {
            console.log(`\nMembers with isActive=true but state=IN_ACTIVE (${activeButStateInactive.length}):`);
            for (const m of activeButStateInactive) {
                console.log(`  - ${m.certificateNo} | ${m.name}`);
            }
        }
        if (inactiveButStateActive.length > 0) {
            console.log(`\nMembers with isActive=false but state=ACTIVE (${inactiveButStateActive.length}):`);
            for (const m of inactiveButStateActive) {
                console.log(`  - ${m.certificateNo} | ${m.name}`);
            }
        }
    });
}
main()
    .catch((err) => {
    console.error('Error while checking inactive member metrics:', err);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_config_1.default.$disconnect();
}));
