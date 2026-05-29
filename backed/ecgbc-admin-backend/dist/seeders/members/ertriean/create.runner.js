"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_seeder_1 = require("./create.seeder");
(0, create_seeder_1.seedMembers)()
    // deleteMembers()
    .catch((error) => {
    console.log(`Error while seeding Members`);
    console.log(error);
})
    .finally(() => {
    console.log("Seeding Members finished successfully.");
});
