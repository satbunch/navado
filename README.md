
# Navado - Amazon Shortcut Widgets

A lightweight Chrome extension that displays user‑selectable service widgets on Amazon’s homepage, enabling quick navigation to your favorite Amazon services.

## 🎯 Features

* **Quick Access:** Jump directly to Amazon Photos or Kindle Unlimited with a single click.
* **Customizable:** Enable or disable individual widgets via the extension’s options page.
* **Consistent Design:** Unified widget styling with background `#232f3e`, border `#0073bb`, and white text.
* **Lightweight:** Minimal implementation using content scripts and the Chrome Storage API.

## ⚙️ Installation

1. Clone or download this repository:

```bash
git clone https://github.com/satbunch/amazon-services-widgets.git
cd amazon-services-widgets
```


2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top‑right corner.
4. Click **Load unpacked**, then select the `amazon-service-widgets` folder.

## 🚀 Usage

1. Visit the Amazon homepage (e.g. `https://www.amazon.co.jp/`).
2. Widgets appear directly above the main navigation bar.
3. To configure which widgets display, open **Extensions → Details → Extension options**.
4. Check or uncheck the services you want, click **Save**, then reload the Amazon page.

## 🗂️ Directory Structure

```

amazon-service-widgets/
├── manifest.json    # Extension manifest (permissions, content scripts, options\_ui)
├── content.js       # Script that injects widgets into Amazon’s DOM
└──── options
          ├── options.html     # HTML for the extension’s options page
          └── options.js       # Logic for saving and loading user settings

```

## ✏️ Customization

- **Add a new widget:** In `content.js`, register a new entry in the `widgetConfigs` object with its label and URL.
- **Adjust styling:** Edit the `widgetStyle` and `linkStyle` constants in `content.js` for global style changes.

## 🤝 Contributing

Bug reports, feature requests, and pull requests are welcome! Please open an issue or submit a PR.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
