"use strict";
// import consola from "consola";
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
const create_seeder_1 = require("./selam/create.seeder");
const create_seeder_2 = require("./ab/create.seeder");
const create_seeder_3 = require("./wongel/create.seeder");
const create_seeder_4 = require("./tehadiso/create.seeder");
const create_seeder_5 = require("./eva/create.seeder");
const create_seeder_6 = require("./pentecostal/create.seeder");
const create_seeder_7 = require("./rehobot/create.seeder");
const create_seeder_8 = require("./visionary/create.seeder");
const create_seeder_9 = require("./addis/create.seeder");
const create_seeder_10 = require("./nebar/create.seeder");
const create_seeder_11 = require("./fikr/create.seeder");
const create_seeder_12 = require("./ertriean/create.seeder");
const create_seeder_13 = require("./nebar-church/create.seeder");
const create_seeder_14 = require("./foreign/create.seeder");
const create_seeder_15 = require("./eecf/create.seeder");
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, create_seeder_1.seedMembers)();
    console.log(`Create seeder for selam finished successfully.`);
    yield (0, create_seeder_3.seedMembers)();
    console.log(`Create seeder for wongel finished successfully.`);
    yield (0, create_seeder_4.seedMembers)();
    console.log(`Create seeder for tehadiso finished successfully.`);
    yield (0, create_seeder_5.seedMembers)();
    console.log(`Create seeder for eva finished successfully.`);
    yield (0, create_seeder_6.seedMembers)();
    console.log(`Create seeder for pentecostal finished successfully.`);
    yield (0, create_seeder_7.seedMembers)();
    console.log(`Create seeder for rehobot finished successfully.`);
    yield (0, create_seeder_2.seedMembers)();
    console.log(`Create seeder for ab finished successfully.`);
    yield (0, create_seeder_8.seedMembers)();
    console.log(`Create seeder for visionary finished successfully.`);
    yield (0, create_seeder_9.seedMembers)();
    console.log(`Create seeder for addis finished successfully.`);
    yield (0, create_seeder_10.seedMembers)();
    console.log(`Create seeder for nebar finished successfully.`);
    yield (0, create_seeder_11.seedMembers)();
    console.log(`Create seeder for fikr finished successfully.`);
    yield (0, create_seeder_12.seedMembers)();
    console.log(`Create seeder for ertriean finished successfully.`);
    yield (0, create_seeder_13.seedMembers)();
    console.log(`Create seeder for nebar church finished successfully.`);
    yield (0, create_seeder_14.seedMembers)();
    console.log(`Create seeder for foreign finished successfully.`);
    yield (0, create_seeder_15.seedMembers)();
    console.log(`Create seeder for eecf finished successfully.`);
}))().catch(err => console.log(err)).finally(() => console.log(`Create seeder finished successfully.`));
