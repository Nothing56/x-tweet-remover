# X Tweet Deleter (Zen & Firefox) 

![License](https://img.shields.io/badge/license-MIT-blue.svg)

A lightweight, automated browser extension to bulk delete tweets (posts) and undo retweets from your X.com (Twitter) profile. Optimized for **Zen Browser** and **Firefox**.

### 💡 Why this tool?
I built this because most "mass tweet deleter" services charge monthly subscriptions for something that should be simple and free. This extension runs locally on your browser, costs nothing, and gets the job done.

## 🚀 Features

- **Automated Deletion:** Scans your profile and deletes tweets one by one.
- **Smart Filtering:** detecting non-deletable items (ads, promoted tweets) and skips them.
- **Human-Like Behavior:** Adds random delays (2-4s) between actions to avoid rate limiting.
- **Language Support:** Works with English ("Delete", "Undo Repost") and Turkish ("Sil", "Retweeti geri al") interfaces.
- **Clean UI:** Safely closes menus if a tweet cannot be deleted, keeping your screen clutter-free.
- **Manifest V2:** Uses Manifest V2 for better persistent performance on Firefox-based browsers.

## 📦 Installation

This extension is not yet on the addons store. You can install it manually:

1.  Download the latest release from the Releases page (or clone this repo).
2.  Open **Zen Browser** or **Firefox**.
3.  Type `about:debugging` in the address bar.
4.  Click **This Firefox** on the left menu.
5.  Click **Load Temporary Add-on**.
6.  Select the `manifest.json` file from the project folder.

## 🛠️ Usage

1.  Go to your [X.com Profile](https://x.com/home) -> **Posts** tab.
2.  Click the extension icon in the toolbar.
3.  Click **Start Deleting**.
4.  Sit back and watch the cleanup! 🧹
5.  Click **Stop** anytime to pause the process.

> **Warning:** Deleted tweets cannot be recovered. Use at your own risk.

## 🤝 Contributing & License

I am sharing this code for everyone to use freely! 

**Maintenance:**  
I'm not actively looking for Pull Requests or tracking Issues. This is a "use-as-is" tool.

**Use & Credit:**  
You are free to copy, modify, and use this code in your own projects.  
 **The only thing I ask is that you give credit (link back to this repo) if you use it.**

Enjoy! 
