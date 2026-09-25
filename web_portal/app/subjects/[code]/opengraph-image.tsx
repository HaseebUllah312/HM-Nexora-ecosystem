import { ImageResponse } from 'next/og';
import { supabase } from '@/app/lib/supabase';


export default async function Image({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  
  // Fetch subject name from DB (simplified for edge)
  const { data: subject } = await supabase
    .from('subjects')
    .select('name')
    .ilike('code', code)
    .single();

  const name = subject?.name || 'Subject Materials';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020205',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          }}
        />
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <span style={{ fontSize: '24px', color: '#7c3aed', fontWeight: 700 }}>HM nexora</span>
        </div>

        <div
          style={{
            fontSize: '80px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-2px',
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          {code}
        </div>

        <div
          style={{
            fontSize: '32px',
            color: '#a1a1aa',
            textAlign: 'center',
            padding: '0 40px',
            maxWidth: '900px',
            fontWeight: 400,
          }}
        >
          {name}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            color: '#71717a',
            fontSize: '18px',
          }}
        >
          <span>Past Papers • Solved Assignments • Study Notes</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
