/** Mount an appearance-only DSH extension; every DOM change has a disposer. */
export function mountTheme(ctx, css, moduleId) {
  ctx.effect(() => {
    const doc = document;
    const win = window;
    const originalAttributes = new Map();
    const originalStyles = new Map();
    const inspected = new WeakSet();
    const key = 'dsh.conversation.contentWidth';
    let disposed = false;
    let frame = null;
    let observer = null;
    const style = doc.createElement('style');
    style.dataset.plugin = moduleId;
    style.dataset.blueHourGlass = '1';
    style.textContent = css;
    doc.head.appendChild(style);

    function attribute(node, name, value) {
      let before = originalAttributes.get(node);
      if (!before) originalAttributes.set(node, before = new Map());
      if (!before.has(name)) before.set(name, node.getAttribute(name));
      if (node.getAttribute(name) !== String(value)) node.setAttribute(name, value);
    }
    function inline(node, name, value) {
      let before = originalStyles.get(node);
      if (!before) originalStyles.set(node, before = new Map());
      if (!before.has(name)) before.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
      node.style.setProperty(name, value, 'important');
    }
    function readPreference() {
      try {
        const raw = win.localStorage.getItem(key);
        const value = raw === null ? NaN : Number(raw);
        return Number.isFinite(value) && value > 0 ? value : null;
      } catch { return null; }
    }
    function dimensions(handle) {
      const body = handle.parentElement;
      const column = body.offsetWidth;
      const max = Math.max(640, column - 176);
      const preference = readPreference();
      const automatic = Math.max(680, Math.min(column * 0.64, 920));
      const value = preference === null ? automatic : Math.max(640, Math.min(preference, max));
      return { body, host: body.parentElement || body, max, automatic, value };
    }
    function updateWidth(handle, requested) {
      const dims = dimensions(handle);
      const value = Math.max(640, Math.min(requested, dims.max));
      try { win.localStorage.setItem(key, String(value)); } catch { /* CSS still updates for this page. */ }
      dims.host.style.setProperty('--dsh-chat-user-width', `${value}px`);
      attribute(handle, 'aria-valuenow', Math.round(value));
    }
    function resetWidth(handle) {
      const dims = dimensions(handle);
      try { win.localStorage.removeItem(key); } catch { /* Preserve the page-local reset. */ }
      dims.host.style.removeProperty('--dsh-chat-user-width');
      attribute(handle, 'aria-valuenow', Math.round(dims.automatic));
    }
    function eventHandle(event) {
      return event.target?.closest?.('[data-width-handle]') || null;
    }
    function doubleClick(event) {
      const handle = eventHandle(event);
      if (!handle) return;
      event.preventDefault();
      // Capture prevents a locally patched host from applying the same gesture twice.
      event.stopPropagation();
      resetWidth(handle);
    }
    function keyDown(event) {
      const handle = eventHandle(event);
      if (!handle || handle.hasAttribute('data-dragging') || event.ctrlKey || event.altKey || event.metaKey) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'Enter'].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Home' || event.key === 'Enter') resetWidth(handle);
      else {
        const direction = (event.key === 'ArrowRight' ? 1 : -1) * (handle.dataset.side === 'right' ? 1 : -1);
        updateWidth(handle, dimensions(handle).value + direction * (event.shiftKey ? 64 : 16));
      }
    }
    function pointerDown(event) {
      const handle = eventHandle(event);
      if (handle && event.button === 0) handle.focus({ preventScroll: true });
    }
    function sync() {
      frame = null;
      if (disposed || !doc.body) return;
      attribute(doc.documentElement, 'data-blue-hour-glass', '1');
      const rail = doc.querySelector('.BynINW_sidebarCol');
      if (rail) {
        attribute(rail, 'data-lg-rail', '1');
        for (const node of rail.querySelectorAll('*')) {
          if (inspected.has(node)) continue;
          inspected.add(node);
          const rect = node.getBoundingClientRect();
          if (rect.height < 8 || rect.height > 160) continue;
          const computed = win.getComputedStyle(node);
          if (computed.backgroundImage.includes('gradient')) inline(node, 'background-image', 'none');
          if ((computed.webkitMaskImage || computed.maskImage || '').includes('gradient')) {
            inline(node, '-webkit-mask-image', 'none');
            inline(node, 'mask-image', 'none');
          }
        }
        for (const node of rail.querySelectorAll('button,[role=button],a,div[tabindex]')) {
          if (!/新会话|New chat|New session/i.test(node.textContent || '')) continue;
          const height = node.getBoundingClientRect().height;
          if (height >= 20 && height <= 70) { attribute(node, 'data-lg-newchat', '1'); break; }
        }
      }
      for (const handle of doc.querySelectorAll('[data-width-handle]')) {
        attribute(handle, 'role', 'separator');
        attribute(handle, 'tabindex', '0');
        attribute(handle, 'aria-orientation', 'vertical');
        attribute(handle, 'aria-label', '调整对话宽度');
        attribute(handle, 'aria-valuemin', '640');
        attribute(handle, 'aria-valuenow', Math.round(dimensions(handle).value));
        attribute(handle, 'title', '拖动调整对话宽度 · 双击恢复默认；左右键微调，Home 恢复默认');
      }
      // Avoid retaining removed conversation trees for the lifetime of the plugin.
      for (const node of originalAttributes.keys()) if (!node.isConnected) originalAttributes.delete(node);
      for (const node of originalStyles.keys()) if (!node.isConnected) originalStyles.delete(node);
    }
    function schedule() { if (!disposed && frame === null) frame = win.requestAnimationFrame(sync); }
    observer = new win.MutationObserver(schedule);
    observer.observe(doc.documentElement, { childList: true, subtree: true });
    doc.addEventListener('dblclick', doubleClick, true);
    doc.addEventListener('keydown', keyDown, true);
    doc.addEventListener('pointerdown', pointerDown, true);
    doc.addEventListener('pointerup', schedule, true);
    doc.addEventListener('focusin', schedule, true);
    win.addEventListener('resize', schedule);
    sync();

    return () => {
      disposed = true;
      observer.disconnect();
      if (frame !== null) win.cancelAnimationFrame(frame);
      doc.removeEventListener('dblclick', doubleClick, true);
      doc.removeEventListener('keydown', keyDown, true);
      doc.removeEventListener('pointerdown', pointerDown, true);
      doc.removeEventListener('pointerup', schedule, true);
      doc.removeEventListener('focusin', schedule, true);
      win.removeEventListener('resize', schedule);
      style.remove();
      for (const [node, properties] of originalStyles) for (const [name, [value, priority]] of properties) {
        if (value) node.style.setProperty(name, value, priority); else node.style.removeProperty(name);
      }
      for (const [node, attributes] of originalAttributes) for (const [name, value] of attributes) {
        if (value === null) node.removeAttribute(name); else node.setAttribute(name, value);
      }
      originalAttributes.clear();
      originalStyles.clear();
    };
  }, 'blue-hour-glass: appearance and discoverable width controls');
}
