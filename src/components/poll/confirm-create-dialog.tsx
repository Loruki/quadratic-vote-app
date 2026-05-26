'use client';

import { AlertTriangle, Coins, Globe, KeyRound, Link2, List, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ConfirmPayload {
  title: string;
  options: string[];
  creditsPerVoter: number;
  voterMode: 'open' | 'tokenized';
  visibility: 'public' | 'unlisted';
  voterCount?: number; // number of named voters, tokenized only
}

interface Props {
  open: boolean;
  payload: ConfirmPayload | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmCreateDialog({ open, payload, submitting, onCancel, onConfirm }: Props) {
  if (!payload) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onCancel()}>
      <DialogContent showCloseButton={!submitting} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ready to create this poll?</DialogTitle>
          <DialogDescription>
            Once it&apos;s live you can close it or reopen it, but the title, options, and
            credit budget can&apos;t be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold leading-snug">{payload.title}</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {payload.options.slice(0, 6).map((o, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-grad-brand-soft font-mono text-[10px] font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <span className="truncate">{o}</span>
                </li>
              ))}
              {payload.options.length > 6 && (
                <li className="pl-5.5 text-muted-foreground/70">
                  + {payload.options.length - 6} more
                </li>
              )}
            </ul>
          </div>

          <ul className="space-y-1.5 text-xs">
            <SummaryRow
              icon={<List className="h-3.5 w-3.5" />}
              label="Options"
              value={`${payload.options.length}`}
            />
            <SummaryRow
              icon={<Coins className="h-3.5 w-3.5" />}
              label="Credits per voter"
              value={`${payload.creditsPerVoter}`}
            />
            <SummaryRow
              icon={
                payload.voterMode === 'open' ? (
                  <Link2 className="h-3.5 w-3.5" />
                ) : (
                  <Users className="h-3.5 w-3.5" />
                )
              }
              label="Who can vote"
              value={
                payload.voterMode === 'open'
                  ? 'Anyone with the link'
                  : `${payload.voterCount ?? 0} specific people`
              }
            />
            <SummaryRow
              icon={
                payload.visibility === 'public' ? (
                  <Globe className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )
              }
              label="Discoverability"
              value={payload.visibility === 'public' ? 'Public — on /explore' : 'Unlisted'}
            />
          </ul>

          <div className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50/40 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              You&apos;ll get an admin link to manage the poll. Save it — it&apos;s the only
              way back. We&apos;ll also remember this poll in <strong>this browser</strong> at{' '}
              <code className="rounded bg-amber-100/60 px-1 py-0.5 font-mono text-[10px] dark:bg-amber-900/40">
                /my
              </code>
              .
              {payload.voterMode === 'tokenized' && (
                <>
                  {' '}
                  <KeyRound className="inline h-3 w-3" /> Each of the{' '}
                  {payload.voterCount ?? 0} voters will get a single-use link.
                </>
              )}
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Keep editing
          </Button>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="bg-grad-brand text-primary-foreground shadow-brand hover:opacity-95"
          >
            Yes, create poll →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md px-1 py-0.5">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </li>
  );
}
