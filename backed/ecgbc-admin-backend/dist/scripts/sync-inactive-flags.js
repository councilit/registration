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
        const [activeState, inactiveState] = yield Promise.all([
            db_config_1.default.dataLookup.findFirst({ where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE }, select: { id: true } }),
            db_config_1.default.dataLookup.findFirst({ where: { value: data_lookup_enum_1.CommonObjectState.IN_ACTIVE }, select: { id: true } }),
        ]);
        if (!(activeState === null || activeState === void 0 ? void 0 : activeState.id) || !(inactiveState === null || inactiveState === void 0 ? void 0 : inactiveState.id)) {
            throw new Error('Failed to resolve active/inactive state IDs');
        }
        const fixInactive = yield db_config_1.default.member.updateMany({
            where: {
                stateId: inactiveState.id,
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });
        const fixActive = yield db_config_1.default.member.updateMany({
            where: {
                stateId: activeState.id,
                isActive: false,
            },
            data: {
                isActive: true,
                reasonForInactive: null,
            },
        });
        console.log('Sync complete. Rows updated:');
        console.log(' - Set isActive=false for inactive state:', fixInactive.count);
        console.log(' - Set isActive=true for active state:', fixActive.count);
    });
}
main()
    .catch((err) => {
    console.error('Error syncing inactive flags:', err);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_config_1.default.$disconnect();
}));
