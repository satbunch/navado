import { detectLanguage } from '../js/utils.js';
import { storageGet, storageSet } from '../js/chrome-api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('widget-form');
  const status = document.getElementById('status');

  try {
    // widgets.json を読み込み（オプションページから見た相対パス）
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

    // 保存されたウィジェット設定を読み込み（js/chrome-api.js で統一）
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

    // 保存ボタンのイベント（js/chrome-api.js で統一）
    document.getElementById('save').addEventListener('click', async () => {
      const checked = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      try {
        await storageSet({ widgetTypes: checked });
        status.textContent = '保存しました！';
        setTimeout(() => status.textContent = '', 2000);
      } catch (error) {
        console.error('Failed to save widgets:', error);
        status.textContent = 'エラーが発生しました';
        setTimeout(() => status.textContent = '', 2000);
      }
    });
  } catch (error) {
    console.error('Failed to load widgets:', error);
    status.textContent = 'ウィジェットの読み込みに失敗しました';
  }
});
