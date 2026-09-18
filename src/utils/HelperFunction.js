import InvalidURLError from "../customErrors/InvalidURLError.js";
import InstagramStore from "./store.js";
import InvalidPathError from "../customErrors/InvalidPathError.js";
import fs from "node:fs";
import path from "node:path";
class HelperFunction {
  /**
   * @param {string} url - The URL to validate
   */
  static validateURL(url) {
    //check if url is string
    if (typeof url != "string")
      throw new InvalidURLError("provided url is not a string");

    //check if url is valid - This is for Initial request and check if url is valid - This is for cdn endpoint
    if (
      !(
        (url.startsWith(InstagramStore.baseUrl) &&
          url.startsWith(InstagramStore.cdnBaseUrl) == false) ||
        (url.startsWith(InstagramStore.baseUrl) == false &&
          url.startsWith(InstagramStore.cdnBaseUrl))
      )
    )
      throw new InvalidURLError(
        `provided url does not begin with ${InstagramStore.baseUrl} or ${InstagramStore.cdnBaseUrl}`,
      );
  }

  /**
   *
   * @param {*} url - The URL to retrieve route from without identifier
   */

  static retrieveRouteFromUrlWithoutIdentifier = (url) => {
    if (url[url.length - 1] == "/") {
      let slicedSection = url.slice(0, url.length - 1);
      return slicedSection.slice(0, slicedSection.lastIndexOf("/") + 1);
    }
  };

  /**
   * @param {string} url - The URL to retrieve unique reel identifier from
   */

  static retrieveIdentifierFromURL = (url) => {
    if (url[url.length - 1] == "/") {
      let slicedSection = url.slice(0, url.length - 1);
      return slicedSection.slice(slicedSection.lastIndexOf("/") + 1);
    }
    return url.slice(url.lastIndexOf("/"));
  };

  /**
   *
   * @param {string} url - The URL to return path from
   */
  static returnPath = (url) => {
    if (url.search(/reels/))
      return `/reels/${HelperFunction.retrieveIdentifierFromURL(url)}`;
    if (url.search(/p/))
      return `/p/${HelperFunction.retrieveIdentifierFromURL(url)}`;
    throw new InvalidPathError("Path within URL is not recognised");
  };

  /**
   *
   */
  static parseHtmlData(data, reelIdentifier) {
    const searchPattern =
      /<script\s+type="application\/json"\s+data-content-len="[0-9]+"\s+data-sjs\s*>[\s\S]*?<\/\s*script\s*>/g;
    let temp = data.matchAll(searchPattern);
    let extracted = [...temp];
    const arrayOfObject = [];

    console.log("---------------------------------------\n\n");
    const lengthOfArray = extracted.length;
    let getKeysOfObject;
    let idxOfBeginning;
    let idxOfEnd;
    let counterForBeginning;
    let counterForEnd;

    for (let i = 0; i < lengthOfArray; i++) {
      getKeysOfObject = Object.keys(extracted[i]);

      idxOfBeginning = extracted[i][getKeysOfObject[0]].indexOf("data-sjs>");
      idxOfEnd = extracted[i][getKeysOfObject[0]].indexOf("</script>");
      counterForBeginning = idxOfBeginning + 9;
      counterForEnd = idxOfEnd - 1;
      if (idxOfBeginning == -1) continue; //no match
      if (idxOfEnd == -1) continue; //no match
      //the lengt of: data-sjs> is 9

      HelperFunction.checkForOpenCurlyBraces(
        extracted,
        i,
        getKeysOfObject,
        counterForBeginning,
        counterForEnd,
      );
      arrayOfObject.push(
        JSON.parse(
          HelperFunction.extractObjectPart(
            counterForBeginning,
            counterForEnd,
            extracted[i][getKeysOfObject[0]],
          ),
        ),
      );
    }
    //return parsedData;
    return HelperFunction.validateToFindApporiateObject(
      arrayOfObject,
      reelIdentifier,
    );
  }

  static checkForOpenCurlyBraces(
    extracted,
    i,
    getKeysOfObject,
    counterForBeginning,
    counterForEnd,
  ) {
    if (extracted[i][getKeysOfObject[0]][counterForBeginning] == "{") {
      //find index of end now
      HelperFunction.checkForClosingCurlyBraces(
        extracted,
        i,
        getKeysOfObject,
        counterForEnd,
      );
    } else {
      while (counterForBeginning != extracted[i][getKeysOfObject[0]].length) {
        if (extracted[i][getKeysOfObject[0]][counterForBeginning] != "{") {
          counterForBeginning++;
          continue;
        }
        break; //found the
      }
      HelperFunction.checkForClosingCurlyBraces(
        extracted,
        i,
        getKeysOfObject,
        counterForEnd,
      );
    }
  }

  static checkForClosingCurlyBraces(
    extracted,
    i,
    getKeysOfObject,
    counterForEnd,
  ) {
    if (extracted[i][getKeysOfObject[0]][counterForEnd] == "}") {
      //all good - Now we can try to get the JSON stuff
    } else {
      while (counterForEnd != 0) {
        if (extracted[i][getKeysOfObject[0]][counterForEnd] != "}") {
          counterForEnd--;
          continue;
        }
        break; //found the
      }
    }
  }

  static extractObjectPart(
    openCurlyBracesIndex,
    closingCurlyBracesIndex,
    content,
  ) {
    return content.slice(openCurlyBracesIndex, closingCurlyBracesIndex + 1);
  }

  static validateToFindApporiateObject(_arrayOfObject, reelIdentifier) {
    //console.log(_arrayOfObject.length);
    //a lot of not so good things done, as i thought things were dynamic, but it is static, so fuck it
    for (let i = 0; i < _arrayOfObject.length; i++) {
      let keys = Object.keys(_arrayOfObject[i]);

      if (keys.some((item) => item == "require")) {
        if (_arrayOfObject[i]["require"] instanceof Array) {
          if (_arrayOfObject[i]["require"].length != 1) continue;
          //check if an array exist inside
          let idxOfArray;
          let idxOfArray2;
          let idxOfArray3;
          //will check first index
          if (
            _arrayOfObject[i]["require"][0].some((item, idx) => {
              if (item instanceof Array) {
                idxOfArray = idx;
                return true;
              }
            })
          ) {
            //will check the first index
            if (
              _arrayOfObject[i]["require"][0][idxOfArray][0] instanceof Object
            ) {
              //__bbox could be undefiiend
              if (
                typeof _arrayOfObject[i]["require"][0][idxOfArray][0][
                  "__bbox"
                ] === "undefined"
              )
                continue;

              if (
                _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                  "require"
                ] instanceof Array &&
                _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                  "require"
                ].length != 0
              ) {
                _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                  "require"
                ];

                try {
                  let len =
                    _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"]
                      ?.require.length;
                } catch (err) {
                  console.log("This is te error: ", err);
                }

                if (
                  _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                    "require"
                  ][0].some((item, idx) => {
                    if (Array.isArray(item) && item.length >= 1) {
                      idxOfArray2 = idx;
                      return true;
                    }
                  })
                ) {
                  //LOL - Nothing here
                }
                //On this part - find index of object
                try {
                  if (
                    _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                      "require"
                    ][0][idxOfArray2].some((item, idx) => {
                      if (
                        item instanceof Object &&
                        Array.isArray(item) == false
                      ) {
                        idxOfArray3 = idx;
                        return true;
                      }
                    })
                  ) {
                    //check if complete is true (Guess this is required)
                    if (
                      !_arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                        "require"
                      ][0][idxOfArray2][idxOfArray3]["__bbox"]["complete"] ==
                      "true"
                    )
                      continue;
                    //get first edge - and validate the video identifier

                    if (
                      !(
                        _arrayOfObject[i]["require"][0][idxOfArray][0][
                          "__bbox"
                        ]["require"][0][idxOfArray2][idxOfArray3]["__bbox"][
                          "result"
                        ]["data"]["xig_logged_out_reels_feed"]["edges"][0][
                          "node"
                        ]["code"] == reelIdentifier
                      )
                    ) {
                      return {};
                    }
                    //extract Username and profile_pic_url
                    let objectToReturn = {
                      ..._arrayOfObject[i]["require"][0][idxOfArray][0][
                        "__bbox"
                      ]["require"][0][idxOfArray2][idxOfArray3]["__bbox"][
                        "result"
                      ]["data"]["xig_logged_out_reels_feed"]["edges"][0][
                        "node"
                      ]["user"],
                    };

                    //also extract video url and image ur, and this will be what will be sent back to client
                    objectToReturn["video_Url"] =
                      _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                        "require"
                      ][0][idxOfArray2][idxOfArray3]["__bbox"]["result"][
                        "data"
                      ]["xig_logged_out_reels_feed"]["edges"][0]["node"][
                        "video_versions"
                      ][0];
                    objectToReturn["imageUrl"] =
                      _arrayOfObject[i]["require"][0][idxOfArray][0]["__bbox"][
                        "require"
                      ][0][idxOfArray2][idxOfArray3]["__bbox"]["result"][
                        "data"
                      ]["xig_logged_out_reels_feed"]["edges"][0]["node"][
                        "image_versions2"
                      ]["candidates"][0];

                    return objectToReturn;
                  }
                } catch (err) {
                  continue;
                }
                continue;
              }
              continue;
            }
            continue;
          }
          continue;
        }
        continue;
      }
      continue;
    }
    return {}; //nothing was found
  }

  //only call this function if you want to create a file - Not necessary if you already have a frontend as you will do this there
  static createFile(videoIdentifier) {
    const baseLocationToStoreFile = import.meta.dirname;
    let stream;
    let filePath = `${path.join(baseLocationToStoreFile, videoIdentifier)}.mp4`;
    console.log("This is the path: ", filePath);
    if (!fs.existsSync(filePath)) {
      stream = fs.createWriteStream(filePath);
    }
    return stream;
  }
}

export default HelperFunction;
