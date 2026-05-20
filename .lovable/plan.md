# Plan : Notifications, Messagerie, IA scolaire, Présences & Notes

## 1. Base de données (migration Supabase)

Nouvelles tables :
- `notifications` : `user_id`, `type` (grade|attendance|payment|ai_alert|message), `title`, `body`, `link`, `read_at`, `metadata jsonb`
- `messages` : `sender_id`, `recipient_id`, `student_id` (optionnel, contexte), `subject`, `body`, `read_at`, `parent_message_id` (pour fils)
- `ai_alerts` : `student_id`, `severity` (info|warning|critical), `summary`, `recommendations jsonb`, `predicted_average`, `current_average`, `generated_at`

Triggers automatiques :
- Après `INSERT` sur `grades` → notification au parent + student (si moyenne baisse, marquer pour IA)
- Après `INSERT` sur `attendance` avec `status='absent'|'late'` → notification parent
- Après `INSERT/UPDATE` sur `payments` (status change) → notification parent

Politiques RLS : utilisateur ne voit que ses propres notifications/messages ; admins voient tout.

## 2. Edge Functions

- `ai-student-analysis` : appelle Lovable AI Gateway (`google/gemini-3-flash-preview`), analyse notes + absences d'un élève, retourne tendance + recommandations + prédiction. Crée une ligne `ai_alerts` et notifications si baisse détectée.
- `send-message` : crée message + notification destinataire.

## 3. Frontend

API helpers : `notifications.ts`, `messages.ts`, `aiAlerts.ts`

Composants :
- `NotificationBell` dans `DashboardLayout` (badge non-lus, dropdown récents)
- Page Messagerie (admin/teacher/parent) : liste fils, composer message
- `ParentDashboard` : section "Alertes IA" avec recommandations + bouton "Demander une analyse"
- `TeacherAttendance` & `TeacherGrades` déjà connectés à Supabase — on confirme et on ajoute le déclenchement IA + notifications

## 4. UI moyenne automatique

Sur `TeacherGrades`, afficher moyenne classe en live ; sur `ParentDashboard`, moyenne par matière recalculée depuis `grades` (déjà fait via `bulletins.ts`).

## Détails techniques

- Realtime Supabase pour les notifications (optionnel, polling 30s si trop lourd)
- IA via `LOVABLE_API_KEY` (déjà configurée), modèle Gemini Flash
- Toast `sonner` sur nouvelle notification

Une seule migration SQL + 2 edge functions + ~6 fichiers frontend.