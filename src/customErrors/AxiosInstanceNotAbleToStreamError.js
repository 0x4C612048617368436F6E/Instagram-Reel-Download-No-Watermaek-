class AxiosInstanceNotAbleToStreamError extends Error {
  #message;
  /**
   *
   * @param {string} message - Error message when Invalid URL Error triggered
   */
  constructor(message) {
    super(message);
    this.#message = message;
    this.name = "Axios Instance not able to stream";
  }
}
export default AxiosInstanceNotAbleToStreamError;
