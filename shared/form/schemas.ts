import { z } from "zod";

export const numericStringSchema = z
  .string()
  .regex(/^\d*$/, "숫자만 입력 가능합니다.");
