import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadStudyPack } from './downloadStudyPack';

function createFakeWindow(openReturns: 'window' | 'null') {
  const calls: string[] = [];
  const fakeTarget = {
    document: {
      open: vi.fn(() => calls.push('document.open')),
      write: vi.fn((html: string) => calls.push(`document.write:${html}`)),
      close: vi.fn(() => calls.push('document.close')),
    },
    focus: vi.fn(() => calls.push('focus')),
    print: vi.fn(() => calls.push('print')),
  };
  const open = vi.fn(() => (openReturns === 'window' ? fakeTarget : null));
  return { open, fakeTarget, calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('downloadStudyPack', () => {
  it('opens a window, writes the HTML, then triggers print in order', () => {
    const { open, fakeTarget, calls } = createFakeWindow('window');
    vi.stubGlobal('window', { open });

    downloadStudyPack('<html>test</html>');

    expect(calls).toEqual([
      'document.open',
      'document.write:<html>test</html>',
      'document.close',
      'focus',
      'print',
    ]);
    expect(fakeTarget.document.write).toHaveBeenCalledWith('<html>test</html>');
  });

  it('defaults to opening a "_blank" window', () => {
    const { open } = createFakeWindow('window');
    vi.stubGlobal('window', { open });

    downloadStudyPack('<html></html>');

    expect(open).toHaveBeenCalledWith('', '_blank');
  });

  it('passes a custom window name through to window.open', () => {
    const { open } = createFakeWindow('window');
    vi.stubGlobal('window', { open });

    downloadStudyPack('<html></html>', { windowName: 'study-pack' });

    expect(open).toHaveBeenCalledWith('', 'study-pack');
  });

  it('throws a descriptive error when the popup is blocked', () => {
    const { open } = createFakeWindow('null');
    vi.stubGlobal('window', { open });

    expect(() => downloadStudyPack('<html></html>')).toThrow(/bloqueur de fenêtres/);
  });
});
