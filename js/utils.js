/**
 * 言語検出関数（統一実装）
 * content.js, options.js, popup.js で重複していた言語判定ロジックを一元化
 *
 * @param {string} hostname - ホスト名（省略時は location.hostname を使用）
 * @returns {string} 'ja' または 'en'
 */
export const detectLanguage = (hostname = null) => {
  // ホスト名を取得（引数または location.hostname を使用）
  if (!hostname && typeof location !== 'undefined') {
    hostname = location.hostname;
  }

  // ドメインベース判定を最優先
  if (hostname && hostname.endsWith('.com')) {
    return 'en';  // amazon.com → 英語
  }
  if (hostname && hostname.includes('.co.jp')) {
    return 'ja';  // amazon.co.jp → 日本語
  }

  // フォールバック：HTML lang 属性
  const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  if (htmlLang && htmlLang.startsWith('ja')) return 'ja';

  // 最終フォールバック：navigator.language
  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  return nav.startsWith('ja') ? 'ja' : 'en';
};
