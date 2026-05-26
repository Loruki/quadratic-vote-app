import { ImageResponse } from 'next/og';
import { getPollWithOptions, getResults } from '@/lib/polls';

// next/og prefers the Edge runtime — it ships satori as WASM.
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const data = await getPollWithOptions(id);

  const title = data?.poll.title ?? 'Quadratic Vote';
  const description =
    data?.poll.description ??
    'Vote with how much you care. Quadratic voting for everyone.';
  const optionCount = data?.options.length ?? 0;
  let voterCount = 0;
  if (data) {
    const r = await getResults(id);
    voterCount = r.voterCount;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #6d4ee0 0%, #d04ad6 50%, #ee7a4d 100%)',
          padding: '64px 72px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 26,
              position: 'relative',
            }}
          >
            Q
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 10,
                fontSize: 16,
              }}
            >
              2
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>
            Quadratic Vote
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {description && data && (
            <div
              style={{
                marginTop: 24,
                fontSize: 28,
                fontWeight: 400,
                opacity: 0.85,
                maxWidth: 900,
                lineHeight: 1.3,
              }}
            >
              {description.slice(0, 120)}
              {description.length > 120 ? '…' : ''}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            fontSize: 22,
            opacity: 0.95,
          }}
        >
          {data ? (
            <>
              <Pill>
                {voterCount} {voterCount === 1 ? 'voter' : 'voters'}
              </Pill>
              <Pill>
                {optionCount} options · {data.poll.creditsPerVoter} credits
              </Pill>
              {data.poll.isClosed && <Pill>Closed</Pill>}
            </>
          ) : (
            <Pill>Vote with how much you care</Pill>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.16)',
        padding: '8px 18px',
        borderRadius: 999,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}
