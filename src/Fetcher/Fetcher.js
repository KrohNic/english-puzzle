import Utils from "./Utils.Fetcher.js";

export default class Fetcher {
  static basicFetcher(url, responseCallback, rejectCallback) {
    const controller = new AbortController();

    fetch(url, {
      signal: controller.signal
    })
      .then(res => {
        if (res.status >= 200 && res.status < 300) return res.json();

        throw new Error(res.status);
      })
      .then(json => {
        responseCallback(json);
      })
      .catch(error => {
        if (error.name == "AbortError") return;

        const mess = +error.message;

        if (mess >= 400 && mess < 600) {
          // eslint-disable-next-line no-console
          console.error(`API ${mess} Error: ${error}`);
        } else {
          if (rejectCallback) rejectCallback();
          // eslint-disable-next-line no-console
          else console.error(error);
        }
      });

    return controller;
  }

  static getWords(level, page, callback) {
    const url = Utils.getAfternoonUrl(level, page);

    const responseCallback = json => {
      if (!json) return;

      callback(json);
    };

    return Fetcher.basicFetcher(url, responseCallback);
  }
}
