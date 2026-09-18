import axios from "axios";
import InstagramStore from "./utils/store.js";
import { wrapper } from "axios-cookiejar-support";
import customCookieJar from "./customCookieJar.js";
import { requestInterceptor, responeInterceptor } from "./utils/Inceptors.js";
import { Worker } from "node:worker_threads";
import path from "node:path";
import AxiosInstanceNotAbleToStreamError from "./customErrors/AxiosInstanceNotAbleToStreamError.js";

class HttpClient {
  #urlWithoutIdentifier;
  #identifier;
  #axiosInstance;
  #header;
  #jar;
  #htmlPage;
  #streamed;
  /**
   *
   * @param {string} urlWithoutIdentifier
   * @param {string} identifier
   */
  constructor(urlWithoutIdentifier, identifier, path, streamed = false) {
    this.#urlWithoutIdentifier = urlWithoutIdentifier;
    this.#identifier = identifier;
    this.#header = urlWithoutIdentifier.startsWith(InstagramStore.baseUrl)
      ? InstagramStore.initialPageRequestHeaders
      : InstagramStore.cdnEndpoitRequestHeaders;

    this.#jar = new customCookieJar();
    this.#header.path = path;
    this.#streamed = streamed;

    ((this.#axiosInstance = !streamed
      ? wrapper(
          axios.create({
            jar: this.#jar,
            baseURL: InstagramStore.baseUrl,
            headers: {
              ...this.#header,
            },
            timeout: 5000,
          }),
        )
      : axios.create({
          jar: this.#jar,
          headers: {
            ...this.#header,
          },
          timeout: 5000,
          responseType: "stream",
        })),
      //configure the request and respone interceptor
      requestInterceptor(this.#axiosInstance));
    responeInterceptor(this.#axiosInstance);
  }

  /**
   *
   * @param {string} path - Path to get without baseURL
   * @returns
   */
  async retrieveHtmlPage(path) {
    let data = await this.#globalGetRequest(path);

    let returnedArrayofCookies = await this.#jar.parseCookie();

    this.#htmlPage = data;
    return data;
  }

  //will be for the actual Video/MP4
  async donwloadStreamAsync(path, writableStream) {
    //will use an internal memory rather than create file
    if (!this.#streamed)
      throw new AxiosInstanceNotAbleToStreamError(
        "Instance not able to stream",
      );
    return await this.#globalGetRequest(path, writableStream);
  }

  /**
   *
   * @param {string} path - Path to get without baseURL
   * @returns
   */
  async #globalGetRequest(path, writableStream = "") {
    let response;
    try {
      response = await this.#axiosInstance.get(path);
      //get writer
      if (this.#streamed) {
        response.data.pipe(writableStream);
        writableStream.on("finish", () => {
          console.log("Finished");
        });
        return;
      }
    } catch (err) {
      console.log("An error occured: ", err);
    }
    //will get respone as normal html/text
    //no need to return data is reponse is stream
    if (this.#streamed) return;
    return response.data;
  }

  /**
   *
   */
  async parseHtmlToRetrieveRequiredSection() {
    const fileName = path.join(
      import.meta.dirname,
      "utils",
      "parsedHtmlWorkerThread.js",
    );
    return new Promise((resolve, reject) => {
      let workerThread = new Worker(fileName, {
        workerData: {
          htmlPage: this.#htmlPage,
          reelIdentifier: this.#identifier,
        },
      });
      workerThread.on("message", resolve);
      workerThread.on("error", reject);
      workerThread.on("exit", (code) => {
        if (code != 0) {
          reject("An issue occured with the worker thread");
        }
      });
    });
  }
}
export default HttpClient;
