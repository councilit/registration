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
exports.getDataLookups = void 0;
const error_config_1 = require("../../../config/error.config");
exports.getDataLookups = (0, error_config_1.catchAsync)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query || {};
    let filter = {};
    console.log(`query`, query);
    for (const key in query) {
        filter = Object.assign(Object.assign({}, filter), { [key]: query[key] });
    }
    if (Object.keys(filter).length > 0) {
        req.filters = filter;
    }
    else {
        req.filters = {};
    }
    next();
}));
