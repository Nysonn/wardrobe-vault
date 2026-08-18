export class PayoutServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayoutServiceError";
  }
}
