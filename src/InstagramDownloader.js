import HelperFunction from "./utils/HelperFunction.js";
import HttpClient from "./HttpClient.js";
class InstagramDownloader {
  #url;
  #videoIdentifier;
  #urlRouteWithoutIdentifier;
  #path; //-> the path of say: 'https://www.instagram.com/reels/DdGlNU8MeMm/' is '/reels/DdGlNU8MeMm/'
  #reelInfo = {};
  #actualReelURL;

  /**
   * @param {string} url - The actual URL of the video to be downloaded. Based on my observation, the URL can be in differnte format, i.e. https://www.instagram.com/reels/DdGlNU8MeMm/
   *
   * https://www.instagram.com/p/DdGlNU8MeMm/
   *
   */
  constructor(url) {
    this.#url = url;
  }

  /**
   *
   */
  //Actually responsible for validating before connecting
  async connect() {
    try {
      HelperFunction.validateURL(this.#url);

      this.#urlRouteWithoutIdentifier =
        HelperFunction.retrieveRouteFromUrlWithoutIdentifier(this.#url);

      this.#videoIdentifier = HelperFunction.retrieveIdentifierFromURL(
        this.#url,
      );

      this.#path = HelperFunction.returnPath(this.#url);
    } catch (err) {
      console.log(err);
    }

    const client = new HttpClient(
      this.#urlRouteWithoutIdentifier,
      this.#videoIdentifier,
      this.#path,
    );
    try {
      //will await, cause of other thread
      await client.retrieveHtmlPage(this.#path);
      const requiredSection = await client.parseHtmlToRetrieveRequiredSection();
      this.#reelInfo = { ...requiredSection };
      this.#actualReelURL = this.#reelInfo["video_Url"];
      delete this.#reelInfo["video_Url"];
      console.log("This is the final result: ", requiredSection);

      //stream
      this.streamReel();
    } catch (err) {
      console.log("An error occured: ", err);
    }
  }

  async streamReel() {
    const reelClient = new HttpClient(
      this.#urlRouteWithoutIdentifier,
      this.#videoIdentifier,
      this.#path,
      true,
    );

    try {
      let file = HelperFunction.createFile(this.#videoIdentifier);
      console.log("File is: ", file.path);
      await reelClient.donwloadStreamAsync(this.#actualReelURL["url"], file);
    } catch (err) {
      console.log("An error occured: ", err);
    }
  }

  get getVideoIdentifier() {
    return this.#videoIdentifier;
  }

  get getURLRouteWithoutIdentifier() {
    return this.#urlRouteWithoutIdentifier;
  }

  get getPath() {
    return this.#path;
  }

  get sendReelInformation() {
    return this.#reelInfo;
  }
}

export default InstagramDownloader;
