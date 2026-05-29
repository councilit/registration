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
function normalizeCanonical(s) {
    return (s || "")
        .toString()
        .normalize("NFKC")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[\t\r\n\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function stripAllSpacesLower(s) { return normalizeCanonical(s).replace(/\s+/g, "").toLowerCase(); }
const MAP = [
    { keys: ["አዲስአበባ", "addisababa", "addis"], value: data_lookup_enum_1.Region.ADDIS_ABEBA },
    { keys: ["ትግራይክልል", "tigray"], value: data_lookup_enum_1.Region.TIGRAY },
    { keys: ["ኦሮሚያክልል", "oromia"], value: data_lookup_enum_1.Region.OROMIA },
    { keys: ["አማራክልል", "amhara"], value: data_lookup_enum_1.Region.AMHARA },
    { keys: ["ድሬደዋ", "dire", "diredawa"], value: data_lookup_enum_1.Region.DIREDAWA },
    { keys: ["ሲዳማክልል", "sidama"], value: data_lookup_enum_1.Region.SIDAMA },
    { keys: ["ጋምቤላክልል", "gambella"], value: data_lookup_enum_1.Region.GAMBELLA },
    { keys: ["ደቡብኢትዮጵያክልል", "southregion", "south"], value: data_lookup_enum_1.Region.SOUTH },
    { keys: ["አፋርክልል", "afar"], value: data_lookup_enum_1.Region.AFAR },
    { keys: ["ሶማሌክልል", "somale", "somali"], value: data_lookup_enum_1.Region.SOMALE },
    { keys: ["ደቡብምዕራብኢትዮጵያክልል", "southwest", "south-west"], value: data_lookup_enum_1.Region.SOUTH_WEST },
    { keys: ["ሐረር", "harer", "harar"], value: data_lookup_enum_1.Region.HARER },
    { keys: ["ማዕከላዊኢትዮጵያክልል", "central"], value: data_lookup_enum_1.Region.CENTRAL },
    { keys: ["ቤኒሻንጉልክልል", "benshangul"], value: data_lookup_enum_1.Region.BENSHANGUL },
];
const getMemberRegion = (memberRegion) => __awaiter(void 0, void 0, void 0, function* () {
    const norm = stripAllSpacesLower(memberRegion);
    const hit = MAP.find(m => m.keys.some(k => norm.includes(k)));
    if (hit) {
        return (yield db_config_1.default.dataLookup.findUnique({ where: { value: hit.value } }));
    }
    throw new Error(`region ${memberRegion} not found`);
});
exports.getMemberRegion = getMemberRegion;
