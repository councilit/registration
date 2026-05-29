import { body, check } from "express-validator";
import { validate } from "../../../shared/middlewares/validate.middleware";

export const createMemberFileValidator = [
  body("member").isUUID().withMessage("member must be UUID"),
  body("memberFiles").notEmpty().withMessage("File name is required."),
  validate,
];
export const createMemberFilesValidator = [
  body("member").isUUID().withMessage("member must be UUID"),
  body("memberFiles").isArray().withMessage("Files must be an array"),
  validate,
];

export const createFellowshipFileValidator = [
  body("member").isUUID().withMessage("member must be UUID"),
  validate,
];
