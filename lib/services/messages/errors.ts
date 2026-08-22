export class MessageServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessageServiceError";
  }
}
