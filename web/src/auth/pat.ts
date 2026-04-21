const PAT_KEY = 'gh_pat';
const PAT_CHANGED = 'pat-changed';
const patEvents = new EventTarget();

export function getPat(): string | null {
  return localStorage.getItem(PAT_KEY);
}

export function hasPat(): boolean {
  const v = getPat();
  return v !== null && v.length > 0;
}

export function setPat(v: string): void {
  const trimmed = v.trim();
  if (trimmed.length === 0) return;
  localStorage.setItem(PAT_KEY, trimmed);
  patEvents.dispatchEvent(new Event(PAT_CHANGED));
}

export function clearPat(): void {
  localStorage.removeItem(PAT_KEY);
  patEvents.dispatchEvent(new Event(PAT_CHANGED));
}

export function onPatChanged(listener: () => void): () => void {
  patEvents.addEventListener(PAT_CHANGED, listener);
  return () => {
    patEvents.removeEventListener(PAT_CHANGED, listener);
  };
}

export function maskPat(v: string): string {
  if (v.length <= 8) return '••••';
  return `${v.slice(0, 4)}••••${v.slice(-4)}`;
}

function createToggleButton(input: HTMLInputElement): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pat-toggle';
  btn.textContent = '表示';
  btn.setAttribute('aria-label', 'PAT を表示/非表示');
  btn.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '非表示';
    } else {
      input.type = 'password';
      btn.textContent = '表示';
    }
  });
  return btn;
}

export function renderPatStatusBadge(statusEl: HTMLElement, clearBtn: HTMLButtonElement): void {
  const render = (): void => {
    if (hasPat()) {
      statusEl.textContent = 'PAT: 設定済み ✓';
      statusEl.classList.remove('pat-status--missing');
      statusEl.classList.add('pat-status--ok');
      clearBtn.hidden = false;
    } else {
      statusEl.textContent = 'PAT: 未設定';
      statusEl.classList.remove('pat-status--ok');
      statusEl.classList.add('pat-status--missing');
      clearBtn.hidden = true;
    }
  };
  render();
  onPatChanged(render);
}

export function renderPatPanel(container: HTMLElement): void {
  let editing = false;

  const render = (): void => {
    if (!container.isConnected) return;
    container.innerHTML = '';

    const pat = getPat();
    const isSet = pat !== null && pat.length > 0;
    const showForm = !isSet || editing;

    const panel = document.createElement('div');
    panel.className = `pat-panel ${isSet ? 'pat-panel--ok' : 'pat-panel--missing'}`;

    const heading = document.createElement('h2');
    heading.className = 'pat-panel__heading';
    heading.textContent = 'GitHub PAT';
    panel.appendChild(heading);

    const status = document.createElement('p');
    status.className = 'pat-panel__status';
    if (isSet) {
      const icon = document.createElement('span');
      icon.className = 'pat-panel__icon';
      icon.textContent = '✓';
      status.appendChild(icon);
      status.appendChild(document.createTextNode(' 設定済み '));
      const code = document.createElement('code');
      code.textContent = maskPat(pat);
      status.appendChild(code);
    } else {
      const icon = document.createElement('span');
      icon.className = 'pat-panel__icon';
      icon.textContent = '⚠';
      status.appendChild(icon);
      status.appendChild(document.createTextNode(' 未設定 — 結果保存時に必要です'));
    }
    panel.appendChild(status);

    if (showForm) {
      const form = document.createElement('form');
      form.className = 'pat-panel__form';

      const label = document.createElement('label');
      label.className = 'pat-panel__label';
      label.htmlFor = 'pat-input';
      label.textContent = 'Personal Access Token';
      form.appendChild(label);

      const row = document.createElement('div');
      row.className = 'pat-panel__input-row';

      const input = document.createElement('input');
      input.type = 'password';
      input.id = 'pat-input';
      input.className = 'pat-input';
      input.autocomplete = 'off';
      input.spellcheck = false;
      row.appendChild(input);
      row.appendChild(createToggleButton(input));
      form.appendChild(row);

      const help = document.createElement('p');
      help.className = 'pat-panel__help';
      help.textContent = '保存時にリポジトリへ書き込むため、repo スコープの PAT が必要です。';
      form.appendChild(help);

      const actions = document.createElement('div');
      actions.className = 'pat-panel__actions';

      const saveBtn = document.createElement('button');
      saveBtn.type = 'submit';
      saveBtn.className = 'pat-save-btn';
      saveBtn.textContent = isSet ? '更新して保存' : '保存';
      saveBtn.disabled = true;
      actions.appendChild(saveBtn);

      if (isSet) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'pat-cancel-btn';
        cancelBtn.textContent = 'キャンセル';
        cancelBtn.addEventListener('click', () => {
          editing = false;
          render();
        });
        actions.appendChild(cancelBtn);
      }

      form.appendChild(actions);

      input.addEventListener('input', () => {
        saveBtn.disabled = input.value.trim().length === 0;
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (value.length === 0) return;
        editing = false;
        setPat(value);
      });

      panel.appendChild(form);
      queueMicrotask(() => {
        input.focus();
      });
    } else {
      const actions = document.createElement('div');
      actions.className = 'pat-panel__actions';

      const updateBtn = document.createElement('button');
      updateBtn.type = 'button';
      updateBtn.className = 'pat-update-btn';
      updateBtn.textContent = '更新';
      updateBtn.addEventListener('click', () => {
        editing = true;
        render();
      });
      actions.appendChild(updateBtn);

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'pat-clear-btn';
      clearBtn.textContent = 'クリア';
      clearBtn.addEventListener('click', () => {
        if (confirm('PAT をクリアしますか？')) {
          clearPat();
        }
      });
      actions.appendChild(clearBtn);

      panel.appendChild(actions);
    }

    container.appendChild(panel);
  };

  render();

  const removeListener = onPatChanged(() => {
    if (container.isConnected) {
      render();
    } else {
      removeListener();
    }
  });
}

export async function ensurePat(): Promise<string> {
  const existing = getPat();
  if (existing !== null && existing.length > 0) {
    return existing;
  }

  return new Promise<string>((resolve, reject) => {
    const dialog = document.createElement('dialog');
    dialog.style.cssText =
      'padding: 1.5rem; border-radius: 8px; border: 1px solid #ccc; min-width: 320px;';

    const p = document.createElement('p');
    p.textContent = 'GitHubのPersonal Access Token (PAT) を入力してください';

    const hint = document.createElement('p');
    hint.textContent = 'ホーム画面からも設定・更新できます。';
    hint.style.cssText = 'font-size: 0.85rem; color: #555; margin: 0.25rem 0 0.75rem;';

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 0.5rem; margin: 0.75rem 0;';

    const input = document.createElement('input');
    input.type = 'password';
    input.id = 'pat-input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.style.cssText = 'flex: 1; padding: 0.4rem; box-sizing: border-box;';
    row.appendChild(input);
    row.appendChild(createToggleButton(input));

    const btnRow = document.createElement('div');
    btnRow.style.cssText =
      'display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.75rem;';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'キャンセル';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.textContent = '保存';

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(submitBtn);

    dialog.appendChild(p);
    dialog.appendChild(hint);
    dialog.appendChild(row);
    dialog.appendChild(btnRow);
    document.body.appendChild(dialog);
    dialog.showModal();

    submitBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (value.length === 0) return;
      setPat(value);
      dialog.close();
      document.body.removeChild(dialog);
      resolve(value);
    });

    cancelBtn.addEventListener('click', () => {
      dialog.close();
      document.body.removeChild(dialog);
      reject(new Error('PAT input cancelled'));
    });
  });
}
