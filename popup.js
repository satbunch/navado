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

  // 言語を検出する（ウィジェットと同じロジック）
  const detectLanguage = async () => {
    try {
      // 現在のアクティブなタブを取得
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        // タブがない場合はデフォルト
        return navigator.language?.startsWith('ja') ? 'ja' : 'en';
      }
      // タブのURL からドメインを判定
      const hostname = new URL(tab.url).hostname;
      return hostname.includes('.co.jp') ? 'ja' : 'en';
    } catch (error) {
      console.error('Failed to detect language:', error);
      // フォールバック：ブラウザ言語
      return navigator.language?.startsWith('ja') ? 'ja' : 'en';
    }
  };

  try {
    // widgets.json を読み込み（options フォルダから）
    const response = await fetch('options/widgets.json');
    const { widgets } = await response.json();

    const language = await detectLanguage();
    const texts = uiTexts[language];

    // UI テキストを設定
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
    chrome.storage.sync.get({ widgetTypes: defaultWidgetTypes }, (data) => {
      (Array.isArray(data.widgetTypes) ? data.widgetTypes : defaultWidgetTypes).forEach(type => {
        const cb = form.querySelector(`input[value="${type}"]`);
        if (cb) cb.checked = true;
      });
    });

    // 保存ボタンのイベント
    document.getElementById('save').addEventListener('click', () => {
      const checked = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      chrome.storage.sync.set({ widgetTypes: checked }, () => {
        status.textContent = texts.saved;
        // 現在のタブをリロード
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
          }
        });
      });
    });
  } catch (error) {
    console.error('Failed to load widgets:', error);
    const fallbackTexts = uiTexts[navigator.language?.startsWith('ja') ? 'ja' : 'en'];
    status.textContent = fallbackTexts.loadError;
  }
});
