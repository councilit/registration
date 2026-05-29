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
// Minimal enum mirrors for values stored in DataLookup.value
const MemberType = {
    MINISTRY: 'MINISTRY',
    CHURCH: 'CHURCH',
};
const emailsToCheck = [
    'gezuabiy@gmail.com',
    'ephibillioner@gmail.com',
    'abateabinet94@gmail.com',
    'kiyagudina07@gmail.com',
    'mehirit2067@gmail.com',
    process.env.SUPER_ADMIN_EMAIL || 'admin@example.com',
];
function getWeekRange() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun..6=Sat
    const diffToMonday = (day + 6) % 7; // days since Monday
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startOfWeek: start, endOfWeek: end };
}
function getAllowedFellowshipIds(staffId) {
    return __awaiter(this, void 0, void 0, function* () {
        const links = yield db_config_1.default.staffFellowship.findMany({
            where: { staffId },
            select: { fellowshipId: true },
        });
        return links.map((l) => l.fellowshipId);
    });
}
function hasPermission(perms, code) {
    return perms.some((p) => p.codeName === code);
}
function runFor(email) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const staff = yield db_config_1.default.staff.findUnique({
            where: { email },
            include: {
                role: { include: { type: true, permissions: true } },
            },
        });
        if (!staff) {
            console.log(`-- ${email}: staff not found`);
            return;
        }
        const isOwner = ((_b = (_a = staff.role) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.value) === 'OWNER';
        const allowedFellowshipIds = isOwner ? [] : yield getAllowedFellowshipIds(staff.id);
        const emailLc = (staff.email || '').toLowerCase();
        // Mirror middleware: Ephrem's MEMBER_DEACTIVATE is stripped at request-time
        let permCodes = (((_c = staff.role) === null || _c === void 0 ? void 0 : _c.permissions) || []).map((p) => p.codeName);
        if (emailLc === 'ephibillioner@gmail.com') {
            permCodes = permCodes.filter((c) => c !== 'MEMBER_DEACTIVATE');
        }
        const canDeactivate = permCodes.includes('deactivate_member');
        const activeOnly = !canDeactivate; // matches middleware behavior
        console.log(`DEBUG ${email}: permCodes =`, permCodes);
        console.log(`DEBUG ${email}: canDeactivate =`, canDeactivate);
        // Special staff allowed type values (mirrors middleware intent)
        const allowedTypeValues = isOwner
            ? [MemberType.MINISTRY, MemberType.CHURCH]
            : ['gezuabiy@gmail.com', 'ephibillioner@gmail.com', 'abateabinet94@gmail.com', 'kiyagudina07@gmail.com', 'mehirit2067@gmail.com'].includes(emailLc)
                ? [MemberType.MINISTRY, MemberType.CHURCH]
                : undefined;
        const canSeeChurches = isOwner || !allowedTypeValues || allowedTypeValues.includes(MemberType.CHURCH);
        const { startOfWeek, endOfWeek } = getWeekRange();
        // Council fellowships
        const [totalCouncilFellowships, weeklyCouncilFellowships] = yield Promise.all([
            isOwner
                ? db_config_1.default.councilFellowship.count({})
                : (allowedFellowshipIds.length
                    ? db_config_1.default.councilFellowship.count({ where: { id: { in: allowedFellowshipIds } } })
                    : Promise.resolve(0)),
            isOwner
                ? db_config_1.default.councilFellowship.count({
                    where: { createdAt: { gte: startOfWeek, lte: endOfWeek } },
                })
                : (allowedFellowshipIds.length
                    ? db_config_1.default.councilFellowship.count({
                        where: { id: { in: allowedFellowshipIds }, createdAt: { gte: startOfWeek, lte: endOfWeek } },
                    })
                    : Promise.resolve(0)),
        ]);
        // Ministries
        const ministryWhere = isOwner
            ? { type: { value: MemberType.MINISTRY } }
            : (allowedFellowshipIds.length ? { type: { value: MemberType.MINISTRY }, councilFellowshipId: { in: allowedFellowshipIds } } : { id: { in: [] } });
        if (activeOnly)
            ministryWhere.isActive = true;
        const [totalMinistries, weeklyMinistries] = yield Promise.all([
            db_config_1.default.member.count({ where: ministryWhere }),
            db_config_1.default.member.count({ where: Object.assign(Object.assign({}, ministryWhere), { createdAt: { gte: startOfWeek, lte: endOfWeek } }) }),
        ]);
        // Churches
        let totalChurches = 0, weeklyChurches = 0;
        if (canSeeChurches) {
            const churchWhere = isOwner
                ? { type: { value: MemberType.CHURCH } }
                : (allowedFellowshipIds.length ? { type: { value: MemberType.CHURCH }, councilFellowshipId: { in: allowedFellowshipIds } } : { id: { in: [] } });
            if (activeOnly)
                churchWhere.isActive = true;
            [totalChurches, weeklyChurches] = yield Promise.all([
                db_config_1.default.member.count({ where: churchWhere }),
                db_config_1.default.member.count({ where: Object.assign(Object.assign({}, churchWhere), { createdAt: { gte: startOfWeek, lte: endOfWeek } }) }),
            ]);
        }
        // Inactive counts (only meaningful if canDeactivate)
        let inactiveCount = 0;
        if (canDeactivate) {
            const inactiveWhere = isOwner ? { isActive: false } : { isActive: false, councilFellowshipId: { in: allowedFellowshipIds } };
            inactiveCount = yield db_config_1.default.member.count({ where: inactiveWhere });
        }
        // Load fellowships list for visibility
        const fellowships = isOwner
            ? []
            : (allowedFellowshipIds.length
                ? yield db_config_1.default.councilFellowship.findMany({ where: { id: { in: allowedFellowshipIds } }, select: { id: true, name: true, certificateNo: true }, orderBy: { name: 'asc' } })
                : []);
        console.log('============================================================');
        console.log(`Staff: ${staff.fullName} <${staff.email}> | RoleType=${(_e = (_d = staff.role) === null || _d === void 0 ? void 0 : _d.type) === null || _e === void 0 ? void 0 : _e.value} | Active-only=${activeOnly} | CanDeactivate=${canDeactivate}`);
        if (!isOwner) {
            console.log(`Linked fellowships (${fellowships.length}):`);
            for (const f of fellowships)
                console.log(`- ${f.certificateNo} ${f.name}`);
        }
        else {
            console.log('Owner: full access');
        }
        console.log('Dashboard-like stats within scope:');
        console.log(`- Council Fellowships: total=${totalCouncilFellowships} weekly=${weeklyCouncilFellowships}`);
        console.log(`- Ministries: total=${totalMinistries} weekly=${weeklyMinistries}`);
        console.log(`- Churches: ${canSeeChurches ? `total=${totalChurches} weekly=${weeklyChurches}` : 'HIDDEN (no permission)'}`);
        if (canDeactivate)
            console.log(`- Inactive Members (all types): ${inactiveCount}`);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const email of emailsToCheck) {
            try {
                yield runFor(email);
            }
            catch (e) {
                console.error(`Error while processing ${email}:`, e);
            }
            console.log('');
        }
    });
}
main().finally(() => db_config_1.default.$disconnect());
