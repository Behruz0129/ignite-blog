/**
 * apiResponse
 * -----------
 * Barcha javoblar bir xil ko'rinishda bo'lishi uchun yordamchilar.
 * Frontend doimo {success, data, ...} formatini kutadi.
 */

import { Response } from "express";

export function ok(res: Response, data: unknown, message = "OK") {
  return res.status(200).json({ success: true, message, data });
}

export function created(res: Response, data: unknown, message = "Yaratildi") {
  return res.status(201).json({ success: true, message, data });
}

export function paginated(
  res: Response,
  data: unknown,
  meta: unknown,
  message = "OK"
) {
  return res.status(200).json({ success: true, message, data, meta });
}
