import { NotationParseError } from './errors';

export type TokenType =
  | 'NUMBER'
  | 'PERCENT'
  | 'AMP'
  | 'COMMA'
  | 'LPAREN'
  | 'RPAREN'
  | 'PLUS'
  | 'IDENT'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

const IDENT_START = /[A-Za-z\uAC00-\uD7A3]/;
// TODO(phase1B): tighten to disallow trailing/consecutive dots (e.g., "abc.", "abc..def")
//                once movement_aliases canonicalization rejects unknown names.
const IDENT_CONT = /[A-Za-z\uAC00-\uD7A3.]/;
const DIGIT = /[0-9]/;

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    switch (ch) {
      case '%':
        tokens.push({ type: 'PERCENT', value: '%', position: i });
        i++;
        continue;
      case '&':
        tokens.push({ type: 'AMP', value: '&', position: i });
        i++;
        continue;
      case ',':
        tokens.push({ type: 'COMMA', value: ',', position: i });
        i++;
        continue;
      case '(':
        tokens.push({ type: 'LPAREN', value: '(', position: i });
        i++;
        continue;
      case ')':
        tokens.push({ type: 'RPAREN', value: ')', position: i });
        i++;
        continue;
      case '+':
        tokens.push({ type: 'PLUS', value: '+', position: i });
        i++;
        continue;
    }
    if (DIGIT.test(ch)) {
      const start = i;
      while (i < input.length && DIGIT.test(input[i])) i++;
      if (input[i] === '.' && i + 1 < input.length && DIGIT.test(input[i + 1])) {
        i++;
        while (i < input.length && DIGIT.test(input[i])) i++;
      }
      tokens.push({ type: 'NUMBER', value: input.slice(start, i), position: start });
      continue;
    }
    if (IDENT_START.test(ch)) {
      const start = i;
      while (i < input.length && IDENT_CONT.test(input[i])) i++;
      tokens.push({ type: 'IDENT', value: input.slice(start, i), position: start });
      continue;
    }
    throw new NotationParseError(`Unexpected character '${ch}'`, i);
  }
  tokens.push({ type: 'EOF', value: '', position: input.length });
  return tokens;
}
