'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Link2, Lock, Plus, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  CREDIT_OPTIONS,
  DEFAULT_CREDITS,
  MAX_OPTIONS,
  MAX_VOTERS_TOKENIZED,
  MIN_OPTIONS,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addMyPoll } from '@/lib/my-polls';
import { ConfirmCreateDialog, type ConfirmPayload } from './confirm-create-dialog';
import { CreationProgress } from './creation-progress';

const formSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  description: z.string().trim().max(2000).optional(),
  creditsPerVoter: z.number().int(),
  visibility: z.enum(['public', 'unlisted']),
  voterMode: z.enum(['open', 'tokenized']),
  voters: z.string().optional(),
  options: z
    .array(z.object({ value: z.string().trim().min(1, 'Option cannot be empty').max(140) }))
    .min(MIN_OPTIONS, `At least ${MIN_OPTIONS} options required`)
    .max(MAX_OPTIONS, `At most ${MAX_OPTIONS} options allowed`),
});

type FormValues = z.infer<typeof formSchema>;

function parseVoterList(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_VOTERS_TOKENIZED);
}

// Minimum on-screen time for the creation overlay. Even on a fast localhost
// the steps still play out in full so the user doesn't wonder "did it work?".
const MIN_CREATION_OVERLAY_MS = 1500;

export function CreatePollForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState<ConfirmPayload | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      creditsPerVoter: DEFAULT_CREDITS,
      visibility: 'unlisted',
      voterMode: 'open',
      voters: '',
      options: [{ value: '' }, { value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  // Step 1: the visible "Create poll" button only opens the confirmation
  // dialog with a summary. We don't hit the server until the user confirms.
  const onPreviewSubmit = form.handleSubmit((values) => {
    const voters =
      values.voterMode === 'tokenized' ? parseVoterList(values.voters ?? '') : [];
    if (values.voterMode === 'tokenized' && voters.length === 0) {
      toast.error('Add at least one voter name (one per line)');
      return;
    }
    setConfirming({
      title: values.title,
      options: values.options.map((o) => o.value),
      creditsPerVoter: values.creditsPerVoter,
      voterMode: values.voterMode,
      visibility: values.visibility,
      voterCount: voters.length || undefined,
    });
  });

  // Step 2: once confirmed, fire the API call and show the progress overlay.
  // Both the API and a 1.5s timer run in parallel — we navigate when both
  // resolve, so even a 50ms request still sees the full animation.
  async function performCreate() {
    if (!confirming) return;
    setSubmitting(true);
    setShowProgress(true);

    const minDelay = new Promise((r) => setTimeout(r, MIN_CREATION_OVERLAY_MS));

    try {
      const values = form.getValues();
      const voters =
        values.voterMode === 'tokenized' ? parseVoterList(values.voters ?? '') : [];

      const apiCall = fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description || undefined,
          creditsPerVoter: values.creditsPerVoter,
          visibility: values.visibility,
          voterMode: values.voterMode,
          voters: values.voterMode === 'tokenized' ? voters : undefined,
          options: values.options.map((o) => o.value),
        }),
      });

      const [res] = await Promise.all([apiCall, minDelay]);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to create poll' }));
        toast.error(body.error ?? 'Failed to create poll');
        setShowProgress(false);
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const adminUrl = `${origin}${data.adminUrl}`;
      const voterUrl = data.voterUrl ? `${origin}${data.voterUrl}` : null;

      addMyPoll({
        pollId: data.id,
        title: values.title,
        adminUrl,
        voterUrl,
        voterMode: data.voterMode,
        visibility: data.visibility,
        createdAt: new Date().toISOString(),
      });

      // Keep the overlay visible through the navigation so there's no flash
      // of the empty create form between unmount and the new page paint.
      router.push(`${data.adminUrl}?created=1`);
    } catch {
      toast.error('Network error. Try again.');
      setShowProgress(false);
      setSubmitting(false);
    }
  }

  const credits = form.watch('creditsPerVoter');
  const voterMode = form.watch('voterMode');
  const visibility = form.watch('visibility');

  return (
    <form onSubmit={onPreviewSubmit} className="space-y-8" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Poll title</Label>
        <Input
          id="title"
          placeholder="e.g. Which features should we ship in Q2?"
          {...form.register('title')}
          aria-invalid={!!form.formState.errors.title}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="A sentence or two to give voters context."
          className="flex w-full min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          {...form.register('description')}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Options ({fields.length})</Label>
          <span className="text-xs text-muted-foreground">
            {MIN_OPTIONS}–{MAX_OPTIONS} options
          </span>
        </div>
        <div className="space-y-2">
          {fields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input
                placeholder={`Option ${idx + 1}`}
                {...form.register(`options.${idx}.value`)}
                aria-label={`Option ${idx + 1}`}
                aria-invalid={!!form.formState.errors.options?.[idx]?.value}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
                disabled={fields.length <= MIN_OPTIONS}
                aria-label={`Delete option ${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {form.formState.errors.options && typeof form.formState.errors.options.message === 'string' && (
          <p className="text-sm text-destructive">{form.formState.errors.options.message}</p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ value: '' })}
          disabled={fields.length >= MAX_OPTIONS}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Add option
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Credits per voter</Label>
        <div className="grid grid-cols-5 gap-2">
          {CREDIT_OPTIONS.map((c) => {
            const active = credits === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => form.setValue('creditsPerVoter', c, { shouldDirty: true })}
                className={`rounded-xl border px-2 py-3 text-sm font-semibold tabular-nums transition-all ${
                  active
                    ? 'border-transparent bg-grad-brand text-primary-foreground shadow-brand'
                    : 'border-border bg-card hover:bg-muted'
                }`}
                aria-pressed={active}
              >
                {c}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          More credits = more nuance. <span className="font-medium text-foreground">100</span>{' '}
          is a good default — a voter can put up to{' '}
          <span className="font-medium text-foreground">{Math.floor(Math.sqrt(credits))}</span>{' '}
          votes on a single option.
        </p>
      </div>

      {/* Who can vote */}
      <div className="space-y-3">
        <Label>Who can vote?</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <OptionTile
            active={voterMode === 'open'}
            onClick={() => form.setValue('voterMode', 'open', { shouldDirty: true })}
            icon={<Link2 className="h-4 w-4" />}
            title="Anyone with the link"
            body="Cookie-based identity. One vote per browser. Easiest to share casually."
          />
          <OptionTile
            active={voterMode === 'tokenized'}
            onClick={() => form.setValue('voterMode', 'tokenized', { shouldDirty: true })}
            icon={<Users className="h-4 w-4" />}
            title="Specific people"
            body="Each voter gets a personal link that burns on submit. True one-vote-per-person."
          />
        </div>

        {voterMode === 'tokenized' && (
          <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-4">
            <Label htmlFor="voters" className="text-sm font-medium">
              Voter list — one name per line
            </Label>
            <textarea
              id="voters"
              rows={6}
              placeholder={'Alice\nBob\nCharlie\nDan'}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              {...form.register('voters')}
            />
            <p className="text-xs text-muted-foreground">
              You&apos;ll get one personalized link per name to distribute via Slack, email, etc.
              Each link can only be used once. Max {MAX_VOTERS_TOKENIZED}.
            </p>
          </div>
        )}
      </div>

      {/* Visibility */}
      <div className="space-y-3">
        <Label>Discoverability</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <OptionTile
            active={visibility === 'unlisted'}
            onClick={() => form.setValue('visibility', 'unlisted', { shouldDirty: true })}
            icon={<Lock className="h-4 w-4" />}
            title="Unlisted"
            body="Only people with the link can find it. Default for team / group decisions."
          />
          <OptionTile
            active={visibility === 'public' && voterMode === 'open'}
            disabled={voterMode === 'tokenized'}
            onClick={() => form.setValue('visibility', 'public', { shouldDirty: true })}
            icon={<Globe className="h-4 w-4" />}
            title="Public"
            body={
              voterMode === 'tokenized'
                ? 'Not available for tokenized polls.'
                : 'Listed on the Explore page. Anyone on the internet can vote.'
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/')}
          className="sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-grad-brand text-primary-foreground shadow-brand hover:opacity-95 sm:w-auto"
        >
          Review &amp; create →
        </Button>
      </div>

      <ConfirmCreateDialog
        open={!!confirming && !showProgress}
        payload={confirming}
        submitting={submitting}
        onCancel={() => setConfirming(null)}
        onConfirm={performCreate}
      />

      <CreationProgress
        open={showProgress}
        steps={
          voterMode === 'tokenized'
            ? [
                'Validating your poll',
                `Generating ${form.getValues('voters')?.split(/\r?\n/).filter(Boolean).length ?? 0} personalized voter links`,
                'Saving to this browser',
                'Done — taking you to your admin page',
              ]
            : [
                'Validating your poll',
                'Creating your shareable link',
                'Saving to this browser',
                'Done — taking you to your admin page',
              ]
        }
      />
    </form>
  );
}

function OptionTile({
  active,
  disabled,
  onClick,
  icon,
  title,
  body,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`group rounded-2xl border bg-card p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? 'border-transparent bg-grad-brand-soft ring-2 ring-primary/40 shadow-soft'
          : 'border-border hover:border-primary/30 hover:shadow-soft'
      }`}
    >
      <div
        className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${
          active ? 'bg-grad-brand text-primary-foreground' : 'bg-muted text-primary'
        }`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </button>
  );
}
