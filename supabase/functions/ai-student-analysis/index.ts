import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { student_id } = await req.json();
    if (!student_id) return new Response(JSON.stringify({ error: 'student_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const [{ data: grades }, { data: attendance }, { data: student }] = await Promise.all([
      supabase.from('grades').select('value, created_at, exam:exams(title, max_grade, exam_date, subject:subjects(name))').eq('student_id', student_id).order('created_at', { ascending: true }),
      supabase.from('attendance').select('status, date').eq('student_id', student_id).order('date', { ascending: false }).limit(60),
      supabase.from('students').select('id, class_name, parent_user_id, user_id').eq('id', student_id).single(),
    ]);

    const normalized = (grades ?? []).map((g: any) => ({
      subject: g.exam?.subject?.name ?? 'Matière',
      value: Number(g.value),
      max: Number(g.exam?.max_grade ?? 20),
      pct: (Number(g.value) / Number(g.exam?.max_grade ?? 20)) * 20,
      date: g.exam?.exam_date,
    }));
    const current_average = normalized.length ? normalized.reduce((a, b) => a + b.pct, 0) / normalized.length : null;
    const attCounts = { present: 0, absent: 0, late: 0, excused: 0 };
    (attendance ?? []).forEach((a: any) => { attCounts[a.status as keyof typeof attCounts]++; });

    const prompt = `Tu es un assistant pédagogique. Analyse les performances scolaires d'un élève et réponds STRICTEMENT en JSON valide avec cette structure : {"summary": string (2-3 phrases), "severity": "info"|"warning"|"critical", "trend": "up"|"stable"|"down", "predicted_average": number (sur 20), "recommendations": [{"title": string, "description": string}]}.

Données :
- Moyenne actuelle (sur 20) : ${current_average?.toFixed(2) ?? 'N/A'}
- Notes par matière (ordre chronologique) : ${JSON.stringify(normalized)}
- Présence (60 derniers jours) : ${JSON.stringify(attCounts)}

Identifie tendances, matières faibles, impact des absences, et propose 3 à 5 recommandations concrètes de révision.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });
    if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'rate_limit' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'credits_exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!aiRes.ok) throw new Error(`AI error ${aiRes.status}: ${await aiRes.text()}`);
    const aiJson = await aiRes.json();
    const parsed = JSON.parse(aiJson.choices?.[0]?.message?.content ?? '{}');

    const { data: alert } = await supabase.from('ai_alerts').insert({
      student_id,
      severity: parsed.severity ?? 'info',
      summary: parsed.summary ?? '',
      recommendations: parsed.recommendations ?? [],
      current_average,
      predicted_average: parsed.predicted_average ?? null,
      trend: parsed.trend ?? 'stable',
    }).select().single();

    if ((parsed.severity === 'warning' || parsed.severity === 'critical') && student?.parent_user_id) {
      await supabase.from('notifications').insert({
        user_id: student.parent_user_id,
        type: 'ai_alert',
        title: parsed.severity === 'critical' ? 'Alerte IA : intervention recommandée' : 'Alerte IA : baisse de performance',
        body: parsed.summary,
        link: '/parent',
        metadata: { student_id, alert_id: alert?.id, predicted_average: parsed.predicted_average },
      });
    }

    return new Response(JSON.stringify({ alert, current_average }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
