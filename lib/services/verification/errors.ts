export class VerificationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerificationServiceError";
  }
}
