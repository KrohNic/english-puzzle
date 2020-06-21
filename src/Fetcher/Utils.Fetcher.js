import { afternoonURL } from "./Consts.Fetcher.js";
import { Consts } from "../Consts.js";

export default class Utils {
  static getAfternoonUrl(level, page) {
    const url = new URL("words", afternoonURL);
    url.searchParams.set("page", page);
    url.searchParams.set("group", level - 1);
    url.searchParams.set("wordsPerExampleSentenceLTE", 10);
    url.searchParams.set("wordsPerPage", Consts.SENTENCE_COUNT);
    return url;
  }
}
