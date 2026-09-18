//here will be our exports for everything
import InstagramDownloader from "./src/InstagramDownloader.js";
let test = new InstagramDownloader(
  "https://www.instagram.com/reels/DVjYtWyjEL1/",
);

//just some test URL
//"https://www.instagram.com/reels/DdHU054Ff-c/"
test.connect();

export { InstagramDownloader };
