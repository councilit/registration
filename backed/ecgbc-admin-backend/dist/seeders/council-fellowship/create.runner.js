"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_seeder_1 = require("./create.seeder");
(0, create_seeder_1.seedCouncilFellowships)()
    .catch((error) => {
    console.log(`Error while seeding Council fellowhips`);
    console.log(error);
})
    .finally(() => {
    console.log("Seeding Council fellowhips finished successfully.");
});
