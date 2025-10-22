(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function showTab(tabName) {
    const tabs = qsa('.tab-btn');
    const panels = qsa('.tab-panel');

    panels.forEach(p => p.classList.add('hidden'));
    tabs.forEach(t => t.classList.remove('active'));
    const activePanel = qs(`#content-${tabName}`);
    const activeTab = qs(`.tab-btn[data-tab="${tabName}"]`);

    if (activePanel) activePanel.classList.remove('hidden');
    if (activeTab) activeTab.classList.add('active');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Tab listeners
    qsa('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        showTab(tabName);
        // A11y
        qsa('.tab-btn').forEach(b => b.setAttribute('aria-selected', 'false'));
        btn.setAttribute('aria-selected', 'true');
      });
    });

    // Default tab
    showTab('activity');

    // (Opcional) Sincronizar progresso caso use data-attrs
    // Ex.: <div class="progress-fill" data-progress="85"></div>
    qsa('.progress-fill').forEach(el => {
      const v = Number(el.getAttribute('data-progress'));
      if (!isNaN(v)) {
        el.style.width = Math.max(0, Math.min(100, v)) + '%';
      }
    });
  });
})();
