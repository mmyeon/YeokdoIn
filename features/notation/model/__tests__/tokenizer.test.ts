import { tokenize } from '../tokenizer';
import { NotationParseError } from '../errors';

describe('tokenize', () => {
  it('공백을 무시하고 기본 토큰을 인식한다', () => {
    const tokens = tokenize('back squat 70% 5x3');
    expect(tokens.map((t) => t.type)).toEqual([
      'IDENT',
      'IDENT',
      'NUMBER',
      'PERCENT',
      'NUMBER',
      'IDENT',
      'NUMBER',
      'EOF',
    ]);
    expect(tokens[0].value).toBe('back');
    expect(tokens[2].value).toBe('70');
    expect(tokens[5].value).toBe('x');
  });

  it('앰퍼샌드, 쉼표, 괄호, 더하기를 개별 토큰으로 분리한다', () => {
    const tokens = tokenize('a & b, (3+1)');
    const types = tokens.map((t) => t.type);
    expect(types).toEqual([
      'IDENT',
      'AMP',
      'IDENT',
      'COMMA',
      'LPAREN',
      'NUMBER',
      'PLUS',
      'NUMBER',
      'RPAREN',
      'EOF',
    ]);
  });

  it('점을 포함한 약어(P.Sn, S.D.L)를 하나의 IDENT로 처리한다', () => {
    const tokens = tokenize('P.Sn S.D.L');
    expect(tokens.filter((t) => t.type === 'IDENT').map((t) => t.value)).toEqual([
      'P.Sn',
      'S.D.L',
    ]);
  });

  it('한글 IDENT를 인식한다', () => {
    const tokens = tokenize('(발붙이기)');
    expect(tokens[1].type).toBe('IDENT');
    expect(tokens[1].value).toBe('발붙이기');
  });

  it('소수점이 포함된 숫자를 하나의 NUMBER로 인식한다', () => {
    const tokens = tokenize('72.5%');
    expect(tokens[0]).toMatchObject({ type: 'NUMBER', value: '72.5' });
    expect(tokens[1].type).toBe('PERCENT');
  });

  it('알 수 없는 문자가 있으면 NotationParseError를 던진다', () => {
    expect(() => tokenize('back @squat')).toThrow(NotationParseError);
  });
});
