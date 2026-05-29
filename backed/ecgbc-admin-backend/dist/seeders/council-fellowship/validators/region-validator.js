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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegion = void 0;
const validateRegion = (row) => __awaiter(void 0, void 0, void 0, function* () {
    const region = row[3];
    const validRegionTypes = [
        "አዲስ አበባ",
        "ኦሮሚያ ክልል",
        "አማራ ክልል",
        "ትግራይ ክልል",
        "ድሬደዋ",
        "ሲዳማ ክልል",
        "ጋምቤላ ክልል",
        "ደቡብ ኢትዮጵያ ክልል",
        "አፋር  ክልል",
        "ሶማሌ  ክልል",
        "ደቡብ ምዕራብ ኢትዮጵያ ክልል",
        "ሐረር",
        "ማዕከላዊ ኢትዮጵያ ክልል",
    ];
    console.log("row[3] ", row[3]);
    if (validRegionTypes.includes(region))
        return true;
    console.log(`row`);
    console.log(row);
    throw new Error(`region: ${region} not found at row ${row[0]}`);
});
exports.validateRegion = validateRegion;
