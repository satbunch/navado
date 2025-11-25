/**
 * 言語検出関数（統一実装）
 * content.js, options.js, popup.js で重複していた言語判定ロジックを一元化
 *
 * @param {string} hostname - ホスト名（省略時は location.hostname を使用）
 * @returns {string} 'ja' または 'en'
 */
export const detectLanguage = (hostname = null) => {
  // HTMLの lang 属性をチェック
  const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  if (htmlLang && htmlLang.startsWith('ja')) return 'ja';

  // ホスト名で判定（引数または location.hostname を使用）
  if (!hostname && typeof location !== 'undefined') {
    hostname = location.hostname;
  }

  if (hostname && hostname.includes('.co.jp')) {
    return 'ja';
  }

  // navigator.language で判定
  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  return nav.startsWith('ja') ? 'ja' : 'en';
};
