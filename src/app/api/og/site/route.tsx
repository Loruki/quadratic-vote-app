import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
          padding: '72px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 30,
              position: 'relative',
            }}
          >
            Q
            <span style={{ position: 'absolute', top: 6, right: 10, fontSize: 18 }}>2</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            Quadratic Vote
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' }}>
          <div
            style={{
              fontSize: 100,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -3,
              maxWidth: 1000,
            }}
          >
            Vote with <span style={{ opacity: 0.85 }}>how much</span> you care.
          </div>
          <div style={{ marginTop: 32, fontSize: 32, opacity: 0.85, maxWidth: 900 }}>
            Quadratic voting for everyone. No signup. No wallet.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, opacity: 0.9 }}>quadratic.vote</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
