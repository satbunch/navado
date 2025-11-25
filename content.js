// 選択ウィジェットを共通スタイルで挿入するスクリプト（ウィジェット定義は widgets.json で管理）
(function () {
  // サインイン・サインアップページかどうかを判定
  const isSigninPage = () => {
    return location.pathname.includes('/ap/signin') ||
           location.pathname.includes('/ap/register') ||
           location.pathname.includes('/ap/cvf');
  };

  // 言語を検出する
  const detectLanguage = () => {
    // HTML lang 属性をチェック（フォールバック）
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.startsWith('ja')) return 'ja';

    // デフォルト：ドメインで判定
    return location.hostname.includes('.co.jp') ? 'ja' : 'en';
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
      const response = await fetch(chrome.runtime.getURL('options/widgets.json'));
      const { widgets } = await response.json();

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

      chrome.storage.sync.get({ widgetTypes: defaultWidgetTypes }, ({ widgetTypes }) => {
        const activeWidgetTypes = Array.isArray(widgetTypes) && widgetTypes.length > 0 ? widgetTypes : defaultWidgetTypes;
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
      });
    } catch (error) {
      console.error('Failed to load widgets:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertWidgets);
  } else {
    insertWidgets();
  }
})();
