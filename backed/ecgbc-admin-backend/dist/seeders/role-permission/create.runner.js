"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_seeder_1 = require("./create.seeder");
(0, create_seeder_1.seedRolePermissions)().catch((error) => {
    console.log(`Error while seeding role permissions`);
    console.log(error);
}).finally(() => {
    console.log('Seeding role permissions finished successfully.');
});
