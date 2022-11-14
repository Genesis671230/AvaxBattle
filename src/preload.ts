// All of the Node.js APIs are available in the preload process.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ipcRenderer } from "electron/renderer";

// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(
      `${type}-version`,
      process.versions[type as keyof NodeJS.ProcessVersions]
    );
  }

  document.getElementById("config_csv").addEventListener("click", () => {
    ipcRenderer.invoke("openDialog", "Please open the dialog");
  });

  document.getElementById("submit").addEventListener("click", () => {
    const startDate = document.getElementById("start_date");
    const endDate = document.getElementById("end_date");
    const pullDataBy = document.getElementById("styledSelect1");
    const pullDataByValue = document.getElementById("pull_data_by_value");
    const symbol = document.getElementById("styledSelectSymbol");
    document.getElementById("submit").value = "Loading...";
    ipcRenderer.invoke("generateCsv", {
      startDate: startDate.value,
      endDate: endDate.value,
      pullDataBy: pullDataBy.value,
      pullDataByValue: pullDataByValue.value,
      symbol: symbol.value,
    });
  });
});

ipcRenderer.on("csvGenerated", () => {
  document.getElementById("submit").value = "Submit";
});
