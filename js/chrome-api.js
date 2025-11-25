/**
 * Chrome Storage API の Promise ラッパー
 * コールバックベースの API を Promise 化してエラーハンドリングを改善
 */

export const storageGet = (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
};

export const storageSet = (obj) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(obj, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
};
