// 選択ウィジェットを共通スタイルで挿入するスクリプト（ウィジェット定義は widgets.json で管理）

// ============================================================================
// ユーティリティ関数（js/utils.js からインライン化）
// ============================================================================

/**
 * 言語検出関数
 * @param {string} hostname - ホスト名（省略時は location.hostname を使用）
 * @returns {string} 'ja' または 'en'
 */
const detectLanguage = (hostname = null) => {
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

// ============================================================================
// Chrome Storage API ラッパー（js/chrome-api.js からインライン化）
// ============================================================================

const storageGet = (keys) => {
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

// ============================================================================
// widgets.json 読み込み（js/config.js からインライン化）
// ============================================================================

const loadWidgets = async () => {
  const url = chrome.runtime.getURL('options/widgets.json');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load widgets.json: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.widgets || [];
};

// ============================================================================
// メインロジック
// ============================================================================

// サインイン・サインアップページかどうかを判定
const isSigninPage = () => {
  return location.pathname.includes('/ap/signin') ||
         location.pathname.includes('/ap/register') ||
         location.pathname.includes('/ap/cvf') ||
         location.pathname.includes('/ax/');
};

// JSON からウィジェット設定を動的に生成
const createWidgetConfigs = (baseDomain, widgets, language) => {
  const configs = {};
  widgets.forEach(widget => {
    const domainKey = baseDomain.includes('.co.jp') ? 'co.jp' : 'com';
    const url = widget.urls[domainKey];
    const label = widget.labels[language] || widget.labels['en'];
    configs[widget.id] = {
      elements: [{ tag: 'a', text: label, url }]
    };
  });
  return configs;
};

// JSON からデフォルト有効ウィジェットを取得
const getDefaultWidgetTypes = (widgets) => {
  return widgets.filter(w => w.enabled).map(w => w.id);
};

const findInsertTarget = () =>
  document.querySelector('#navbar-main, #nav-main, #nav-belt, #navbar') ||
  document.querySelector('header');

// nav-main または nav-belt から背景色と枠線色を取得
const getNavColors = () => {
  // 優先順位：nav-main > nav-belt > デフォルト
  let navElement = document.querySelector('#nav-main');
  if (!navElement) {
    navElement = document.querySelector('#nav-belt');
  }
  if (!navElement) {
    return { bgColor: '#232f3e', borderColor: '#0073bb' };
  }
  const style = window.getComputedStyle(navElement);
  return {
    bgColor: style.backgroundColor,
    borderColor: style.borderColor || '#0073bb'
  };
};

const insertWidgets = async () => {
  // サインイン・サインアップページでは処理しない
  if (isSigninPage()) {
    return;
  }

  try {
    // widgets.json を読み込み
    const widgets = await loadWidgets();

    const nav = findInsertTarget();
    const parent = nav?.parentNode || document.body;
    const baseDomain = location.hostname.endsWith('amazon.com') ? 'amazon.com' : 'amazon.co.jp';
    const language = detectLanguage();
    const widgetConfigs = createWidgetConfigs(baseDomain, widgets, language);
    const defaultWidgetTypes = getDefaultWidgetTypes(widgets);
    const colors = getNavColors();

    // 既存コンテナ削除
    const old = document.getElementById('amazon-widgets-container');
    if (old) old.remove();

    // Storage から有効なウィジェット種別を読み込み
    let activeWidgetTypes = defaultWidgetTypes;
    try {
      const { widgetTypes } = await storageGet({ widgetTypes: defaultWidgetTypes });
      if (Array.isArray(widgetTypes) && widgetTypes.length > 0) {
        activeWidgetTypes = widgetTypes;
      }
    } catch (storageError) {
      console.error('Storage read failed:', storageError);
      // フォールバック：デフォルト設定を使用
    }

    // ウィジェットコンテナ作成・挿入
    const container = document.createElement('div');
    container.id = 'amazon-widgets-container';

    activeWidgetTypes.forEach(type => {
      const cfg = widgetConfigs[type];
      if (!cfg) return;
      const item = document.createElement('div');
      item.className = 'amazon-widget';
      item.style.backgroundColor = colors.bgColor;
      item.style.borderColor = colors.borderColor;
      cfg.elements.forEach(el => {
        const elem = document.createElement(el.tag);
        elem.textContent = el.text;
        if (el.url) elem.href = el.url;
        if (el.tag === 'a') elem.className = 'amazon-widget-link';
        item.appendChild(elem);
      });
      container.appendChild(item);
    });
    const referenceNode = nav?.nextSibling || parent.firstChild;
    if (referenceNode) {
      parent.insertBefore(container, referenceNode);
    } else {
      parent.appendChild(container);
    }
  } catch (error) {
    console.error('Failed to load widgets:', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', insertWidgets);
} else {
  insertWidgets();
}
