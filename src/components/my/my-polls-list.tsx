'use client';

import { formatDistanceToNowStrict } from 'date-fns';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  KeyRound,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { useIsClient } from '@/hooks/use-is-client';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadAdminBackup } from '@/lib/backup';
import {
  getMyPollsServerSnapshot,
  getMyPollsSnapshot,
  removeMyPoll,
  subscribeMyPolls,
  type SavedPoll,
} from '@/lib/my-polls';

export function MyPollsList() {
  // useSyncExternalStore handles SSR/CSR correctly on its own: server +
  // hydration use the server snapshot, subsequent client renders use the
  // live snapshot. We add `isClient` only so the *initial* HTML shown is a
  // neutral skeleton (not "no polls yet") — if the user already has saved
  // polls in localStorage, they won't see a wrong empty state for a frame.
  const polls = useSyncExternalStore(
    subscribeMyPolls,
    getMyPollsSnapshot,
    getMyPollsServerSnapshot,
  );
  const isClient = useIsClient();
  const { copy } = useCopyToClipboard({ successMessage: 'Admin link copied', toastOnSuccess: true });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  async function copyAdmin(p: SavedPoll) {
    const ok = await copy(p.adminUrl);
    if (ok) {
      setCopiedId(p.pollId);
      setTimeout(() => setCopiedId((cur) => (cur === p.pollId ? null : cur)), 1500);
    }
  }

  function downloadBackup(p: SavedPoll) {
    downloadAdminBackup({
      pollId: p.pollId,
      title: p.title,
      createdAt: p.createdAt,
      adminUrl: p.adminUrl,
      voterUrl: p.voterUrl,
    });
  }

  function remove(pollId: string) {
    removeMyPoll(pollId);
    setConfirmingDelete(null);
    toast.success('Removed from this browser. The poll itself still exists online.');
  }

  if (!isClient) {
    // Render a placeholder that matches the empty state's shell so the
    // server output and the first client render are byte-identical.
    return (
      <div
        className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground"
        aria-hidden
      >
        &nbsp;
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-primary" />
        <p className="mt-3 text-base font-medium">No polls saved here yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first poll — its admin link will land here automatically.
        </p>
        <Button
          asChild
          className="mt-4 bg-grad-brand text-primary-foreground shadow-soft hover:opacity-95"
        >
          <Link href="/create">
            Create a poll <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3" role="list">
      {polls.map((p) => {
        const isCopied = copiedId === p.pollId;
        const isConfirming = confirmingDelete === p.pollId;
        return (
          <li
            key={p.pollId}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/poll/${p.pollId}/results`}
                    className="truncate text-base font-semibold hover:underline"
                  >
                    {p.title}
                  </Link>
                  {p.voterMode === 'tokenized' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-grad-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <KeyRound className="h-3 w-3" /> Tokenized
                    </span>
                  )}
                  {p.visibility === 'public' && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Public
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {timeAgo(p.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button asChild size="sm" variant="outline">
                  <a href={p.adminUrl}>
                    Admin <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/poll/${p.pollId}/results`}>Results</Link>
                </Button>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-amber-300/60 bg-amber-50/40 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="mr-1 inline h-3 w-3" /> Admin link · keep secret
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => copyAdmin(p)}>
                    {isCopied ? (
                      <>
                        <Check className="mr-1 h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadBackup(p)}>
                    <Download className="mr-1 h-3.5 w-3.5" /> Backup
                  </Button>
                </div>
              </div>
              <input
                readOnly
                value={p.adminUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="mt-2 w-full select-all rounded-md border border-border bg-background px-2 py-1.5 font-mono text-[11px] text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                aria-label="Admin URL"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              {p.voterUrl ? (
                <a
                  href={p.voterUrl}
                  className="font-mono truncate hover:text-foreground"
                  title={p.voterUrl}
                >
                  {p.voterUrl}
                </a>
              ) : (
                <span>Tokenized poll — copy individual voter links from the admin page.</span>
              )}
              {isConfirming ? (
                <span className="inline-flex items-center gap-1">
                  <span>Remove from this browser?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-2"
                    onClick={() => remove(p.pollId)}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => setConfirmingDelete(null)}
                  >
                    Cancel
                  </Button>
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-muted-foreground"
                  onClick={() => setConfirmingDelete(p.pollId)}
                  aria-label="Remove from this browser"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function timeAgo(iso: string): string {
  try {
    return `${formatDistanceToNowStrict(new Date(iso), { addSuffix: true })}`;
  } catch {
    return new Date(iso).toLocaleString();
  }
}
