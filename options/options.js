document.addEventListener('DOMContentLoaded', () => {
  const defaultWidgetTypes = ['photos', 'kindle', 'manage_kindle', 'prime_video'];
  const form = document.getElementById('widget-form');
  const status = document.getElementById('status');
  chrome.storage.sync.get({ widgetTypes: defaultWidgetTypes }, (data) => {
    (Array.isArray(data.widgetTypes) ? data.widgetTypes : defaultWidgetTypes).forEach(type => {
      const cb = form.querySelector(`input[value=\"${type}\"]`);
      if (cb) cb.checked = true;
    });
  });
  document.getElementById('save').addEventListener('click', () => {
    const checked = Array.from(form.querySelectorAll('input[type=\"checkbox\"]:checked')).map(cb => cb.value);
    chrome.storage.sync.set({ widgetTypes: checked }, () => {
      status.textContent = '保存しました！';
      setTimeout(() => status.textContent = '', 2000);
    });
  });
});
