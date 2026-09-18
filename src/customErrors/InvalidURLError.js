class InvalidURLError extends Error {
  #message;
  /**
   *
   * @param {string} message - Error message when Invalid URL Error triggered
   */
  constructor(message) {
    super(message);
    this.#message = message;
    this.name = "Invalid URL Error";
  }
}
export default InvalidURLError;
