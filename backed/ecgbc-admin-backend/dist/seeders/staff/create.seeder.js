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
exports.seedStaff = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_config_1 = __importDefault(require("../../app/config/db.config"));
const role_type_enum_1 = require("../../app/features/role/enums/role-type.enum");
const data_lookup_enum_1 = require("../../app/features/data-lookup/enums/data-lookup.enum");
const envalid_1 = require("envalid");
const permission_enum_1 = require("../../app/features/permission/enums/permission.enum");
const env = (0, envalid_1.cleanEnv)(process.env, {
    SUPER_ADMIN_EMAIL: (0, envalid_1.email)(),
    SUPER_ADMIN_PASSWORD: (0, envalid_1.str)(),
});
const seedStaff = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = (yield db_config_1.default.dataLookup.findUnique({
        where: { value: data_lookup_enum_1.CommonObjectState.ACTIVE }
    }));
    const owner = (yield db_config_1.default.role.findFirst({
        where: { type: {
                value: role_type_enum_1.RoleType.OWNER
            } }
    }));
    const password = yield bcryptjs_1.default.hash(env.SUPER_ADMIN_PASSWORD, 10);
    const superAdmin = yield db_config_1.default.staff.upsert({
        where: { email: env.SUPER_ADMIN_EMAIL },
        update: {
            firstName: 'Super',
            lastName: 'Admin',
            fullName: 'Super Admin',
            password: password,
            phoneNumber: '+251917808664',
            roleId: owner.id,
            stateId: state.id
        },
        create: {
            email: env.SUPER_ADMIN_EMAIL,
            firstName: 'Super',
            lastName: 'Admin',
            fullName: 'Super Admin',
            password: password,
            phoneNumber: '+251917808664',
            roleId: owner.id,
            stateId: state.id
        }
    });
    // Ensure scoped staff with ADMIN role exists where needed (Ephrem) and seed permissions
    const adminRole = yield db_config_1.default.role.findFirst({
        where: { type: { value: role_type_enum_1.RoleType.ADMIN } },
    });
    if (adminRole) {
        // Ensure ADMIN has CRUD for members/reports/files
        const adminWithPerms = yield db_config_1.default.role.findUnique({
            where: { id: adminRole.id },
            include: { permissions: true },
        });
        const neededCodes = [
            permission_enum_1.MemberPermission.MEMBER_VIEW,
            permission_enum_1.MemberPermission.MEMBER_ADD,
            permission_enum_1.MemberPermission.MEMBER_CHANGE,
            permission_enum_1.MemberPermission.MEMBER_DELETE,
            permission_enum_1.MemberPermission.MEMBER_DEACTIVATE,
            permission_enum_1.ReportPermission.REPORT_VIEW,
            permission_enum_1.ReportPermission.REPORT_ADD,
            permission_enum_1.ReportPermission.REPORT_CHANGE,
            permission_enum_1.ReportPermission.REPORT_DELETE,
            permission_enum_1.FilePermission.FILE_VIEW,
            permission_enum_1.FilePermission.FILE_ADD,
            permission_enum_1.FilePermission.FILE_CHANGE,
            permission_enum_1.FilePermission.FILE_DELETE,
        ];
        const existingCodes = new Set(((adminWithPerms === null || adminWithPerms === void 0 ? void 0 : adminWithPerms.permissions) || []).map(p => p.codeName));
        const missingCodes = neededCodes.filter(c => !existingCodes.has(c));
        if (missingCodes.length) {
            const missingPerms = yield db_config_1.default.permission.findMany({ where: { codeName: { in: missingCodes } } });
            if (missingPerms.length) {
                yield db_config_1.default.role.update({
                    where: { id: adminRole.id },
                    data: { permissions: { connect: missingPerms.map(p => ({ id: p.id })) } },
                });
            }
        }
        // Ensure scoped staff (Ephrem) exists with ADMIN role and ACTIVE state
        const ephremPlain = process.env.EPHREM_PASSWORD || "@Ephi#Ende!391#";
        const ephremHashed = yield bcryptjs_1.default.hash(ephremPlain, 10);
        const ephrem = yield db_config_1.default.staff.upsert({
            where: { email: "ephibillioner@gmail.com" },
            update: {
                firstName: "Ephrem",
                lastName: "(Scoped)",
                fullName: "Ephrem",
                password: ephremHashed,
                phoneNumber: "+251900000001",
                roleId: adminRole.id,
                stateId: state.id,
            },
            create: {
                email: "ephibillioner@gmail.com",
                firstName: "Ephrem",
                lastName: "(Scoped)",
                fullName: "Ephrem",
                password: ephremHashed,
                phoneNumber: "+251900000001",
                roleId: adminRole.id,
                stateId: state.id,
            },
            include: { role: true },
        });
        // Link Ephrem to the two allowed fellowships (by certificate number)
        const targetCertificates = ["1111"]; // 2) የኢትዮጵያ ...
        const fellowships = yield db_config_1.default.councilFellowship.findMany({
            where: { certificateNo: { in: targetCertificates } },
            select: { id: true, certificateNo: true },
        });
        for (const f of fellowships) {
            // unique constraint on (staffId, fellowshipId)
            yield db_config_1.default.staffFellowship.upsert({
                where: {
                    staffId_fellowshipId: {
                        staffId: ephrem.id,
                        fellowshipId: f.id,
                    },
                },
                update: {},
                create: {
                    staffId: ephrem.id,
                    fellowshipId: f.id,
                },
            });
        }
    }
    // Ensure a restricted Staff role exists and create scoped Staff users (Abinet, Chaltu, Mercy, Gezu)
    const customType = yield db_config_1.default.dataLookup.findUnique({ where: { value: role_type_enum_1.RoleType.CUSTOM } });
    if (customType) {
        // Upsert role named "Staff"
        let staffRole = yield db_config_1.default.role.findFirst({ where: { name: "Staff" } });
        if (!staffRole) {
            staffRole = yield db_config_1.default.role.create({
                data: {
                    name: "Staff",
                    description: "Restricted Staff",
                    typeId: customType.id,
                    stateId: state.id,
                },
            });
        }
        // Ensure Staff role has only the needed permissions
        const staffNeededPerms = [
            permission_enum_1.MemberPermission.MEMBER_VIEW,
            permission_enum_1.MemberPermission.MEMBER_ADD,
            permission_enum_1.MemberPermission.MEMBER_CHANGE,
            // Intentionally exclude MEMBER_DEACTIVATE, MEMBER_DELETE
        ];
        const staffPerms = yield db_config_1.default.permission.findMany({ where: { codeName: { in: staffNeededPerms } } });
        // Connect any missing perms
        if (staffPerms.length) {
            const existing = yield db_config_1.default.role.findUnique({ where: { id: staffRole.id }, include: { permissions: true } });
            const existingCodes = new Set(((existing === null || existing === void 0 ? void 0 : existing.permissions) || []).map(p => p.codeName));
            const toConnect = staffPerms.filter(p => !existingCodes.has(p.codeName)).map(p => ({ id: p.id }));
            if (toConnect.length) {
                yield db_config_1.default.role.update({ where: { id: staffRole.id }, data: { permissions: { connect: toConnect } } });
            }
            // Disconnect any extra permissions accidentally attached (hardening)
            const toKeep = new Set(staffNeededPerms);
            const toDisconnect = ((existing === null || existing === void 0 ? void 0 : existing.permissions) || [])
                .filter(p => !toKeep.has(p.codeName))
                .map(p => ({ id: p.id }));
            if (toDisconnect.length) {
                yield db_config_1.default.role.update({ where: { id: staffRole.id }, data: { permissions: { disconnect: toDisconnect } } });
            }
        }
        // Helper normalization for robust Amharic matching
        const normalizeCanonical = (s) => s
            .normalize("NFKC")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/[ \t\r\n\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        const stripAllSpaces = (s) => normalizeCanonical(s).replace(/\s+/g, "");
        // 2) Upsert Abinet Abate with Staff role
        const abinetEmail = "abateabinet94@gmail.com";
        const abinetPlain = "@Abate@AB!861#"; // provided default
        const abinetHashed = yield bcryptjs_1.default.hash(abinetPlain, 10);
        const abinet = yield db_config_1.default.staff.upsert({
            where: { email: abinetEmail },
            update: {
                firstName: "Abinet",
                lastName: "Abate",
                fullName: "Abinet Abate",
                password: abinetHashed,
                phoneNumber: "+251900000002",
                roleId: staffRole.id,
                stateId: state.id,
            },
            create: {
                email: abinetEmail,
                firstName: "Abinet",
                lastName: "Abate",
                fullName: "Abinet Abate",
                password: abinetHashed,
                phoneNumber: "+251900000002",
                roleId: staffRole.id,
                stateId: state.id,
            },
            include: { role: true },
        });
        // 3) Link Abinet to exactly the specified council fellowships
        // Supports linking by certificate numbers (env ABINET_FELLOWSHIP_CERTS=comma-separated)
        // or by names (env ABINET_FELLOWSHIP_NAMES=comma-separated exact names in Amharic)
        const certList = (process.env.ABINET_FELLOWSHIP_CERTS || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        const nameList = (process.env.ABINET_FELLOWSHIP_NAMES || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        let abinetFellowships = [];
        if (certList.length > 0) {
            abinetFellowships = yield db_config_1.default.councilFellowship.findMany({
                where: { certificateNo: { in: certList } },
                select: { id: true, name: true },
            });
        }
        else if (nameList.length > 0) {
            // Robust match by strong normalization and a secondary no-space comparison
            const targets = nameList.map(n => ({ raw: n, norm: normalizeCanonical(n), nos: stripAllSpaces(n) }));
            const allFellowships = yield db_config_1.default.councilFellowship.findMany({ select: { id: true, name: true } });
            const byNorm = new Map();
            const byNoSpace = new Map();
            for (const f of allFellowships) {
                const n = normalizeCanonical(f.name);
                const ns = stripAllSpaces(f.name);
                byNorm.set(n, [...(byNorm.get(n) || []), f]);
                byNoSpace.set(ns, [...(byNoSpace.get(ns) || []), f]);
            }
            const matched = [];
            const missing = [];
            for (const t of targets) {
                let candidates = byNorm.get(t.norm) || [];
                if (candidates.length === 1) {
                    matched.push(candidates[0]);
                    continue;
                }
                // Fallback to nospace match if exact-normalized isn't unique
                candidates = byNoSpace.get(t.nos) || [];
                if (candidates.length === 1) {
                    matched.push(candidates[0]);
                    continue;
                }
                // If still ambiguous or empty, mark missing for visibility
                missing.push(t.raw);
            }
            if (missing.length) {
                console.warn("[Seeder] Abinet missing fellowships (by name):", missing);
            }
            if (matched.length) {
                console.log("[Seeder] Abinet matched fellowships:", matched.map(m => m.name));
            }
            abinetFellowships = matched.map(f => ({ id: f.id, name: f.name }));
        }
        // If both envs are empty, skip linking (will be handled after names are provided)
        for (const f of abinetFellowships) {
            yield db_config_1.default.staffFellowship.upsert({
                where: { staffId_fellowshipId: { staffId: abinet.id, fellowshipId: f.id } },
                update: {},
                create: { staffId: abinet.id, fellowshipId: f.id },
            });
        }
        // Optionally, remove any previous links not in the target set (enforce exact five once provided)
        if (abinetFellowships.length > 0) {
            const keepIds = new Set(abinetFellowships.map(f => f.id));
            const existingLinks = yield db_config_1.default.staffFellowship.findMany({
                where: { staffId: abinet.id },
                select: { fellowshipId: true },
            });
            const toRemove = existingLinks.filter(l => !keepIds.has(l.fellowshipId));
            if (toRemove.length) {
                yield db_config_1.default.staffFellowship.deleteMany({
                    where: { staffId: abinet.id, fellowshipId: { in: toRemove.map(x => x.fellowshipId) } },
                });
            }
        }
        // 4) Upsert Chaltu (restricted Staff) and link to the specified fellowships by name
        const chaltuEmail = "kiyagudina07@gmail.com";
        const chaltuPlain = "chaltugudina@1234";
        const chaltuHashed = yield bcryptjs_1.default.hash(chaltuPlain, 10);
        const chaltu = yield db_config_1.default.staff.upsert({
            where: { email: chaltuEmail },
            update: {
                firstName: "Chaltu",
                lastName: "",
                fullName: "Chaltu",
                password: chaltuHashed,
                phoneNumber: "+251900000003",
                roleId: staffRole.id,
                stateId: state.id,
            },
            create: {
                email: chaltuEmail,
                firstName: "Chaltu",
                lastName: "",
                fullName: "Chaltu",
                password: chaltuHashed,
                phoneNumber: "+251900000003",
                roleId: staffRole.id,
                stateId: state.id,
            },
        });
        const chaltuFellowshipNames = [
            "የኢትዮጵያ ቪዥነሪ አብያተ ክርስቲያናት ሕብረት",
            "ርኆቦት አብያተ ክርስቲያት  ሕብረት",
            "የኢትዮጵያ ፔንቴኮስታል አብያተ ክርስቲያናት ሕብረት",
            "ሰላም ባለራዕዮች አብያተ ክርስቲያት ሕብረት",
            "የኢትዮጵያ የወንጌል ባለአደራዎች አብያተ ክርስቲያናት ሕብረት",
        ];
        // Robust name matching with unicode normalization and a secondary no-space comparison
        const chNormTargets = chaltuFellowshipNames.map(n => ({ raw: n, norm: normalizeCanonical(n), nos: stripAllSpaces(n) }));
        const allFellowshipsForChaltu = yield db_config_1.default.councilFellowship.findMany({ select: { id: true, name: true } });
        const byNormC = new Map();
        const byNoSpaceC = new Map();
        for (const f of allFellowshipsForChaltu) {
            const n = normalizeCanonical(f.name);
            const ns = stripAllSpaces(f.name);
            byNormC.set(n, [...(byNormC.get(n) || []), f]);
            byNoSpaceC.set(ns, [...(byNoSpaceC.get(ns) || []), f]);
        }
        const chaltuMatches = [];
        const chMissing = [];
        for (const t of chNormTargets) {
            let candidates = byNormC.get(t.norm) || [];
            if (candidates.length === 1) {
                chaltuMatches.push(candidates[0]);
                continue;
            }
            candidates = byNoSpaceC.get(t.nos) || [];
            if (candidates.length === 1) {
                chaltuMatches.push(candidates[0]);
                continue;
            }
            chMissing.push(t.raw);
        }
        console.log("[Seeder] Chaltu matched fellowships:", chaltuMatches.map(f => f.name));
        if (chMissing.length) {
            console.warn("[Seeder] Chaltu missing fellowships:", chMissing);
        }
        // Allow explicit certificateNo overrides via env CHALTU_FELLOWSHIP_CERTS (comma-separated)
        const chaltuCertList = (process.env.CHALTU_FELLOWSHIP_CERTS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        let chaltuByCert = [];
        if (chaltuCertList.length) {
            const fetched = yield db_config_1.default.councilFellowship.findMany({
                where: { certificateNo: { in: chaltuCertList } },
                select: { id: true, name: true },
            });
            chaltuByCert = fetched;
            if (fetched.length) {
                console.log("[Seeder] Chaltu matched by certificateNo:", fetched.map((f) => f.name));
            }
            else {
                console.warn("[Seeder] Chaltu certificateNo values not found:", chaltuCertList);
            }
        }
        // Union matches (name-based + cert-based) and dedupe by id
        const chaltuAllMatchesMap = new Map();
        for (const f of [...chaltuMatches, ...chaltuByCert])
            chaltuAllMatchesMap.set(f.id, f);
        const chaltuAllMatches = Array.from(chaltuAllMatchesMap.values());
        for (const f of chaltuAllMatches) {
            yield db_config_1.default.staffFellowship.upsert({
                where: { staffId_fellowshipId: { staffId: chaltu.id, fellowshipId: f.id } },
                update: {},
                create: { staffId: chaltu.id, fellowshipId: f.id },
            });
        }
        if (chaltuAllMatches.length > 0) {
            const keepIds = new Set(chaltuAllMatches.map(f => f.id));
            const existingLinks = yield db_config_1.default.staffFellowship.findMany({
                where: { staffId: chaltu.id },
                select: { fellowshipId: true },
            });
            const toRemove = existingLinks.filter(l => !keepIds.has(l.fellowshipId));
            if (toRemove.length) {
                yield db_config_1.default.staffFellowship.deleteMany({
                    where: { staffId: chaltu.id, fellowshipId: { in: toRemove.map(x => x.fellowshipId) } },
                });
            }
        }
        // 5) Upsert Mercy (restricted Staff) and link to the specified council fellowship(s)
        const mercyEmail = "mehirit2067@gmail.com";
        const mercyPlain = process.env.MERCY_PASSWORD || "Mehirit!#123@";
        const mercyHashed = yield bcryptjs_1.default.hash(mercyPlain, 10);
        const mercy = yield db_config_1.default.staff.upsert({
            where: { email: mercyEmail },
            update: {
                firstName: "Mercy",
                lastName: "",
                fullName: "Mercy",
                password: mercyHashed,
                phoneNumber: "+251900000004",
                roleId: staffRole.id,
                stateId: state.id,
            },
            create: {
                email: mercyEmail,
                firstName: "Mercy",
                lastName: "",
                fullName: "Mercy",
                password: mercyHashed,
                phoneNumber: "+251900000004",
                roleId: staffRole.id,
                stateId: state.id,
            },
        });
        // Mercy: prefer explicit certificate override, else robust name matching (handles both variants)
        const mercyCerts = (process.env.MERCY_FELLOWSHIP_CERTS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        let mercyMatches = [];
        if (mercyCerts.length) {
            const fetched = yield db_config_1.default.councilFellowship.findMany({
                where: { certificateNo: { in: mercyCerts } },
                select: { id: true, name: true },
            });
            mercyMatches.push(...fetched);
        }
        else {
            const mercyNames = [
                "አዲስ ቤተ-እመነት", // variant 1
                "አዲስ ቤተ-እምነት", // variant 2
            ];
            const mercyTargets = mercyNames.map((n) => ({ raw: n, norm: normalizeCanonical(n), nos: stripAllSpaces(n) }));
            const allFellowshipsForMercy = yield db_config_1.default.councilFellowship.findMany({ select: { id: true, name: true } });
            const byNormM = new Map();
            const byNoSpaceM = new Map();
            for (const f of allFellowshipsForMercy) {
                const n = normalizeCanonical(f.name);
                const ns = stripAllSpaces(f.name);
                byNormM.set(n, [...(byNormM.get(n) || []), f]);
                byNoSpaceM.set(ns, [...(byNoSpaceM.get(ns) || []), f]);
            }
            for (const t of mercyTargets) {
                let candidates = byNormM.get(t.norm) || [];
                if (candidates.length === 1) {
                    mercyMatches.push(candidates[0]);
                    continue;
                }
                candidates = byNoSpaceM.get(t.nos) || [];
                if (candidates.length === 1) {
                    mercyMatches.push(candidates[0]);
                    continue;
                }
            }
        }
        for (const f of mercyMatches) {
            yield db_config_1.default.staffFellowship.upsert({
                where: { staffId_fellowshipId: { staffId: mercy.id, fellowshipId: f.id } },
                update: {},
                create: { staffId: mercy.id, fellowshipId: f.id },
            });
        }
        // Remove any stale links not in the target set (enforce exact scope)
        if (mercyMatches.length > 0) {
            const keepIds = new Set(mercyMatches.map((f) => f.id));
            const existingLinks = yield db_config_1.default.staffFellowship.findMany({
                where: { staffId: mercy.id },
                select: { fellowshipId: true },
            });
            const toRemove = existingLinks.filter((l) => !keepIds.has(l.fellowshipId));
            if (toRemove.length) {
                yield db_config_1.default.staffFellowship.deleteMany({
                    where: { staffId: mercy.id, fellowshipId: { in: toRemove.map((x) => x.fellowshipId) } },
                });
            }
        }
        // 6) Upsert Gezu as restricted Staff and scope to the two specified fellowships
        const gezuEmail = "gezuabiy@gmail.com";
        const gezuPlain = process.env.GEZU_PASSWORD || "@Gezu#Abi!841#";
        const gezuHashed = yield bcryptjs_1.default.hash(gezuPlain, 10);
        const gezu = yield db_config_1.default.staff.upsert({
            where: { email: gezuEmail },
            update: {
                firstName: "Gezu",
                lastName: "Abiy",
                fullName: "Gezu Abiy",
                password: gezuHashed,
                phoneNumber: "+251900000000",
                roleId: staffRole.id,
                stateId: state.id,
            },
            create: {
                email: gezuEmail,
                firstName: "Gezu",
                lastName: "Abiy",
                fullName: "Gezu Abiy",
                password: gezuHashed,
                phoneNumber: "+251900000000",
                roleId: staffRole.id,
                stateId: state.id,
            },
        });
        const gezuFellowshipNames = [
            "የኢትዮጵያ ወንጌል አማኞች አብያተ ክርስቲያናት የተመዘገቡ አዲስ ሚኒስትሪዎች",
            "ነባር ሚኒስትሪዎች",
        ];
        const gezuTargets = gezuFellowshipNames.map(n => ({ raw: n, norm: normalizeCanonical(n), nos: stripAllSpaces(n) }));
        const allFellowshipsForGezu = yield db_config_1.default.councilFellowship.findMany({ select: { id: true, name: true } });
        const byNormG = new Map();
        const byNoSpaceG = new Map();
        for (const f of allFellowshipsForGezu) {
            const n = normalizeCanonical(f.name);
            const ns = stripAllSpaces(f.name);
            byNormG.set(n, [...(byNormG.get(n) || []), f]);
            byNoSpaceG.set(ns, [...(byNoSpaceG.get(ns) || []), f]);
        }
        const gezuMatches = [];
        const gezuMissing = [];
        for (const t of gezuTargets) {
            let candidates = byNormG.get(t.norm) || [];
            if (candidates.length === 1) {
                gezuMatches.push(candidates[0]);
                continue;
            }
            candidates = byNoSpaceG.get(t.nos) || [];
            if (candidates.length === 1) {
                gezuMatches.push(candidates[0]);
                continue;
            }
            gezuMissing.push(t.raw);
        }
        if (gezuMissing.length) {
            console.warn("[Seeder] Gezu missing fellowships:", gezuMissing);
        }
        for (const f of gezuMatches) {
            yield db_config_1.default.staffFellowship.upsert({
                where: { staffId_fellowshipId: { staffId: gezu.id, fellowshipId: f.id } },
                update: {},
                create: { staffId: gezu.id, fellowshipId: f.id },
            });
        }
        // Remove any stale links not in the target set (enforce exact scope)
        if (gezuMatches.length > 0) {
            const keepIds = new Set(gezuMatches.map(f => f.id));
            const existingLinks = yield db_config_1.default.staffFellowship.findMany({
                where: { staffId: gezu.id },
                select: { fellowshipId: true },
            });
            const toRemove = existingLinks.filter(l => !keepIds.has(l.fellowshipId));
            if (toRemove.length) {
                yield db_config_1.default.staffFellowship.deleteMany({
                    where: { staffId: gezu.id, fellowshipId: { in: toRemove.map(x => x.fellowshipId) } },
                });
            }
        }
        // 7) Upsert Saron Fekadu as restricted Staff
        const saronEmail = "saronbegna@gmail.com";
        const saronPlain = process.env.SARON_PASSWORD || "Saron!#123@";
        const saronHashed = yield bcryptjs_1.default.hash(saronPlain, 10);
        const saron = yield db_config_1.default.staff.upsert({
            where: { email: saronEmail },
            update: {
                firstName: "Saron",
                lastName: "Fekadu",
                fullName: "Saron Fekadu",
                password: saronHashed,
                phoneNumber: "+251900000005",
                roleId: staffRole.id,
                stateId: state.id,
            },
            create: {
                email: saronEmail,
                firstName: "Saron",
                lastName: "Fekadu",
                fullName: "Saron Fekadu",
                password: saronHashed,
                phoneNumber: "+251900000005",
                roleId: staffRole.id,
                stateId: state.id,
            },
        });
        const saronFellowshipNames = [
            "አዲስ ቤተ-እምነት",
            "የውጭ አገራት ሚኒስትሪዎች እና ቤተ እምነቶች",
        ];
        const saronTargets = saronFellowshipNames.map(n => ({ raw: n, norm: normalizeCanonical(n), nos: stripAllSpaces(n) }));
        const allFellowshipsForSaron = yield db_config_1.default.councilFellowship.findMany({ select: { id: true, name: true } });
        const byNormS = new Map();
        const byNoSpaceS = new Map();
        for (const f of allFellowshipsForSaron) {
            const n = normalizeCanonical(f.name);
            const ns = stripAllSpaces(f.name);
            byNormS.set(n, [...(byNormS.get(n) || []), f]);
            byNoSpaceS.set(ns, [...(byNoSpaceS.get(ns) || []), f]);
        }
        const saronMatches = [];
        const saronMissing = [];
        for (const t of saronTargets) {
            let candidates = byNormS.get(t.norm) || [];
            if (candidates.length === 1) {
                saronMatches.push(candidates[0]);
                continue;
            }
            candidates = byNoSpaceS.get(t.nos) || [];
            if (candidates.length === 1) {
                saronMatches.push(candidates[0]);
                continue;
            }
            saronMissing.push(t.raw);
        }
        if (saronMissing.length) {
            console.warn("[Seeder] Saron missing fellowships:", saronMissing);
        }
        for (const f of saronMatches) {
            yield db_config_1.default.staffFellowship.upsert({
                where: { staffId_fellowshipId: { staffId: saron.id, fellowshipId: f.id } },
                update: {},
                create: { staffId: saron.id, fellowshipId: f.id },
            });
        }
        if (saronMatches.length > 0) {
            const keepIds = new Set(saronMatches.map(f => f.id));
            const existingLinks = yield db_config_1.default.staffFellowship.findMany({
                where: { staffId: saron.id },
                select: { fellowshipId: true },
            });
            const toRemove = existingLinks.filter(l => !keepIds.has(l.fellowshipId));
            if (toRemove.length) {
                yield db_config_1.default.staffFellowship.deleteMany({
                    where: { staffId: saron.id, fellowshipId: { in: toRemove.map(x => x.fellowshipId) } },
                });
            }
        }
    }
});
exports.seedStaff = seedStaff;
