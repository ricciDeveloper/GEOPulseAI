import { syncSources } from '../../../../lib/syncSources';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncSources();
    return Response.json(result);
  } catch (error) {
    console.error('Erro na sincronização agendada:', error);
    return Response.json({ error: 'Falha na sincronização' }, { status: 500 });
  }
}