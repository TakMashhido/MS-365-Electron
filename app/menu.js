const store = require("./store");
const useragents = require("./useragents.json");
const { app, dialog, BrowserWindow } = require("electron");
const axios = require("axios");

function getValueOrDefault(key, defaultValue) {
  const value = store.get(key);
  if (value === undefined) {
    store.set(key, defaultValue);
    return defaultValue;
  }
  return value;
}

async function checkForUpdates() {
  try {
    const res = await axios.get(
      "https://api.github.com/repos/agam778/MS-365-Electron/releases/latest"
    );
    const data = res.data;
    const currentVersion = "v" + app.getVersion();
    const latestVersion = data.tag_name;

    if (currentVersion !== latestVersion) {
      const updatedialog = dialog.showMessageBoxSync({
        type: "info",
        title: "Update Available",
        message: `Your App's version: ${currentVersion}\nLatest version: ${latestVersion}\n\nPlease update to the latest version.`,
        buttons: ["Download", "Close"],
      });
      if (updatedialog === 0) {
        shell.openExternal(
          "https://github.com/agam778/MS-365-Electron/releases/latest"
        );
      }
    } else {
      dialog.showMessageBoxSync({
        type: "info",
        title: "No Update Available",
        message: `Your App's version: ${currentVersion}\nLatest version: ${latestVersion}\n\nYou are already using the latest version.`,
        buttons: ["OK"],
      });
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
  }
}

async function openExternalLink(url) {
  const { shell } = require("electron");
  await shell.openExternal(url);
}

async function openLogsFolder() {
  const { shell } = require("electron");
  if (process.platform === "win32") {
    await shell.openPath(
      "C:\\Users\\" +
        process.env.USERNAME +
        "\\AppData\\Roaming\\ms-365-electron\\logs\\"
    );
  } else if (process.platform === "darwin") {
    await shell.openPath(
      "/Users/" + process.env.USER + "/Library/Logs/ms-365-electron/"
    );
  } else if (process.platform === "linux") {
    await shell.openPath(
      "/home/" + process.env.USER + "/.config/ms-365-electron/logs/"
    );
  }
}

function setUserAgent(useragent) {
  store.set("useragentstring", useragent);
  const updatedialog = dialog.showMessageBoxSync({
    type: "info",
    title: "User-Agent string changed",
    message: `You have switched to the ${useragent} User-Agent string.\n\nPlease restart the app for the changes to take effect.`,
    buttons: ["Later", "Restart"],
  });
  if (updatedialog === 1) {
    app.relaunch();
    app.exit();
  }
}

getValueOrDefault("enterprise-or-normal", "https://microsoft365.com/?auth=1");
getValueOrDefault("autohide-menubar", "false");
getValueOrDefault("useragentstring", useragents.Windows);

const menulayout = [
  {
    label: "Application",
    submenu: [
      {
        label: "About MS-365-Electron",
        click: () => {
          // placeholder
        },
      },
      {
        label: "Check for Updates",
        click: async () => {
          await checkForUpdates();
        },
      },
      {
        label: "Learn More",
        click: async () => {
          await openExternalLink("https://github.com/agam778/MS-365-Electron");
        },
      },
      {
        label: "Open Logs Folder",
        click: async () => {
          await openLogsFolder();
        },
      },
      { type: "separator" },
      {
        label: "Open Normal version of MS 365",
        type: "radio",
        click() {
          store.set("enterprise-or-normal", "https://microsoft365.com/?auth=1");
          dialog.showMessageBoxSync({
            type: "info",
            title: "Normal version of MS 365",
            message:
              "The normal version of MS 365 will be opened.\n\nPlease restart the app to apply the changes.",
            buttons: ["OK"],
          });
        },
        checked:
          store.get("enterprise-or-normal") ===
          "https://microsoft365.com/?auth=1",
      },
      {
        label: "Open Enterprise version of MS 365",
        type: "radio",
        click() {
          store.set("enterprise-or-normal", "https://microsoft365.com/?auth=2");
          dialog.showMessageBoxSync({
            type: "info",
            title: "Enterprise version of MS 365",
            message:
              "The enterprise version of MS 365 will be opened.\n\nPlease restart the app to apply the changes.",
            buttons: ["OK"],
          });
        },
        checked:
          store.get("enterprise-or-normal") ===
          "https://microsoft365.com/?auth=2",
      },
      { type: "separator" },
      {
        label: "Open Websites in New Windows (Recommended)",
        type: "radio",
        click: () => {
          store.set("websites-in-new-window", "true");
          dialog.showMessageBoxSync({
            type: "info",
            title: "Websites in New Windows",
            message:
              "Websites which are targeted to open in new tabs will now open in new windows.",
            buttons: ["OK"],
          });
        },
        checked: store.get("websites-in-new-window")
          ? store.get("websites-in-new-window") === "true"
          : true,
      },
      {
        label: "Open Websites in the Same Window",
        type: "radio",
        click: () => {
          store.set("websites-in-new-window", "false");
          dialog.showMessageBoxSync({
            type: "info",
            title: "Websites in New Windows",
            message:
              "Websites which are targeted to open in new tabs will now open in the same window.\n\nNote: This will be buggy in some cases if you are using Enterprise version of MS 365.",
            buttons: ["OK"],
          });
        },
        checked: store.get("websites-in-new-window")
          ? store.get("websites-in-new-window") === "false"
          : false,
      },
      { type: "separator" },
      {
        label: "Windows User-Agent String",
        type: "radio",
        click: () => {
          setUserAgent(useragents.Windows);
        },
        checked: store.get("useragentstring") === useragents.Windows,
      },
      {
        label: "macOS User-Agent String",
        type: "radio",
        click: () => {
          setUserAgent(useragents.macOS);
        },
        checked: store.get("useragentstring") === useragents.macOS,
      },
      {
        label: "Linux User-Agent String",
        type: "radio",
        click: () => {
          store.set("useragentstring", useragents.Linux);
          dialog.showMessageBoxSync({
            type: "info",
            title: "User agent switcher",
            message:
              "You have switched to Linux Useragent.\n\nPlease restart the app to apply the changes.",
            buttons: ["OK"],
          });
        },
        checked: store.get("useragentstring") === useragents.Linux,
      },
      { type: "separator" },
      {
        role: "quit",
        accelerator: process.platform === "darwin" ? "Ctrl+Q" : "Ctrl+Q",
      },
    ],
  },
  {
    label: "Navigation",
    submenu: [
      {
        label: "Back",
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.goBack();
        },
      },
      {
        label: "Forward",
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.goForward();
        },
      },
      {
        label: "Reload",
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.reload();
        },
      },
      {
        label: "Home",
        click: () => {
          BrowserWindow.getFocusedWindow().loadURL(
            `${store.get("enterprise-or-normal")}`
          );
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(process.platform === "darwin"
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      { role: "resetZoom" },
      {
        role: "zoomIn",
        accelerator: process.platform === "darwin" ? "Control+=" : "Control+=",
      },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...(process.platform === "darwin"
        ? [{ type: "separator" }, { role: "front" }, { type: "separator" }]
        : [{ role: "close" }]),
      ...(!process.platform === "darwin"
        ? [
            { type: "separator" },
            {
              label: "Show Menu Bar",
              type: "radio",
              click: () => {
                store.set("autohide-menubar", "false");
                dialog.showMessageBoxSync({
                  type: "info",
                  title: "Menu Bar Settings",
                  message:
                    "Menu will be visible now. Please restart the app for changes to take effect.",
                  buttons: ["OK"],
                });
              },
              checked: store.get("autohide-menubar") === "false",
            },
            {
              label: "Hide Menu Bar (ALT to show)",
              type: "radio",
              click: () => {
                store.set("autohide-menubar", "true");
                dialog.showMessageBoxSync({
                  type: "info",
                  title: "Menu Bar Settings",
                  message:
                    "Menu bar will be automatically hidden now. Please restart the app for changes to take effect.",
                  buttons: ["OK"],
                });
              },
              checked: store.get("autohide-menubar") === "true",
            },
          ]
        : []),
    ],
  },
];
module.exports = { menulayout };
