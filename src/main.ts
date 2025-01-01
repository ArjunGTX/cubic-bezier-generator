import "./style.css";

let curveValue = "";

const copyButton = document.getElementById("copy-btn");
copyButton?.addEventListener("click", function () {
  navigator.clipboard.writeText(curveValue);
  this.textContent = "Copied!";
  setTimeout(() => {
    this.textContent = "Copy";
  }, 1000);
});
