document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('widget-form');
  const status = document.getElementById('status');

  // 言語を検出する
  const detectLanguage = () => {
    // HTML lang 属性をチェック
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.startsWith('ja')) return 'ja';
    // デフォルト：ブラウザ言語を使用
    return navigator.language?.startsWith('ja') ? 'ja' : 'en';
  };

  try {
    // widgets.json を読み込み
    const response = await fetch('./widgets.json');
    const { widgets } = await response.json();

    const language = detectLanguage();

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

      const br = document.createElement('br');
      form.appendChild(br);
    });

    // 保存されたウィジェット設定を読み込み
    chrome.storage.sync.get({ widgetTypes: defaultWidgetTypes }, (data) => {
      (Array.isArray(data.widgetTypes) ? data.widgetTypes : defaultWidgetTypes).forEach(type => {
        const cb = form.querySelector(`input[value=\"${type}\"]`);
        if (cb) cb.checked = true;
      });
    });

    // 保存ボタンのイベント
    document.getElementById('save').addEventListener('click', () => {
      const checked = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      chrome.storage.sync.set({ widgetTypes: checked }, () => {
        status.textContent = '保存しました！';
        setTimeout(() => status.textContent = '', 2000);
      });
    });
  } catch (error) {
    console.error('Failed to load widgets:', error);
    status.textContent = 'ウィジェットの読み込みに失敗しました';
  }
});
