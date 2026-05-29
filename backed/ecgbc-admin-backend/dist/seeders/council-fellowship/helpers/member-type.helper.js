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
const getMemberType = (row) => __awaiter(void 0, void 0, void 0, function* () {
    let type = null;
    const memberType = row[3];
    if (memberType == "ቤተክርስቲያን") {
        type = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.MemberType.CHURCH },
        }));
        return type;
    }
    if (memberType == "ሚኒስትሪ") {
        type = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.MemberType.MINISTRY },
        }));
        return type;
    }
    throw new Error(`memberType ${memberType} not found`);
});
exports.getMemberType = getMemberType;
