export class NotationParseError extends Error {
  constructor(message: string, public readonly position?: number) {
    super(position !== undefined ? `${message} (at position ${position})` : message);
    this.name = 'NotationParseError';
  }
}
