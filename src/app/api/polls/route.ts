import { db, schema } from '@/db';
import { parseJson } from '@/lib/api';
import { createPollSchema } from '@/lib/validators/poll';

export async function POST(request: Request) {
  const parsed = await parseJson(request, createPollSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  const tokens = await db.transaction(async (tx) => {
    const [poll] = await tx
      .insert(schema.polls)
      .values({
        title: input.title,
        description: input.description,
        creditsPerVoter: input.creditsPerVoter,
        visibility: input.visibility,
        voterMode: input.voterMode,
      })
      .returning();

    await tx.insert(schema.options).values(
      input.options.map((label, position) => ({
        pollId: poll.id,
        label,
        position,
      })),
    );

    let voterTokens: { token: string; label: string | null }[] = [];
    if (input.voterMode === 'tokenized' && input.voters && input.voters.length > 0) {
      const created = await tx
        .insert(schema.voterTokens)
        .values(
          input.voters.map((label) => ({
            pollId: poll.id,
            label: label.length > 0 ? label : null,
          })),
        )
        .returning({ token: schema.voterTokens.token, label: schema.voterTokens.label });
      voterTokens = created;
    }

    return { poll, voterTokens };
  });

  const base = `/poll/${tokens.poll.id}`;
  return Response.json(
    {
      id: tokens.poll.id,
      adminToken: tokens.poll.adminToken,
      voterMode: tokens.poll.voterMode,
      visibility: tokens.poll.visibility,
      voterUrl: tokens.poll.voterMode === 'open' ? base : null,
      adminUrl: `${base}/admin/${tokens.poll.adminToken}`,
      voterTokens: tokens.voterTokens.map((t) => ({
        url: `${base}/v/${t.token}`,
        label: t.label,
      })),
    },
    { status: 201 },
  );
}
