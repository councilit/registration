import express from "express";

import * as DataLookupController from "./controllers/data-lookup.controller";
import * as DataLookupFilter from "./filters/data-lookup.filter";
import { getDataLookupsQueryValidator } from "./validators/get-data-lookups-query.validator";

const router = express.Router();

router
  .route("/")
  .get(
    getDataLookupsQueryValidator,
    DataLookupFilter.getDataLookups,
    DataLookupController.getDataLookups
  );

export default router;
