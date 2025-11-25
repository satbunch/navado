/**
 * ウィジェット設定読み込み関数（統一実装）
 * content.js, options.js, popup.js で異なるパスで読み込んでいた widgets.json を一元化
 */
export const loadWidgets = async () => {
  const url = chrome.runtime.getURL('options/widgets.json');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load widgets.json: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.widgets || [];
};
