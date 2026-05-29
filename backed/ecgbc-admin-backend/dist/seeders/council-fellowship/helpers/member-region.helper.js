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
exports.getMemberRegion = void 0;
const db_config_1 = __importDefault(require("../../../app/config/db.config"));
const data_lookup_enum_1 = require("../../../app/features/data-lookup/enums/data-lookup.enum");
const getMemberRegion = (memberRegion) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("memberRegion", memberRegion);
    let region = null;
    if (memberRegion == "አዲስ አበባ") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.ADDIS_ABEBA },
        }));
        return region;
    }
    if (memberRegion == "ኦሮሚያ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.OROMIA },
        }));
        return region;
    }
    if (memberRegion == "አማራ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.AMHARA },
        }));
        return region;
    }
    if (memberRegion == "ድሬደዋ") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.DIREDAWA },
        }));
        return region;
    }
    if (memberRegion == "ሲዳማ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.SIDAMA },
        }));
        return region;
    }
    if (memberRegion == "ጋምቤላ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.GAMBELLA },
        }));
        return region;
    }
    if (memberRegion == "ደቡብ ኢትዮጵያ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.SOUTH },
        }));
        return region;
    }
    if (memberRegion == "አፋር ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.AFAR },
        }));
        return region;
    }
    if (memberRegion == "ሶማሌ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.SOMALE },
        }));
        return region;
    }
    if (memberRegion == "ደቡብ ምዕራብ ኢትዮጵያ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.SOUTH_WEST },
        }));
        return region;
    }
    if (memberRegion == "ሐረር") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.SOUTH_WEST },
        }));
        return region;
    }
    if (memberRegion == "ማዕከላዊ ኢትዮጵያ ክልል") {
        region = (yield db_config_1.default.dataLookup.findUnique({
            where: { value: data_lookup_enum_1.Region.SOUTH_WEST },
        }));
        return region;
    }
    throw new Error(`region ${memberRegion} not found`);
});
exports.getMemberRegion = getMemberRegion;
