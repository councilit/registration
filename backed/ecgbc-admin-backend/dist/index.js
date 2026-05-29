"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const consola_1 = __importDefault(require("consola"));
const path_1 = __importDefault(require("path"));
const envalid_1 = require("envalid");
require("dotenv/config");
// import "reflect-metadata";
const error_config_1 = require("./app/config/error.config");
const app_error_1 = __importDefault(require("./app/shared/errors/app.error"));
/*Routes */
const auth_route_1 = __importDefault(require("./app/features/auth/auth.route"));
const permission_route_1 = __importDefault(require("./app/features/permission/permission.route"));
const role_route_1 = __importDefault(require("./app/features/role/role.route"));
const staff_route_1 = __importDefault(require("./app/features/staff/staff.route"));
const data_lookup_route_1 = __importDefault(require("./app/features/data-lookup/data-lookup.route"));
const fellowship_route_1 = __importDefault(require("./app/features/council-fellowship/fellowship.route"));
const member_route_1 = __importDefault(require("./app/features/member/member.route"));
const report_route_1 = __importDefault(require("./app/features/report/report.route"));
const file_route_1 = __importDefault(require("./app/features/file/file.route"));
const env = (0, envalid_1.cleanEnv)(process.env, {
    PORT: (0, envalid_1.port)(),
    NODE_ENV: (0, envalid_1.str)(),
});
/**
 * Connect to database
 */
const app = (0, express_1.default)();
/**
 * Global Middlewares
 */
if (env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
/**
 * REST API Route Middleware
 */
app.use("/api/v1/auth", auth_route_1.default);
app.use("/api/v1/permission", permission_route_1.default);
app.use("/api/v1/role", role_route_1.default);
app.use("/api/v1/staff", staff_route_1.default);
app.use("/api/v1/data-lookups", data_lookup_route_1.default);
app.use("/api/v1/council-fellowship", fellowship_route_1.default);
app.use("/api/v1/members", member_route_1.default);
app.use("/api/v1/reports", report_route_1.default);
app.use("/api/v1/files", file_route_1.default);
/**
 * Non existing url middleware
 */
app.use("*", (req, res, next) => {
    return next(new app_error_1.default(`Can't find ${req.originalUrl} on the server!!`, 404));
});
/**
 * Error middleware controller
 */
app.use(error_config_1.errorController);
/**
 * Start the server
 */
const PORT = env.PORT;
app.listen(PORT, '0.0.0.0', () => {
    consola_1.default.success(`Server running on port ${PORT} and listening on 0.0.0.0`);
});
