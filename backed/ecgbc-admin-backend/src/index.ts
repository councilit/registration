import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import consola from "consola";
import path from "path";
import { cleanEnv, port, str } from "envalid";
import "dotenv/config";
// import "reflect-metadata";

import { errorController } from "./app/config/error.config";
import AppError from "./app/shared/errors/app.error";

/*Routes */
import authRouter from "./app/features/auth/auth.route";
import permissionRouter from "./app/features/permission/permission.route";
import roleRouter from "./app/features/role/role.route";
import staffRouter from "./app/features/staff/staff.route";
import dataLookupRouter from "./app/features/data-lookup/data-lookup.route";
import councilFellowshipRouter from "./app/features/council-fellowship/fellowship.route";
import membersRouter from "./app/features/member/member.route";
import reportsRouter from "./app/features/report/report.route";
import filesRouter from "./app/features/file/file.route";

const env = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str(),
});

/**
 * Connect to database
 */

const app = express();

/**
 * Global Middlewares
 */

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

/**
 * REST API Route Middleware
 */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/permission", permissionRouter);
app.use("/api/v1/role", roleRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/data-lookups", dataLookupRouter);
app.use("/api/v1/council-fellowship", councilFellowshipRouter);
app.use("/api/v1/members", membersRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/files", filesRouter);

/**
 * Non existing url middleware
 */

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on the server!!`, 404)
  );
});

/**
 * Error middleware controller
 */
app.use(errorController);

/**
 * Start the server
 */

const PORT = env.PORT;
app.listen(PORT, '0.0.0.0', () => {
  consola.success(`Server running on port ${PORT} and listening on 0.0.0.0`);
});
