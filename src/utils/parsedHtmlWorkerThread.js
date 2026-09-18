import { parentPort, workerData } from "node:worker_threads";
import HelperFunction from "./HelperFunction.js";
import fs from "node:fs";

//get result from function return
parentPort.postMessage(
  HelperFunction.parseHtmlData(
    workerData["htmlPage"].toString(),
    workerData["reelIdentifier"],
  ),
);
