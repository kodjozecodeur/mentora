'use client';

import katex from 'katex';
import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { DiagnosticContentFormat } from '@/types/diagnostic';

interface MathContentProps {
  content: string;
  contentFormat: DiagnosticContentFormat;
  className?: string;
  displayMode?: boolean;
}

export function MathContent({
  content,
  contentFormat,
  className,
  displayMode = false,
}: MathContentProps) {
  if (contentFormat === 'text') {
    return <span className={className}>{content}</span>;
  }

  const renderedContent = katex.renderToString(content, {
    displayMode,
    throwOnError: false,
  });

  return (
    <ResponsiveLatex
      className={className}
      renderedContent={renderedContent}
      displayMode={displayMode}
    />
  );
}

interface ResponsiveLatexProps {
  className?: string;
  renderedContent: string;
  displayMode: boolean;
}

function ResponsiveLatex({ className, renderedContent, displayMode }: ResponsiveLatexProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    const updateScale = () => {
      const availableWidth = container.clientWidth;
      const contentWidth = content.offsetWidth;

      if (!availableWidth || !contentWidth) return;

      setScale((currentScale) => {
        const nextScale = Math.min(1, availableWidth / contentWidth);
        return Math.abs(currentScale - nextScale) < 0.001 ? currentScale : nextScale;
      });
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, [renderedContent]);

  return (
    <span
      ref={containerRef}
      className={cn('math-content-container', className)}
      data-display-mode={displayMode}
    >
      <span
        ref={contentRef}
        className="math-content"
        style={{ transform: `scale(${scale})` }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </span>
  );
}
