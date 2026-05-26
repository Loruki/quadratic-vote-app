'use client';

import {
  ArrowDown,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { downloadAdminBackup } from '@/lib/backup';

interface Props {
  pollId: string;
  adminUrl: string;
  voterUrl: string | null;
  voterMode: 'open' | 'tokenized';
  visibility: 'public' | 'unlisted';
  /** Path to navigate to when the banner is dismissed (admin page sans ?created=1). */
  dismissTo: string;
  pollTitle: string;
}

/**
 * Celebratory "Your poll is live" banner rendered at the top of the admin
 * page when `?created=1` is in the URL. Replaces the old share dialog so
 * the creator can't accidentally dismiss the post-create flow or
 * double-submit the form.
 */
export function PostCreationBanner({
  pollId,
  adminUrl,
  voterUrl,
  voterMode,
  visibility,
  dismissTo,
  pollTitle,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const shown = params.get('created') === '1';
  const { copied, copy } = useCopyToClipboard({
    successMessage: 'Admin link copied — keep it secret.',
  });

  if (!shown) return null;

  const copyAdmin = () => copy(adminUrl);
  const downloadBackup = () =>
    downloadAdminBackup({ pollId, title: pollTitle, adminUrl, voterUrl });
  const dismiss = () => router.replace(dismissTo);

  return (
    <section
      className="relative mb-6 overflow-hidden rounded-3xl bg-grad-brand p-6 text-primary-foreground shadow-brand sm:p-8"
      aria-labelledby="post-creation-heading"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss this banner"
        className="absolute right-3 top-3 rounded-full p-1.5 text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] opacity-90">
        <Sparkles className="h-4 w-4" /> Poll is live
      </div>
      <h2
        id="post-creation-heading"
        className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Save your admin link before you leave.
      </h2>
      <p className="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">
        This page <em>is</em> your admin link — the URL in your address bar. Bookmark it,
        copy it, or download a backup so you can come back and close the poll later. We&apos;ve
        also remembered it in <strong>this browser</strong>, listed under{' '}
        <a href="/my" className="font-semibold underline">/my</a>.
      </p>

      <div className="mt-5 rounded-2xl bg-white/10 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
            Admin link
          </p>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-foreground hover:bg-white/90"
              onClick={copyAdmin}
            >
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
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/15"
              onClick={downloadBackup}
            >
              <Download className="mr-1 h-3.5 w-3.5" /> Backup
            </Button>
          </div>
        </div>
        <input
          readOnly
          value={adminUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-2 w-full select-all rounded-md border border-white/20 bg-white/10 px-2 py-1.5 font-mono text-xs text-primary-foreground placeholder:text-primary-foreground/70 outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Admin URL"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {voterMode === 'open' && voterUrl && (
          <Button
            asChild
            size="lg"
            className="h-11 bg-white text-foreground hover:bg-white/90"
          >
            <a href={voterUrl}>
              Open voter page <ExternalLink className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
        )}
        {voterMode === 'tokenized' && (
          <p className="inline-flex items-center gap-2 text-sm opacity-90">
            <ArrowDown className="h-4 w-4" />
            Personalized voter links are below — copy each, or download as CSV.
          </p>
        )}
        <Button
          variant="ghost"
          className="text-primary-foreground hover:bg-white/15"
          onClick={dismiss}
        >
          Got it <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
        {visibility === 'public' && (
          <span className="ml-auto text-xs font-medium opacity-90">
            Listed on /explore — anyone can vote.
          </span>
        )}
      </div>
    </section>
  );
}
