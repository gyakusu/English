const PAT_KEY = 'gh_pat';

export function getPat(): string | null {
  return localStorage.getItem(PAT_KEY);
}

export function setPat(v: string): void {
  localStorage.setItem(PAT_KEY, v);
}

export function clearPat(): void {
  localStorage.removeItem(PAT_KEY);
}

export async function ensurePat(): Promise<string> {
  const existing = getPat();
  if (existing !== null) {
    return existing;
  }

  return new Promise<string>((resolve, reject) => {
    const dialog = document.createElement('dialog');
    dialog.style.cssText =
      'padding: 1.5rem; border-radius: 8px; border: 1px solid #ccc; min-width: 320px;';

    const p = document.createElement('p');
    p.textContent = 'GitHubのPersonal Access Token (PAT) を入力してください';

    const input = document.createElement('input');
    input.type = 'password';
    input.id = 'pat-input';
    input.style.cssText =
      'display: block; width: 100%; margin: 0.75rem 0; padding: 0.4rem; box-sizing: border-box;';

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
    dialog.appendChild(input);
    dialog.appendChild(btnRow);
    document.body.appendChild(dialog);
    dialog.showModal();

    submitBtn.addEventListener('click', () => {
      const value = input.value.trim();
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
