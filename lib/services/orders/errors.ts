export class OrderServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderServiceError";
  }
}
