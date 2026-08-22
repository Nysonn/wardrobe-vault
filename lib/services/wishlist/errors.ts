export class WishlistServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WishlistServiceError";
  }
}
