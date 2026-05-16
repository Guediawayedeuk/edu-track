## Objectif
Brancher les pages Admin sur Supabase (vraies données + CRUD), supprimer les données factices.

## 1. Base de données (migration)
Tables existantes utilisées : `profiles`, `teachers`, `students`, `user_roles`.

Nouvelles tables à créer :
- **classes** : `name` (texte, unique), `level` (texte ex "6ème"), `room` (texte), `main_teacher_id` (uuid → teachers.id, nullable)
- **subjects** : `name` (texte, unique), `code` (texte), `color` (texte)
- **teacher_subjects** (jointure) : `teacher_id`, `subject_id`
- Ajouter `class_id` (uuid → classes.id) sur `students` en plus de `class_name` pour migration douce.

Politiques RLS : Admins gèrent tout (`has_role(auth.uid(),'admin')`), enseignants/parents en lecture limitée.

## 2. Gestion des « parents »
Pas de table dédiée. Un parent = profil avec rôle `parent` dans `user_roles`, lié aux élèves via `students.parent_user_id`.

## 3. Création d'utilisateurs (enseignants, parents)
Création via edge function `admin-create-user` (service role) qui :
- Crée l'utilisateur auth (email + mot de passe temporaire)
- Insère le profil + rôle + entrée `teachers`/`students` selon le cas
- Renvoie le mot de passe temporaire à l'admin

## 4. Pages admin à brancher
Remplacer toutes les listes statiques par des requêtes Supabase + mutations (React Query) :

- **AdminTeachers** : liste depuis `teachers` join `profiles`. Ajout/modif/suppression. Dialog d'ajout (email, nom, matière).
- **AdminStudents** : liste `students` join `profiles` + parent. Dialog d'ajout (nom, classe, parent).
- **AdminParents** : profils ayant rôle `parent` + nb d'enfants. Dialog d'ajout.
- **AdminClasses** : CRUD `classes`.
- **AdminSubjects** : CRUD `subjects`.

UI : conserver le design glassmorphism, ajouter `Dialog` + `Form` shadcn, toasts pour feedback, états chargement (Skeleton).

## 5. Détails techniques
- Hooks : `@tanstack/react-query` (déjà présent) avec `useQuery`/`useMutation`.
- Helper `src/lib/api/` par entité (teachers.ts, students.ts, parents.ts, classes.ts, subjects.ts).
- Edge function : `supabase/functions/admin-create-user/index.ts` (vérifie le JWT admin appelant).
- Les autres pages admin (présences, paiements, etc.) ne sont pas dans le périmètre demandé — gardent leurs données factices pour l'instant.

## Livraison
1. Migration SQL (tables + RLS) — demande d'approbation.
2. Edge function de création d'utilisateur.
3. Helpers API + refactor des 5 pages.
4. Suppression de tous les tableaux mockés des pages concernées.
