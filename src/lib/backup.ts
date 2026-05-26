/**
 * Client-side download helpers for poll backup artifacts.
 *
 * Centralizes the "Quadratic Vote — admin backup" text format and the CSV
 * voter-link export. Previously inlined in 3+ components with subtly
 * different field orders; consolidating prevents the artifacts from drifting
 * apart and makes the format easy to extend (e.g. add closesAt).
 */

export interface AdminBackupInput {
  pollId: string;
  title: string;
  /** ISO timestamp — defaults to now() if omitted. */
  createdAt?: string;
  adminUrl: string;
  /** Null for tokenized polls (no global voter URL). */
  voterUrl: string | null;
  /** Optional list of personalized voter links for tokenized polls. */
  voterTokens?: { url: string; label: string | null }[];
}

export interface VoterTokenRow {
  url: string;
  label: string | null;
  /** ISO consumed-at timestamp; null/undefined means still pending. */
  consumedAt?: string | null;
}

/**
 * Trigger a `.txt` download containing the admin link and any voter links.
 * Safe to call from event handlers — no React state involved.
 */
export function downloadAdminBackup(input: AdminBackupInput): void {
  const lines = [
    `Quadratic Vote — admin backup`,
    `Poll: ${input.title}`,
    `Poll ID: ${input.pollId}`,
    `Saved: ${input.createdAt ?? new Date().toISOString()}`,
    ``,
    `Admin link (keep secret — only way to close the poll later):`,
    input.adminUrl,
    ``,
  ];

  if (input.voterUrl) {
    lines.push(`Voter link (share with voters):`);
    lines.push(input.voterUrl);
  } else if (input.voterTokens && input.voterTokens.length > 0) {
    lines.push(`Voter links (${input.voterTokens.length} personalized — one per voter):`);
    for (const t of input.voterTokens) {
      lines.push(t.label ? `  ${t.label}: ${t.url}` : `  ${t.url}`);
    }
  } else {
    lines.push(`Voter links: tokenized — see the admin page for per-voter links.`);
  }

  triggerDownload({
    body: lines.join('\n'),
    mime: 'text/plain',
    filename: `qv-admin-${safeFilenameFragment(input.title) || input.pollId}.txt`,
  });
}

/**
 * Trigger a `.csv` download of all voter tokens for a tokenized poll.
 * Header: `label,status,url` where status is `voted` or `pending`.
 */
export function downloadVoterTokensCsv(pollId: string, tokens: VoterTokenRow[]): void {
  const header = 'label,status,url';
  const rows = tokens.map((t) => {
    const status = t.consumedAt ? 'voted' : 'pending';
    return `${csvCell(t.label ?? '')},${status},${csvCell(t.url)}`;
  });
  triggerDownload({
    body: [header, ...rows].join('\n'),
    mime: 'text/csv',
    filename: `voter-links-${pollId}.csv`,
  });
}

/** Escape a CSV cell per RFC 4180 — quote if it contains `"` / `,` / newline. */
export function csvCell(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function safeFilenameFragment(s: string): string {
  return s.replace(/[^a-z0-9-_]/gi, '_').slice(0, 60);
}

function triggerDownload(opts: { body: string; mime: string; filename: string }): void {
  const blob = new Blob([opts.body], { type: opts.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = opts.filename;
  link.click();
  URL.revokeObjectURL(url);
}
