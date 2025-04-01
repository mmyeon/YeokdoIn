import { z } from "zod";
import { FORM_ERROR_MESSAGES } from "@/shared/form/constants";

export const numericStringSchema = z
  .string()
  .regex(/^\d*$/, "숫자만 입력 가능합니다.");

export const barWeightSchema = z
  .number({
    required_error: FORM_ERROR_MESSAGES.required,
    invalid_type_error: FORM_ERROR_MESSAGES.invalidNumberType,
  })
  .min(1, "바벨 무게는 1kg 이상이어야 합니다.");
