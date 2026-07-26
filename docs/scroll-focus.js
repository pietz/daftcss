document.addEventListener("DOMContentLoaded", () => {
  const syncFocusability = (pre) => {
    const overflows = pre.scrollWidth > pre.clientWidth || pre.scrollHeight > pre.clientHeight;

    if (overflows && !pre.hasAttribute("tabindex")) {
      pre.tabIndex = 0;
      pre.dataset.scrollFocus = "";
    } else if (!overflows && pre.hasAttribute("data-scroll-focus")) {
      pre.removeAttribute("tabindex");
      delete pre.dataset.scrollFocus;
    }
  };

  const observer = new ResizeObserver((entries) => {
    for (const { target } of entries) syncFocusability(target);
  });

  for (const pre of document.querySelectorAll("pre")) {
    syncFocusability(pre);
    observer.observe(pre);
  }
});
