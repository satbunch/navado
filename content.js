// 選択ウィジェットを共通スタイルで挿入するスクリプト（詳細ウィジェットを削除）
(function () {
  const defaultWidgetTypes = ['photos', 'kindle', 'manage_kindle', 'prime_video'];

  const createWidgetConfigs = (baseUrl) => ({
    photos: {
      elements: [
        { tag: 'a', text: 'Amazon Photos', url: `${baseUrl}/photos` }
      ]
    },
    kindle: {
      elements: [
        { tag: 'a', text: 'Kindle Unlimited', url: `${baseUrl}/kindle-dbs/hz/bookshelf?shoppingPortalEnabled=true&ref_=nav_em_gno_ku_0_2_8_9` }
      ]
    },
    manage_kindle: {
      elements: [
        { tag: 'a', text: 'Manage Kindle', url: `${baseUrl}/gp/kindle/ku/ku_central?ref_=nav_AccountFlyout_ku` }
      ]
    },
    prime_video: {
      elements: [
        { tag: 'a', text: 'Prime Video', url: `${baseUrl}/gp/video/storefront?ref_=nav_em_aiv_vid_0_2_2_2` }
      ]
    },
  });

  const findInsertTarget = () =>
    document.querySelector('#navbar-main, #nav-main, #nav-belt, #navbar') ||
    document.querySelector('header');

  const insertWidgets = () => {
    const nav = findInsertTarget();
    const parent = nav?.parentNode || document.body;

    const baseDomain = location.hostname.endsWith('amazon.com') ? 'amazon.com' : 'amazon.co.jp';
    const widgetConfigs = createWidgetConfigs(`https://www.${baseDomain}`);

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
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertWidgets);
  } else {
    insertWidgets();
  }
})();
