import path from "node:path";

let my = `${path.join(import.meta.dirname, "videoIdentifier")}.mp4`;
console.log(my);
