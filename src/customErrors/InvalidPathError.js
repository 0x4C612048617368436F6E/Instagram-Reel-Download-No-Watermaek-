class InvalidPathError extends Error {
  #message;
  /**
   *
   * @param {string} message - Error message when Invalid URL Error triggered
   */
  constructor(message) {
    super(message);
    this.#message = message;
    this.name = "Invalid Path Error";
  }
}
export default InvalidPathError;
