import { CookieJar } from "tough-cookie";
import InstagramStore from "./utils/store.js";
class customCookieJar extends CookieJar {
  constructor() {
    super();
  }
  /**
   * Parse cookie from a set-cookie respone header
   */
  async parseCookie() {
    let arrayOfCookies = await this.#customGetCookie();
    return arrayOfCookies;
  }

  /**
   * get cookie from a set-cookie respone header
   */
  async #customGetCookie() {
    let cookies = await this.getCookies(InstagramStore.baseUrl);
    return cookies;
  }

  /**
   * set cookie into a request header
   */
  #setCookie = () => {};
}

export default customCookieJar;
