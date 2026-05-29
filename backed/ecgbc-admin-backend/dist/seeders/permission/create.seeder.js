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
exports.seedPermissions = void 0;
const path_1 = __importDefault(require("path"));
const node_1 = __importDefault(require("read-excel-file/node"));
const db_config_1 = __importDefault(require("../../app/config/db.config"));
const seedPermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = (yield (0, node_1.default)(path_1.default.join(__dirname, "data.xlsx")));
    const permissions = [];
    for (const row of data.slice(1)) {
        permissions.push({ codeName: row[0],
            description: "" });
    }
    yield Promise.all(permissions.map((permission) => __awaiter(void 0, void 0, void 0, function* () {
        yield db_config_1.default.permission.upsert({
            where: { codeName: permission.codeName }, // Assuming 'email' is a unique field
            update: {}, // If you don't want to update, keep it empty
            create: {
                codeName: permission.codeName,
                description: permission.description
            },
        });
    })));
});
exports.seedPermissions = seedPermissions;
