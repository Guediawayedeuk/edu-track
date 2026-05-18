## Objectif

Brancher 4 modules métier (examens/notes, présences, paiements, bulletins PDF) sur Supabase avec données réelles, et renforcer les policies RLS pour les 3 rôles (admin, enseignant, parent).

---

## 1. Migration de base de données

Nouvelles tables :

**`exams`** — examens créés par un enseignant
- `id`, `title`, `class_id` (→ classes), `subject_id` (→ subjects), `teacher_id` (→ teachers), `exam_date`, `duration_minutes`, `max_grade` (default 20), `status` (`planned`/`graded`/`published`), timestamps

**`grades`** — notes saisies
- `id`, `exam_id` (→ exams), `student_id` (→ students), `value` numeric, `comment`, `graded_by` (teacher_id), timestamps
- UNIQUE (exam_id, student_id)

**`attendance`** — appel quotidien
- `id`, `student_id`, `class_id`, `subject_id` (nullable), `date`, `status` (`present`/`absent`/`late`/`excused`), `recorded_by` (teacher_id), `note`, timestamps
- UNIQUE (student_id, date, subject_id)

**`payments`** — paiements scolaires
- `id`, `student_id`, `amount` numeric, `amount_paid` numeric default 0, `status` (`pending`/`partial`/`paid`/`overdue`), `due_date`, `paid_date`, `reference`, `description`, timestamps

Ajout colonne `class_id` (→ classes) sur `students` pour relier proprement (en parallèle de `class_name` existant, qu'on garde pour rétrocompat).

---

## 2. Policies RLS (renforcement)

Fonctions helper SECURITY DEFINER :
- `get_teacher_id(user_id)` — retourne le `teachers.id` du user
- `is_teacher_of_class(class_id)` — true si l'enseignant est `main_teacher` OU a un cours dans cette classe (via exams ou attendance qu'il a saisis)
- `is_parent_of_student(student_id)` — true si `students.parent_user_id = auth.uid()`
- `is_student_self(student_id)` — true si `students.user_id = auth.uid()`

Règles par table :

| Table | Admin | Enseignant | Parent/Élève |
|---|---|---|---|
| exams | ALL | SELECT/INSERT/UPDATE si teacher_id = self | SELECT si concerné (enfant dans la classe) |
| grades | ALL | ALL si graded_by = self OU enseigne la matière | SELECT pour ses notes / celles de son enfant |
| attendance | ALL | ALL si recorded_by = self ; SELECT pour ses classes | SELECT pour soi / son enfant |
| payments | ALL | aucun accès | SELECT pour son enfant |

Renforcer `students` : enseignants peuvent SELECT (lecture seule), parents SELECT pour leurs enfants, élève SELECT pour soi.
Renforcer `teachers` : tous authentifiés SELECT (annuaire), seuls admins write.

---

## 3. Helpers API (`src/lib/api/`)

- `exams.ts` — list (par classe/enseignant), create, update, delete
- `grades.ts` — listByExam, upsertBatch (saisie en masse), listByStudent
- `attendance.ts` — listByClassDate, upsertBatch, statsByStudent
- `payments.ts` — list, create, markPaid, stats
- `bulletins.ts` — `getBulletinData(studentId, period)` qui agrège notes + moyennes + absences

Tous via React Query (`useQuery`/`useMutation`) avec invalidation.

---

## 4. Pages à brancher

**Enseignant :**
- `TeacherExams` — CRUD examens (liés à ses classes/matières)
- `TeacherGrades` — sélecteur examen → saisie notes batch → save
- `TeacherAttendance` — sélecteur classe + date → appel → save batch

**Admin :**
- `AdminExams` — vue globale, filtres, suppression
- `AdminAttendance` — agrégats réels par classe/jour
- `AdminPayments` — liste réelle, création, marquer payé, relance

**Parent :**
- Génération bulletin PDF via `jspdf` + `jspdf-autotable` à partir de `getBulletinData()` — moyennes par matière, moyenne générale, total absences/retards, appréciations.

---

## 5. Détails techniques

- Bouton "Télécharger bulletin" sur `ParentDashboard` (par enfant + période trimestre).
- Status de paiement calculé côté serveur via trigger : `paid` si `amount_paid >= amount`, `partial` si `> 0 < amount`, sinon `pending` ; `overdue` recalculé via fonction si `due_date < now()`.
- Aucune Edge Function nouvelle nécessaire (CRUD direct via RLS).
- Tests RLS manuels après migration via `supabase--read_query` en simulant les 3 rôles.

---

## Livrables

1. Migration SQL (tables + RLS + helpers)
2. 5 fichiers `src/lib/api/*.ts`
3. Refonte 6 pages (3 teacher + 3 admin)
4. Composant `BulletinPDF` + bouton sur ParentDashboard
5. Suppression de toutes les données mock dans ces modules
