// ============================================================================
// Chrome Storage API ラッパー（インライン化）
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

const storageSet = (obj) => {
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

// ============================================================================
// 言語検出関数（インライン化）
// ============================================================================

const detectLanguage = (hostname = null) => {
  const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  if (htmlLang && htmlLang.startsWith('ja')) return 'ja';

  if (!hostname && typeof location !== 'undefined') {
    hostname = location.hostname;
  }

  if (hostname && hostname.includes('.co.jp')) {
    return 'ja';
  }

  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  return nav.startsWith('ja') ? 'ja' : 'en';
};

// ============================================================================
// メインロジック
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('widget-form');
  const status = document.getElementById('status');

  // UI テキスト定義
  const uiTexts = {
    ja: {
      title: 'ウィジェット設定',
      saveButton: '保存',
      saved: '保存しました！',
      loadError: 'ウィジェットの読み込みに失敗しました'
    },
    en: {
      title: 'Widget Settings',
      saveButton: 'Save',
      saved: 'Saved!',
      loadError: 'Failed to load widgets'
    }
  };

  // 言語を検出する（Amazon タブを優先的に探す）
  const detectLanguageForCurrentTab = async () => {
    try {
      console.log('Starting language detection...');

      // 1. Amazon タブを探す
      const amazonTabs = await chrome.tabs.query({
        url: ['*://www.amazon.co.jp/*', '*://www.amazon.com/*']
      });

      console.log('Amazon tabs found:', amazonTabs.length);

      if (amazonTabs.length > 0) {
        const hostname = new URL(amazonTabs[0].url).hostname;
        console.log('Using Amazon tab hostname:', hostname);
        const lang = detectLanguage(hostname);
        console.log('Detected language:', lang);
        return lang;
      }

      // 2. Amazon タブがない場合はアクティブなタブをチェック
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.url) {
        try {
          const activeHostname = new URL(activeTab.url).hostname;
          console.log('Active tab hostname:', activeHostname);
          const lang = detectLanguage(activeHostname);
          console.log('Detected language from active tab:', lang);
          return lang;
        } catch (error) {
          console.error('Failed to parse active tab URL:', error);
        }
      }

      // 3. デフォルト
      console.log('Using default language detection');
      const lang = detectLanguage();
      console.log('Default language:', lang);
      return lang;
    } catch (error) {
      console.error('Failed to detect language:', error);
      return detectLanguage();
    }
  };

  try {
    console.log('Popup loaded, starting initialization...');

    // widgets.json を読み込み（拡張機能リソースから）
    const response = await fetch(chrome.runtime.getURL('options/widgets.json'));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { widgets } = await response.json();

    console.log('Widgets loaded:', widgets.length);

    const language = await detectLanguageForCurrentTab();
    console.log('Final language for UI:', language);

    const texts = uiTexts[language];

    // UI テキストを設定
    console.log('Setting UI text to language:', language);
    document.querySelector('h2').textContent = texts.title;
    document.getElementById('save').textContent = texts.saveButton;

    // デフォルト有効ウィジェットを取得
    const defaultWidgetTypes = widgets.filter(w => w.enabled).map(w => w.id);

    // フォームに動的にチェックボックスを生成
    widgets.forEach(widget => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = widget.id;
      const labelText = widget.labels[language] || widget.labels['en'];
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${labelText}`));
      form.appendChild(label);
    });

    // 保存されたウィジェット設定を読み込み
    try {
      const data = await storageGet({ widgetTypes: defaultWidgetTypes });
      const widgetTypesToCheck = Array.isArray(data.widgetTypes) && data.widgetTypes.length > 0
        ? data.widgetTypes
        : defaultWidgetTypes;

      widgetTypesToCheck.forEach(type => {
        const cb = form.querySelector(`input[value="${type}"]`);
        if (cb) cb.checked = true;
      });
    } catch (storageError) {
      console.error('Failed to load saved widgets:', storageError);
      // フォールバック：デフォルト設定をチェック
      defaultWidgetTypes.forEach(type => {
        const cb = form.querySelector(`input[value="${type}"]`);
        if (cb) cb.checked = true;
      });
    }

    // 保存ボタンのイベント
    document.getElementById('save').addEventListener('click', async () => {
      const checked = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      try {
        await storageSet({ widgetTypes: checked });
        status.textContent = texts.saved;

        // 現在のタブをリロード
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          await chrome.tabs.reload(tab.id);
        }
      } catch (error) {
        console.error('Failed to save widgets:', error);
        status.textContent = uiTexts[await detectLanguageForCurrentTab()].loadError;
        setTimeout(() => status.textContent = '', 2000);
      }
    });
  } catch (error) {
    console.error('Failed to load widgets:', error);
    const fallbackTexts = uiTexts[detectLanguage() === 'ja' ? 'ja' : 'en'];
    status.textContent = fallbackTexts.loadError;
  }
});
