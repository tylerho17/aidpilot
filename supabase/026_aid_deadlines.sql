-- AidPilot: a GLOBAL California/federal aid deadline catalog, so /key-dates and
-- the dashboard "next deadline" pill render from the DB (editable, live) instead
-- of a hardcoded TypeScript array. Distinct from the per-user `deadlines` table.
--
-- Bilingual text is stored as jsonb {"en","es"} so the app keeps its existing
-- d.title[lang] rendering with no UI change. Public read (active), admin write
-- via is_scholarship_admin() (defined in 007). Safe to rerun.
--
-- Sourced 2026-07-17 from CSAC (csac.ca.gov) and StudentAid.gov; cited in
-- docs/content-source.md. `slug` mirrors AidDeadline.id for fallback parity.

create table if not exists public.aid_deadlines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text unique not null,
  deadline_date date not null,
  award_year text not null,
  approx boolean not null default false,
  href text,
  sort integer not null default 0,
  active boolean not null default true,
  title jsonb not null,
  short jsonb not null,
  audience jsonb not null,
  action jsonb not null
);

comment on table public.aid_deadlines is
  'Global (non-user) CA + federal aid deadline catalog for /key-dates. Bilingual jsonb text.';

alter table public.aid_deadlines enable row level security;

drop policy if exists "Public can read active aid deadlines" on public.aid_deadlines;
create policy "Public can read active aid deadlines" on public.aid_deadlines
  for select using (active = true or public.is_scholarship_admin());

drop policy if exists "Admins manage aid deadlines" on public.aid_deadlines;
create policy "Admins manage aid deadlines" on public.aid_deadlines
  for all using (public.is_scholarship_admin()) with check (public.is_scholarship_admin());

insert into public.aid_deadlines (slug, deadline_date, award_year, approx, href, sort, title, short, audience, action)
values
  (
    'ccc-cal-grant-sep2', '2026-09-02', '2026–27', false, 'https://www.csac.ca.gov/cal-grant', 10,
    $j${"en":"Cal Grant community college deadline","es":"Fecha límite de Cal Grant para colegio comunitario"}$j$::jsonb,
    $j${"en":"Cal Grant (community college)","es":"Cal Grant (colegio comunitario)"}$j$::jsonb,
    $j${"en":"California Community College students who missed the March 2 deadline","es":"Estudiantes de colegios comunitarios de California que no cumplieron la fecha del 2 de marzo"}$j$::jsonb,
    $j${"en":"Submit your FAFSA or CA Dream Act Application and make sure your GPA is on file by Sept 2.","es":"Envía tu FAFSA o Solicitud de la Ley Dream de California y asegúrate de que tu GPA esté registrado antes del 2 de septiembre."}$j$::jsonb
  ),
  (
    'fafsa-cadaa-open-2728', '2026-10-01', '2027–28', false, 'https://www.csac.ca.gov/apply', 20,
    $j${"en":"2027–28 FAFSA & CA Dream Act Application open","es":"Se abren la FAFSA y la Solicitud de la Ley Dream 2027–28"}$j$::jsonb,
    $j${"en":"2027–28 FAFSA opens","es":"Se abre la FAFSA 2027–28"}$j$::jsonb,
    $j${"en":"Everyone applying for aid for the 2027–28 school year","es":"Todos los que solicitan ayuda para el año escolar 2027–28"}$j$::jsonb,
    $j${"en":"File as early as you can — much state aid is first-come, first-served.","es":"Presenta lo antes posible — mucha ayuda estatal se otorga por orden de llegada."}$j$::jsonb
  ),
  (
    'cal-grant-priority-march2', '2027-03-02', '2027–28', false, 'https://www.csac.ca.gov/cal-grant', 30,
    $j${"en":"March 2 Cal Grant deadline (priority + final)","es":"Fecha límite de Cal Grant del 2 de marzo (prioritaria y final)"}$j$::jsonb,
    $j${"en":"March 2 Cal Grant deadline","es":"Fecha límite Cal Grant 2 de marzo"}$j$::jsonb,
    $j${"en":"Every California student applying for a Cal Grant for 2027–28","es":"Todo estudiante de California que solicita un Cal Grant para 2027–28"}$j$::jsonb,
    $j${"en":"Submit your FAFSA or CA Dream Act Application AND confirm your school sent your GPA by March 2.","es":"Envía tu FAFSA o Solicitud de la Ley Dream Y confirma que tu escuela envió tu GPA antes del 2 de marzo."}$j$::jsonb
  ),
  (
    'fafsa-federal-jun30', '2027-06-30', '2026–27', false, 'https://studentaid.gov/apply-for-aid/fafsa/fafsa-deadlines', 40,
    $j${"en":"Federal FAFSA deadline (2026–27)","es":"Fecha límite federal de la FAFSA (2026–27)"}$j$::jsonb,
    $j${"en":"2026–27 FAFSA closes","es":"Cierra la FAFSA 2026–27"}$j$::jsonb,
    $j${"en":"Anyone who still needs to file the 2026–27 FAFSA for federal aid","es":"Cualquiera que aún necesite presentar la FAFSA 2026–27 para ayuda federal"}$j$::jsonb,
    $j${"en":"This is the last day to submit the 2026–27 FAFSA — you can still qualify for a Pell Grant up to this date.","es":"Este es el último día para enviar la FAFSA 2026–27 — aún puedes calificar para una Beca Pell hasta esta fecha."}$j$::jsonb
  ),
  (
    'chafee-jul31', '2027-07-31', '2026–27', false, 'https://www.csac.ca.gov/chafee', 50,
    $j${"en":"Chafee Grant deadline for foster youth","es":"Fecha límite de la Beca Chafee para jóvenes de crianza"}$j$::jsonb,
    $j${"en":"Chafee Grant","es":"Beca Chafee"}$j$::jsonb,
    $j${"en":"Current or former foster youth (up to $5,000/year)","es":"Jóvenes de crianza actuales o anteriores (hasta $5,000 por año)"}$j$::jsonb,
    $j${"en":"Apply for the California Chafee Grant and complete your FAFSA or CA Dream Act Application.","es":"Solicita la Beca Chafee de California y completa tu FAFSA o Solicitud de la Ley Dream."}$j$::jsonb
  ),
  (
    'verification-sep', '2027-09-15', '2026–27', true, 'https://studentaid.gov/apply-for-aid/fafsa/review-and-correct', 60,
    $j${"en":"FAFSA verification deadline","es":"Fecha límite de verificación de la FAFSA"}$j$::jsonb,
    $j${"en":"FAFSA verification","es":"Verificación de FAFSA"}$j$::jsonb,
    $j${"en":"Students selected for verification for 2026–27","es":"Estudiantes seleccionados para verificación para 2026–27"}$j$::jsonb,
    $j${"en":"If you were selected, submit every requested document. The exact federal date lands around mid-September — confirm your school's deadline.","es":"Si te seleccionaron, entrega todos los documentos solicitados. La fecha federal exacta llega a mediados de septiembre — confirma la fecha límite de tu escuela."}$j$::jsonb
  )
on conflict (slug) do nothing;
