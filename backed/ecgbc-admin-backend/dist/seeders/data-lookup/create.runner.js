"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_seeder_1 = require("./create.seeder");
(0, create_seeder_1.seedDataLookups)()
    .catch((error) => {
    console.log(`Error while seeding data lookup`);
    console.log(error);
})
    .finally(() => {
    console.log("Seeding data lookup finished successfully.");
});
