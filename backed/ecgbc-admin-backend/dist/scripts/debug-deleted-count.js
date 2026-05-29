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
function debugDeleted() {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedState = yield db_config_1.default.dataLookup.findFirst({
            where: { value: "objecjt_state_deleted" },
        });
        if (!deletedState) {
            console.log("DELETED state lookup not found");
            return;
        }
        const count = yield db_config_1.default.member.count({
            where: { stateId: deletedState.id }
        });
        console.log(`Debug Script: Found ${count} members with stateID ${deletedState.id} (DELETED)`);
        const deletedMembers = yield db_config_1.default.member.findMany({
            where: { stateId: deletedState.id },
            select: { id: true, name: true, isActive: true, state: { select: { value: true } } }
        });
        console.log("Deleted members details:", deletedMembers);
    });
}
debugDeleted().catch(console.error).finally(() => db_config_1.default.$disconnect());
