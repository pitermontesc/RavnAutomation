import * as path from 'path';
import type { Page, Locator } from '@playwright/test';

function randomEmail() {
  return `qa.auto.${Date.now()}@example.com`;
}

export async function fillRequiredFieldsByAsterisk(page: Page, form: Locator) {
  const resumePath = path.resolve(process.cwd(), 'test-data', 'resume.txt');

  // Cada bloque requerido tiene: label + span(*) + input/select/button
  const requiredBlocks = form.locator('div.space-y-2', {
    has: form.locator('span', { hasText: '*' })
  });

  const count = await requiredBlocks.count();

  for (let i = 0; i < count; i++) {
    const block = requiredBlocks.nth(i);

    // 1) File upload
    const file = block.locator('input[type="file"]');
    if (await file.count()) {
      await file.setInputFiles(resumePath);
      continue;
    }

    // 2) Hidden select (para Radix combobox)
    const hiddenSelect = block.locator('select[aria-hidden="true"]');
    if (await hiddenSelect.count()) {
      // elige la primera opción disponible
      const firstValue = await hiddenSelect.locator('option').first().getAttribute('value');
      if (firstValue) await hiddenSelect.selectOption(firstValue);
      continue;
    }

    // 3) Normal input (text/email/tel)
    const input = block.locator('input').first();
    if (await input.count()) {
      const type = (await input.getAttribute('type'))?.toLowerCase() ?? 'text';
      const name = (await input.getAttribute('name')) ?? '';

      if (type === 'email' || name.toLowerCase().includes('email')) {
        await input.fill(randomEmail());
      } else if (type === 'tel' || name.toLowerCase().includes('phone')) {
        await input.fill('+591 70000000');
      } else if (name.toLowerCase().includes('city')) {
        await input.fill('Cochabamba');
      } else if (name.toLowerCase().includes('first')) {
        await input.fill('Piter');
      } else if (name.toLowerCase().includes('last')) {
        await input.fill('Montes');
      } else {
        await input.fill('Test Value');
      }
      continue;
    }

    // 4) Si no encontramos nada, lo dejamos para debug
    const label = (await block.locator('label').first().textContent())?.trim();
    console.log(`⚠️ No pude llenar el campo requerido: ${label ?? '(sin label)'}`);
  }
}

export async function assertRequiredFieldsByAsteriskHaveValue(form: Locator) {
    const requiredBlocks = form.locator('div.space-y-2', {
      has: form.locator('span', { hasText: '*' })
    });
  
    const count = await requiredBlocks.count();
  
    for (let i = 0; i < count; i++) {
      const block = requiredBlocks.nth(i);
  
      const file = block.locator('input[type="file"]');
      if (await file.count()) {
        // en file input no puedes leer value de forma confiable; valida que exista "files" via JS
        const hasFiles = await file.evaluate((el: HTMLInputElement) => (el.files?.length ?? 0) > 0);
        if (!hasFiles) throw new Error('Resume/CV requerido no fue cargado');
        continue;
      }
  
      const hiddenSelect = block.locator('select[aria-hidden="true"]');
      if (await hiddenSelect.count()) {
        const val = await hiddenSelect.inputValue();
        if (!val) throw new Error('Select requerido está vacío');
        continue;
      }
  
      const input = block.locator('input').first();
      if (await input.count()) {
        const val = await input.inputValue();
        if (!val) throw new Error('Input requerido está vacío');
        continue;
      }
    }
  }
  