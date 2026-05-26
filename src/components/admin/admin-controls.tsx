'use client';

import {
  Check,
  CircleDashed,
  CircleDot,
  ClipboardCopy,
  Copy,
  Download,
  Lock,
  Unlock,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { downloadVoterTokensCsv } from '@/lib/backup';

interface TokenEntry {
  token: string;
  label: string | null;
  consumedAt: string | null;
}

interface Props {
  pollId: string;
  token: string;
  /** Resolved server-side from request headers — passed in so the URLs
   *  rendered here match between SSR and client (no hydration mismatch). */
  origin: string;
  isClosed: boolean;
  voterCount: number;
  voterMode: 'open' | 'tokenized';
  tokens: TokenEntry[];
}

export function AdminControls({
  pollId,
  token,
  origin,
  isClosed,
  voterCount,
  voterMode,
  tokens,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function toggle() {
    const res = await fetch(`/api/polls/${pollId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isClosed: !isClosed }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Failed' }));
      toast.error(body.error ?? 'Failed to update poll');
      return;
    }
    toast.success(!isClosed ? 'Poll closed' : 'Poll reopened');
    startTransition(() => router.refresh());
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-xs text-muted-foreground">
              {isClosed ? 'Closed — voting disabled' : 'Open — voters can submit'} ·{' '}
              {voterCount} {voterCount === 1 ? 'voter' : 'voters'} so far
            </p>
          </div>
          <Button
            onClick={() => startTransition(toggle)}
            disabled={pending}
            variant={isClosed ? 'default' : 'outline'}
          >
            {isClosed ? (
              <>
                <Unlock className="mr-1.5 h-4 w-4" /> Reopen
              </>
            ) : (
              <>
                <Lock className="mr-1.5 h-4 w-4" /> Close poll
              </>
            )}
          </Button>
        </div>
      </div>

      {voterMode === 'open' ? (
        <OpenVoterLink pollId={pollId} origin={origin} />
      ) : (
        <TokenizedVoterList pollId={pollId} origin={origin} tokens={tokens} />
      )}
    </section>
  );
}

function OpenVoterLink({ pollId, origin }: { pollId: string; origin: string }) {
  const url = `${origin}/poll/${pollId}`;
  const { copied, copy } = useCopyToClipboard({ successMessage: 'Voter link copied' });
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Voter link</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Anyone with this link can vote — one ballot per browser.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => copy(url)}>
          {copied ? (
            <>
              <Check className="mr-1 h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3.5 w-3.5" /> Copy
            </>
          )}
        </Button>
      </div>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-2 w-full select-all rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/40"
        aria-label="Voter link URL"
      />
    </div>
  );
}

function TokenizedVoterList({
  pollId,
  origin,
  tokens,
}: {
  pollId: string;
  origin: string;
  tokens: TokenEntry[];
}) {
  const stats = useMemo(() => {
    const total = tokens.length;
    const voted = tokens.filter((t) => t.consumedAt).length;
    return { total, voted, pending: total - voted };
  }, [tokens]);

  const urlFor = (t: TokenEntry) => `${origin}/poll/${pollId}/v/${t.token}`;

  const { copy: copyRow } = useCopyToClipboard({
    successMessage: 'Link copied',
    toastOnSuccess: false,
  });
  // Track which specific row triggered the last copy so only its check icon
  // flips. The hook's `copied` flag isn't per-row, hence the local state.
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  async function copyOne(t: TokenEntry) {
    const ok = await copyRow(urlFor(t));
    if (ok) {
      setCopiedToken(t.token);
      setTimeout(() => setCopiedToken((cur) => (cur === t.token ? null : cur)), 1200);
    }
  }

  async function copyAllPending() {
    const lines = tokens
      .filter((t) => !t.consumedAt)
      .map((t) => (t.label ? `${t.label}: ${urlFor(t)}` : urlFor(t)));
    if (lines.length === 0) {
      toast.message('All voters have already voted.');
      return;
    }
    await copyAll(lines.join('\n'), `${lines.length} unused link${lines.length === 1 ? '' : 's'} copied`);
  }

  function exportCsv() {
    downloadVoterTokensCsv(
      pollId,
      tokens.map((t) => ({ url: urlFor(t), label: t.label, consumedAt: t.consumedAt })),
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            <Users className="mr-1 inline h-3.5 w-3.5 text-primary" />
            Voter links ({stats.total})
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            <span className="text-foreground font-medium">{stats.voted}</span> voted ·{' '}
            <span className="text-foreground font-medium">{stats.pending}</span> pending
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={copyAllPending}
            disabled={stats.pending === 0}
          >
            <ClipboardCopy className="mr-1 h-3.5 w-3.5" /> Copy pending
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={exportCsv}>
            <Download className="mr-1 h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {tokens.map((t, idx) => {
          const url = urlFor(t);
          const voted = !!t.consumedAt;
          const isThisRowCopied = copiedToken === t.token;
          return (
            <li
              key={t.token}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5"
            >
              <span
                className={`shrink-0 ${voted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                aria-label={voted ? 'Voted' : 'Pending'}
              >
                {voted ? (
                  <CircleDot className="h-3.5 w-3.5" />
                ) : (
                  <CircleDashed className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                className={`w-24 shrink-0 truncate text-xs font-medium ${voted ? 'text-muted-foreground line-through' : 'text-foreground'}`}
              >
                {t.label ?? `Voter ${idx + 1}`}
              </span>
              <code className="flex-1 truncate font-mono text-[11px] text-muted-foreground">
                {url}
              </code>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2"
                onClick={() => copyOne(t)}
                disabled={voted}
                aria-label={
                  voted
                    ? 'This link has already been used'
                    : `Copy link for ${t.label ?? `Voter ${idx + 1}`}`
                }
              >
                {isThisRowCopied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Used links automatically expire. To replace a lost link, copy the row — but note
        anyone with the URL can still vote (until used).
      </p>
    </div>
  );
}

async function copyAll(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error('Could not copy. Tap a row to select its URL, then long-press to copy.');
  }
}

