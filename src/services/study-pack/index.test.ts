import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportStudyPackToPdf } from './index';
import { fixtureBuildStudyPackInput } from './testFixtures';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exportStudyPackToPdf', () => {
  it('runs the full pipeline and opens the print window with the rendered HTML', () => {
    const write = vi.fn();
    const fakeTarget = {
      document: { open: vi.fn(), write, close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    };
    const open = vi.fn(() => fakeTarget);
    vi.stubGlobal('window', { open });

    exportStudyPackToPdf(fixtureBuildStudyPackInput);

    expect(open).toHaveBeenCalled();
    const html = write.mock.calls[0][0] as string;
    expect(html).toContain('Mentora');
    expect(html).toContain('Calcul littéral');
    expect(html).toContain('Corrigés');
    expect(fakeTarget.print).toHaveBeenCalled();
  });

  it('propagates a popup-blocked error instead of swallowing it', () => {
    vi.stubGlobal('window', { open: vi.fn(() => null) });
    expect(() => exportStudyPackToPdf(fixtureBuildStudyPackInput)).toThrow(/bloqueur de fenêtres/);
  });
});
