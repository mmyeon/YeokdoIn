import { ROUTES } from "@/routes";

export const AUTH_FORM_INFO = {
  login: {
    title: "다시 오신 걸 환영합니다",
    buttonText: "로그인",
    help: "계정이 없으신가요?",
    linkText: "회원가입",
    linkUrl: ROUTES.AUTH.SIGNUP,
  },
  signup: {
    title: "계정 만들기",
    buttonText: "회원가입",
    help: "이미 계정이 있으신가요?",
    linkText: "로그인",
    linkUrl: ROUTES.AUTH.LOGIN,
  },
};
