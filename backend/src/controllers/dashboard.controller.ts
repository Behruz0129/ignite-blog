/**
 * DASHBOARD CONTROLLER
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await dashboardService.getStats();
    return ok(res, stats);
  }),
};
