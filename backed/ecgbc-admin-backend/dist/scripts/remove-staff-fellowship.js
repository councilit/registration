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
require("dotenv/config");
const db_config_1 = __importDefault(require("../app/config/db.config"));
console.log("Starting the staff fellowship removal script...");
function removeFellowship(email, fellowshipName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find the staff member
        const staff = yield db_config_1.default.staff.findUnique({
            where: { email },
            select: { id: true, email: true, fullName: true }
        });
        if (!staff) {
            console.log('No staff found for', email);
            return;
        }
        // Find the fellowship by name
        const fellowship = yield db_config_1.default.councilFellowship.findFirst({
            where: { name: fellowshipName },
            select: { id: true, name: true, certificateNo: true }
        });
        if (!fellowship) {
            console.log('No fellowship found with name:', fellowshipName);
            return;
        }
        console.log(`Found staff: ${staff.fullName} <${staff.email}>`);
        console.log(`Found fellowship: ${fellowship.certificateNo} - ${fellowship.name}`);
        // Check if the relationship exists
        const existingLink = yield db_config_1.default.staffFellowship.findUnique({
            where: {
                staffId_fellowshipId: {
                    staffId: staff.id,
                    fellowshipId: fellowship.id
                }
            }
        });
        if (!existingLink) {
            console.log('No relationship found between this staff and fellowship');
            return;
        }
        // Remove the relationship
        yield db_config_1.default.staffFellowship.delete({
            where: {
                staffId_fellowshipId: {
                    staffId: staff.id,
                    fellowshipId: fellowship.id
                }
            }
        });
        console.log(`✅ Successfully removed ${fellowship.name} from ${staff.fullName}'s access`);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length !== 2) {
            console.log('Usage: npm run script:remove-staff-fellowship <email> <fellowship-name>');
            console.log('Example: npm run script:remove-staff-fellowship kiyagudina07@gmail.com "የኢትዮጵያ ፔንቴኮስታል አብያተ ክርስቲያናት ሕብረት"');
            process.exit(1);
        }
        const [email, fellowshipName] = args;
        yield removeFellowship(email, fellowshipName);
    });
}
main().finally(() => db_config_1.default.$disconnect());
