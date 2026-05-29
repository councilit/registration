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
exports.seedRoles = void 0;
const db_config_1 = __importDefault(require("../../app/config/db.config"));
const role_type_enum_1 = require("../../app/features/role/enums/role-type.enum");
const data_lookup_enum_1 = require("../../app/features/data-lookup/enums/data-lookup.enum");
const seedRoles = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE },
    }));
    const owner = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: role_type_enum_1.RoleType.OWNER },
    }));
    const admin = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: role_type_enum_1.RoleType.ADMIN },
    }));
    const lookAdmin = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: role_type_enum_1.RoleType.LOOK_ADMIN },
    }));
    const roles = [
        {
            name: "Owner",
            description: "Owner / Super Admin",
            type: owner,
            state,
        },
        {
            name: "Admin",
            description: "Admin",
            type: admin,
            state,
        },
        {
            name: "Lookup Admin",
            description: "Lookup Admin",
            type: lookAdmin,
            state,
        },
    ];
    yield Promise.all(roles.map((role) => __awaiter(void 0, void 0, void 0, function* () {
        yield db_config_1.default.role.upsert({
            where: { name: role.name }, // Assuming 'email' is a unique field
            update: {}, // If you don't want to update, keep it empty
            create: {
                name: role.name,
                description: role.description,
                typeId: role.type.id,
                stateId: role.state.id,
            },
        });
    })));
});
exports.seedRoles = seedRoles;
