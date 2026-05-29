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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const email = "gezuabiy@gmail.com";
        console.log(`Checking user: ${email}`);
        const staff = yield prisma.staff.findUnique({
            where: { email },
            include: {
                fellowships: {
                    include: {
                        fellowship: true
                    }
                },
                role: {
                    include: {
                        type: true
                    }
                }
            },
        });
        if (!staff) {
            console.log("Staff not found");
            return;
        }
        console.log("Staff found:", staff.id);
        console.log("Role:", (_a = staff.role) === null || _a === void 0 ? void 0 : _a.name);
        console.log("Role Type:", (_b = staff.role) === null || _b === void 0 ? void 0 : _b.type);
        const isAdmin = ((_c = staff.role) === null || _c === void 0 ? void 0 : _c.name) === 'admin' || ((_d = staff.role) === null || _d === void 0 ? void 0 : _d.name) === 'super_admin';
        console.log("Is Admin Role?:", isAdmin);
        const allowed = staff.fellowships.map(sf => sf.fellowshipId);
        console.log("Allowed Fellowships:", allowed);
        // Simulate what `member.filter.ts` does
        let filters = {};
        if (!isAdmin) {
            if (allowed && allowed.length > 0) {
                filters = Object.assign(Object.assign({}, filters), { councilFellowshipId: { in: allowed } });
                console.log("Applying IN filter:", JSON.stringify(filters));
            }
            else {
                // This is the logic I added
                filters = Object.assign(Object.assign({}, filters), { id: "00000000-0000-0000-0000-000000000000" });
                console.log("Applying BLOCK filter:", JSON.stringify(filters));
            }
        }
        else {
            console.log("User is Admin, NO filter");
        }
        // Now run the query with these filters to see the count
        const count = yield prisma.member.count({
            where: filters
        });
        console.log(`\nQuery result count with computed filters: ${count}`);
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
