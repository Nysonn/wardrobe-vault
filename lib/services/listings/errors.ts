export class ListingServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ListingServiceError";
  }
}
