
# Navado - Amazon Shortcut Widgets

A lightweight Chrome extension that displays user‑selectable service widgets on Amazon's homepage, enabling quick navigation to your favorite Amazon services.

## 🎯 Features

* **Quick Access:** Jump directly to Amazon Photos, Kindle Unlimited, or other Amazon services with a single click.
* **Customizable:** Enable or disable individual widgets via the extension's options page.
* **Consistent Design:** Unified widget styling that matches Amazon's navigation bar.
* **Multi-language Support:** Widget labels and URLs adapt to your language and region.
* **Lightweight:** Minimal implementation using content scripts and the Chrome Storage API.

## ⚙️ Installation

1. Clone or download this repository:

```bash
git clone https://github.com/satbunch/navado.git
cd navado
```

2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top‑right corner.
4. Click **Load unpacked**, then select the `navado` folder.

## 🚀 Usage

1. Visit the Amazon homepage (e.g., `https://www.amazon.co.jp/` or `https://www.amazon.com/`).
2. Widgets appear directly above the main navigation bar.
3. To configure which widgets display, open **Extensions → Details → Extension options**.
4. Check or uncheck the services you want, click **Save**, then reload the Amazon page.

## 🗂️ Directory Structure

```
navado/
├── manifest.json              # Extension manifest (permissions, content scripts, options_ui)
├── content.js                 # Script that injects widgets into Amazon's DOM
├── content.css                # Widget styling
├── popup.html                 # Extension popup UI
├── options/
│   ├── options.html           # Options page UI
│   ├── options.js             # Options page logic
│   └── widgets.json           # Widget definitions (labels, URLs, settings)
└── README.md                  # This file
```

## ✏️ Customization

### Adding a New Widget

1. Edit `options/widgets.json` to add a new widget entry:
   ```json
   {
     "id": "my_service",
     "labels": {
       "ja": "マイサービス",
       "en": "My Service"
     },
     "urls": {
       "co.jp": "https://www.amazon.co.jp/...",
       "com": "https://www.amazon.com/..."
     },
     "enabled": true
   }
   ```

2. The widget will automatically appear in the options page and be reflected on Amazon pages.

### Adjusting Styling

- Edit `content.css` to customize the appearance of `#amazon-widgets-container`, `.amazon-widget`, and `.amazon-widget-link`.

## 🤝 Contributing

Bug reports, feature requests, and pull requests are welcome! Please open an issue or submit a PR.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
