"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_seeder_1 = require("./create.seeder");
(0, create_seeder_1.seedRoles)().catch((error) => {
    console.log(`Error while seeding roles`);
    console.log(error);
}).finally(() => {
    console.log('Seeding roles finished successfully.');
});
