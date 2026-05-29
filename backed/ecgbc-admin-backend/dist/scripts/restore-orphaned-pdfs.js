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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const FILES_DIR = path_1.default.join(__dirname, '../../public/files/file');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fs_1.default.readdirSync(FILES_DIR).filter(f => f.endsWith('.pdf'));
        let restored = 0;
        for (const fileName of files) {
            // Check if file exists in DB
            const dbFile = yield prisma.file.findFirst({ where: { fileName } });
            if (!dbFile) {
                // Try to extract memberId from filename (if convention exists)
                // Example: <memberId>-xxxx.pdf or similar
                const match = fileName.match(/([a-zA-Z0-9]+)-[a-f0-9\-]+\.pdf$/);
                let memberId = match ? match[1] : null;
                // If memberId found, link file to member
                if (memberId) {
                    const member = yield prisma.member.findUnique({ where: { id: memberId } });
                    if (member) {
                        yield prisma.file.create({
                            data: {
                                fileName,
                                file: fileName,
                                memberId: member.id,
                            },
                        });
                        restored++;
                        console.log(`Restored: ${fileName} -> member ${memberId}`);
                    }
                    else {
                        console.log(`Orphan file (no member): ${fileName}`);
                    }
                }
                else {
                    console.log(`Orphan file (no memberId in filename): ${fileName}`);
                }
            }
        }
        console.log(`Restoration complete. ${restored} files re-linked.`);
        yield prisma.$disconnect();
    });
}
main().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
