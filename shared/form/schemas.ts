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

export const emailSchema = z
  .string()
  .email("올바른 이메일 형식을 입력해주세요.");

export const passwordSchema = z
  .string()
  .regex(/[A-Za-z]/, "최소 하나의 문자가 포함되어야 합니다.")
  .regex(/\d/, "최소 하나의 숫자가 포함되어야 합니다.")
  .regex(
    /[@$!%*?&]/,
    "최소 하나의 특수문자(@, $, !, %, *, ?, &)가 포함되어야 합니다.",
  )
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.");
