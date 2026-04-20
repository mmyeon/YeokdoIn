// Grammar:
//   program    := block ("," block)*
//   block      := movement ("&" movement)* percentage? reps sets modifier*
//   movement   := (IDENT | "(" text ")")+
//   percentage := NUMBER "%"
//   reps       := "(" NUMBER ("+" NUMBER)* ")" | NUMBER
//   sets       := "x" NUMBER
//
// Note on complex blocks: the % refers to the second movement's PR. The parser
// only records the percentage — PR resolution is downstream.

import { NotationParseError } from './errors';
import type { Block, Movement, Program, RepScheme } from './types';
import { programSchema } from './schemas';
import { type Token, type TokenType, tokenize } from './tokenizer';

const PREFIX_MODIFIERS = ['low hang', 'hang', 'half', 'slow'];

class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.consume();
      return true;
    }
    return false;
  }

  private expect(type: TokenType): Token {
    if (!this.check(type)) {
      const t = this.peek();
      throw new NotationParseError(
        `Expected ${type}, got ${t.type}${t.value ? ` '${t.value}'` : ''}`,
        t.position,
      );
    }
    return this.consume();
  }

  parseProgram(): Program {
    const blocks: Block[] = [this.parseBlock(null)];
    while (this.match('COMMA')) {
      const prev = blocks[blocks.length - 1];
      blocks.push(this.parseBlock(prev.movements));
    }
    this.expect('EOF');
    return { blocks };
  }

  private parseBlock(inheritedMovements: Movement[] | null): Block {
    let movements: Movement[] = [];
    if (this.check('IDENT')) {
      movements.push(this.parseMovement());
      while (this.match('AMP')) {
        movements.push(this.parseMovement());
      }
    } else if (inheritedMovements && inheritedMovements.length > 0) {
      movements = inheritedMovements.map((m) => ({ ...m, modifiers: [...m.modifiers] }));
    }

    let percentage: number | null = null;
    if (this.check('NUMBER') && this.peek(1).type === 'PERCENT') {
      percentage = parseFloat(this.consume().value);
      this.consume();
    }

    const reps = this.parseReps();
    const sets = this.parseSets();

    const modifiers: string[] = [];
    while (this.check('LPAREN')) {
      modifiers.push(this.parseParenContent());
    }

    return { movements, percentage, reps, sets, modifiers };
  }

  private parseMovement(): Movement {
    const words: string[] = [];
    const inlineModifiers: string[] = [];
    while (true) {
      const t = this.peek();
      if (t.type === 'IDENT') {
        words.push(this.consume().value);
      } else if (t.type === 'LPAREN') {
        if (this.isComplexRepsAhead()) break;
        inlineModifiers.push(this.parseParenContent());
      } else {
        break;
      }
    }
    if (words.length === 0) {
      throw new NotationParseError('Expected movement name', this.peek().position);
    }

    let name = words.join(' ');
    const prefixMods: string[] = [];
    const lowerName = name.toLowerCase();
    for (const mod of PREFIX_MODIFIERS) {
      if (lowerName === mod || lowerName.startsWith(mod + ' ')) {
        prefixMods.push(mod);
        name = name.slice(mod.length).trimStart();
        break;
      }
    }

    return { name, modifiers: [...prefixMods, ...inlineModifiers] };
  }

  private parseParenContent(): string {
    this.expect('LPAREN');
    const parts: string[] = [];
    while (!this.check('RPAREN') && !this.check('EOF')) {
      parts.push(this.consume().value);
    }
    this.expect('RPAREN');
    return parts.join(' ').trim();
  }

  private parseReps(): RepScheme {
    if (this.check('LPAREN')) {
      this.consume();
      const reps: number[] = [Number(this.expect('NUMBER').value)];
      while (this.match('PLUS')) {
        reps.push(Number(this.expect('NUMBER').value));
      }
      this.expect('RPAREN');
      return { type: 'complex', reps };
    }
    if (this.check('NUMBER')) {
      return { type: 'simple', reps: Number(this.consume().value) };
    }
    throw new NotationParseError(
      'Expected reps (number or parenthesized group)',
      this.peek().position,
    );
  }

  private parseSets(): number {
    const t = this.peek();
    if (t.type !== 'IDENT' || t.value.toLowerCase() !== 'x') {
      throw new NotationParseError(
        `Expected 'x' for sets marker, got '${t.value}'`,
        t.position,
      );
    }
    this.consume();
    return Number(this.expect('NUMBER').value);
  }

  private isComplexRepsAhead(): boolean {
    let offset = 0;
    if (this.peek(offset).type !== 'LPAREN') return false;
    offset += 1;
    if (this.peek(offset).type !== 'NUMBER') return false;
    offset += 1;
    while (this.peek(offset).type === 'PLUS') {
      offset += 1;
      if (this.peek(offset).type !== 'NUMBER') return false;
      offset += 1;
    }
    if (this.peek(offset).type !== 'RPAREN') return false;
    const next = this.peek(offset + 1);
    return next.type === 'IDENT' && next.value.toLowerCase() === 'x';
  }
}

export function parseNotation(input: string): Program {
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();
  const result = programSchema.safeParse(program);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join('.') ?? '';
    const message = path
      ? `Schema validation failed at ${path}: ${issue.message}`
      : (issue?.message ?? 'Schema validation failed');
    throw new NotationParseError(message, 0);
  }
  return result.data as Program;
}
