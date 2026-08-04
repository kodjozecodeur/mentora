'use client';

import { useEffect, useRef } from 'react';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface ConfirmationDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationDialog({ open, onCancel, onConfirm }: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelector<HTMLButtonElement>('[data-dialog-cancel]')?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      open
      aria-modal="true"
      aria-labelledby="restart-diagnostic-title"
      aria-describedby="restart-diagnostic-message"
      onCancel={onCancel}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
        }
      }}
      className="fixed inset-0 z-[60] m-0 flex h-dvh w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <div className="bg-foreground/50 absolute inset-0" aria-hidden="true" />
      <div className="bg-surface border-border relative flex w-full max-w-[380px] flex-col gap-5 rounded-3xl border-2 p-5 shadow-[0_16px_40px_rgba(36,21,42,0.2)]">
        <div className="flex flex-col gap-2">
          <h2 id="restart-diagnostic-title" className="text-foreground text-xl font-bold">
            Refaire le diagnostic ?
          </h2>
          <p id="restart-diagnostic-message" className="text-muted text-sm leading-6 font-medium">
            Votre diagnostic actuel ainsi que votre progression seront remplacés.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <SecondaryButton data-dialog-cancel onClick={onCancel}>
            Annuler
          </SecondaryButton>
          <PrimaryButton onClick={onConfirm}>Refaire le diagnostic</PrimaryButton>
        </div>
      </div>
    </dialog>
  );
}
