# Regibox (RegyBox) Client/Athlete App -- Complete UI & Feature Analysis

**Source:** 38 authenticated page fragments from the production app
**Platform:** Framework7 hybrid mobile app (iOS/Android), PHP backend
**Language:** Portuguese (pt), with English option
**Theme:** Dark mode default, light mode available

---

## TABLE OF CONTENTS

1. [Classes / Booking](#1-classes--booking)
2. [Workouts / WODs](#2-workouts--wods)
3. [Personal Records](#3-personal-records)
4. [Community](#4-community)
5. [Activities & Challenges](#5-activities--challenges)
6. [Tools (Timers & Calculator)](#6-tools)
7. [Store (POS)](#7-store)
8. [Training Planning & Individual Workouts](#8-training)
9. [Settings](#9-settings)
10. [Feedback](#10-feedback)
11. [Digital Dossiers](#11-digital-dossiers)

---

## 1. CLASSES / BOOKING

### 1a. Class Calendar (`calendario_aulas`)

**Page header:** "Aulas de [Month], [Year]"

**Navigation:**
- Back button (arrow_left_circle_fill icon)
- Calendar scroll-to-top button (calendar icon, top right)

**Calendar widget:**
- Full month calendar (Framework7 calendar component)
- Tap any day to load that day's classes
- Month/year navigation via swipe
- Responsive: landscape mode splits calendar left / events right

**Class type filter (horizontal scrollable pill bar):**
- "TODAS" (all) -- selected by default
- Each class type shown as a pill with color-coded circle indicator:
  - ANI_FLO, BRE_WOR, CF_OPEN, CHU_NOR_BR, CHU_NOR_RE, DES_SEM, DIN_TIM, ENDURAN, GAM, GRA, HYROX, HYR_COM, LIFTOFF, MIS, MISSA, MISSB, MOB, NUT, RAB_KIL, STA, STRENG, TBOX, TEE, WOD, WOR, WORKSHO, WOR_HYR
- Filter toggle via "more_horiz" (three dots) icon button

**Hidden form fields:**
- `box` (box ID)
- `plano` (plan ID, default 0)
- `dia_atual` (current day timestamp)
- `filtro` (active filter ID)

**Loading indicator:** Full-screen spinner overlay

### 1b. Classes List for a Day (`aulas`)

**Content when no classes:** "Nao ha aulas neste dia" (No classes on this day) with illustration

**Content when classes exist (per time slot):**
- Date header (e.g., "Quinta, 1 de Janeiro de 1970")
- Each class card shows:
  - Class type name and icon
  - Time slot
  - Coach name(s)
  - Enrollment count / capacity
  - Countdown timer (digital-7 font, shows days:hours:mins:secs until enrollment deadline)

**Action buttons per class:**
- **Book/Sign up** -- `escolha_horario()` function
- **View enrollment list** -- `quadro_insc()` function (opens popup)

**Auto-scroll:** When viewing today, auto-scrolls to current time slot

**Timers:** Live countdown timers update every 999ms showing time remaining for enrollment

### 1c. Class Details (`detalhes_aula`)

**Page header:** "Detalhes da aula"

**Popup overlay with:**
- Back/close button
- Class type name with icon and color
- Class type secondary icon
- Date and day of week
- Time range (start - end)
- Coach(es) section (`feed_coachs`)
- Footer section

**Section: "Inscricoes" (Enrollments)**
- List of enrolled athletes (rendered as `<ul>` list items)

---

## 2. WORKOUTS / WODs

### 2a. WOD Main Page (`wod`)

**Navigation bar:**
- Back button ("Voltar")
- Horizontal date selector (scrollable): shows ~10 days with month abbreviation, day number, weekday abbreviation
- Star indicator under days that have scored results
- Today highlighted

**Quick day selector bar:**
- Row of day buttons: SAB, DOM, SEG, TER, HOJE, QUI, SEX, SAB, DOM
- Each clickable to load that day's WODs via `wods_dia('YYYY-MM-DD')`

**WOD sections (collapsible panels):**
Each workout category is a collapsible accordion panel with:
- Category header (e.g., "WOD", "Strength", "Hyrox", "Miss WOD")
- "Workout de [date]" subtitle
- Expand/collapse toggle icon (format_line_spacing)
- Color-coded left border

**Per workout card:**
- **Workout title** (e.g., "BACK SQUAT", "E2MOM for 18min")
- **Workout description** (full prescription text with sets, reps, weights, notes)
- **Score type chip** with icon:
  - "Carga" (Load) -- fitness_center icon
  - "Repeticoes" (Reps) -- more_horiz icon
  - "Sem resultado/Para qualidade" (No score/For quality) -- block icon
- **Trophy icon** (cup image, links to box ranking popup) for ranked workouts
- **Coach notes** (intensity, volume, RPE, focus)

**4-button action row per workout:**
1. **"+ Infos"** -- Opens WOD details page (check_box icon)
2. **"Teu resultado"** (Your result) -- Opens score registration popup (assignment icon)
3. **"Tabela"** (Leaderboard) -- Opens leaderboard page (insert_chart icon with badge showing participant count)
4. **"Comentarios"** (Comments) -- Opens comment form popup (speaker_notes icon)

**Note:** Workouts without scoring (quality-only) hide the "Teu resultado" and "Tabela" buttons

**Comments section:** Hidden div per workout, toggled to show inline comments

### 2b. WOD Details (`wod_details`)

**Page header:** "HISTORICO E DETALHES"

**Content:**
- Workout name in card header
- **Personal record card:** Shows personal best for this workout (or "---" if none)
- **Workout history card:** Shows all past results for this workout (or "Nao existem registos para este treino")

### 2c. Register Score (`registar_score`)

**Page header:** "REGISTA O TEU RESULTADO"

**Popup with:**
- Back/close button
- Score entry form loaded via iframe (`registar_score_js.php`)
- Parameters passed: workout ID, date, source

### 2d. Leaderboard (`tabela_classificativa`)

**Page header:** "[Date] TABELA CLASSIFICATIVA"

**Fist bump button** (top right): Opens power fist bumps popup

**Age group filter (smart select dropdown):**
- Geral (General/All)
- 13 ou menos
- Entre 14 e 15
- Entre 16 e 17
- Entre 18 e 34
- Entre 35 e 39
- Entre 40 e 44
- Entre 45 e 49
- Entre 50 e 54
- Entre 55 e 59
- 60 ou mais

**Workout description:** Shown in collapsible accordion at top

**Results table:** Ranked list of athletes with scores
- Fist bump icons per result (power.png / power_off.png)
- Confirmation dialog for giving fist bumps

**Empty state:** "Nao existem resultados"

### 2e. Movement Library (`movimentos`)

**Page header:** "MOVIMENTOS (520)" -- 520 movements in library

**Search bar:**
- Text input: "Pesquisar..." (Search...)
- Cancel button
- Searchbar backdrop

**Movement list:**
- Alphabetically sorted list of 520 movements
- Each item shows:
  - Video camera icon (videocam) if video exists
  - Video-off icon (videocam_off) if no video
  - Movement name as clickable link
- Clicking opens video popup (`ver_video.php`) with YouTube video ID

**Sample movements include:** Air Squat, Back Squat, Barbell Row, Bench Press, Box Jump, Burpee, Clean, Clean and Jerk, Deadlift, Double Under, Front Squat, Handstand Push-Up, Hang Clean, Hip Thrust, Inverted Row, Jump Squats, KB Swing, Kipping Pull-Up, Lateral Raise, Lunge, Muscle-Up, Overhead Squat, Plank, Power Clean, Pull-Up, Push Press, Push-Up, Ring Dip, Rope Climb, Row, Run, Sit-Up, Snatch, Squat, Strict Press, Sumo Deadlift, Thruster, Toes to Bar, Turkish Get-Up, Wall Ball, and hundreds more

**Not found state:** "Nenhum movimento encontrado"

### 2f. WOD History (`historico`)

**Page header:** "HISTORICO DE TREINOS"

**Filter form:**
- **Date from** (`data_ini`): date input
- **Date to** (`data_fim`): date input
- **Sort by** (`ordem`): select dropdown
  - "Data mais recente" (Most recent date)
  - "Data mais antiga" (Oldest date)
  - "Treinos com PR primeiro" (Workouts with PR first)
  - "Treinos com Fist Bumps primeiro" (Workouts with Fist Bumps first)

**Action buttons:**
- "Cancelar" (Cancel) -- resets form
- "Pesquisar treinos" (Search workouts) -- executes search

---

## 3. PERSONAL RECORDS

### 3a. Records Main (`recordes`)

**Page header area:**

**Welcome card:**
- Title: "Recordes pessoais" (Personal Records)
- Description: Welcome to the personal records area. If you used RegyBox at another box, you can import your data.

**Action buttons:**
- **"REGISTAR"** -- Go to record entry (current box)
- **"IMPORTAR"** -- Import records from another box

### 3b. Personal Records - Category List (`records_pessoais0`)

**List of movement categories:** Each item links to detail form showing:
- Movement name
- Current score/value

### 3c. Personal Records - Entry Form (`records_pessoais1`)

**Page header:** "PRS - [Movement Name]"

**Form fields (grid of number inputs):**
- **1RM** through **10RM** -- 10 separate number inputs for rep maxes (placeholder "KG")
- Fields arranged in 2 rows of 5
- All accept decimal values (`step="any"`)

**Additional fields:**
- **Observacoes** (Notes): textarea

**Buttons:**
- **"GUARDAR"** (Save) -- submits the form

**Hidden fields:** `id_mov` (movement ID), `rx` (RX flag), `z` (auth token)

**History section:** Shows previous records for this lift (or "Nao existem registos para este levantamento")

### 3d. Box Records (`records_box`)

**Page header:** "RECORDES DA BOX"

**Search form:**
- **Tipo de recorde** (Record type): dropdown
  - Masculino RX
  - Feminino RX
  - Masculino Scaled
  - Feminino Scaled
- **Nome do atleta** (Athlete name): text input with clear button

**Action buttons:**
- "Cancelar" (Cancel)
- "Pesquisar" (Search)

### 3e. PR History (`prs_historico`)

**Page header:** "Prs e Historico"

**Search form:**
- Search icon with text input: "Digite parte do nome do atleta" (Type part of the athlete's name)
- Clear button

**Action button:**
- "Pesquisar" (Search) -- searches for athlete's PR history

**Results area:** Dynamic content loaded after search

---

## 4. COMMUNITY

### 4a. My Box (`minha_box`) -- 5-tab layout

**Bottom tab bar:**
- Back button
- Tab 1: Rules (assignment icon) -- active by default
- Tab 2: Birthdays (cake icon)
- Tab 3: Athletes (supervisor_account icon)
- Tab 4: Coaches (person icon)
- Tab 5: Contact (mail icon)

#### Tab 1: REGRAS DE MARCACAO DE AULAS (Class Booking Rules)

**PRAZOS (Deadlines):**
- Calendar+ icon: "Podes inscrever-te em aulas com uma antecedencia de 14 dias e 45 minutos"
- Alarm icon: "Sao permitidas inscricoes ate 5 minutos antes da aula"
- Calendar- icon: "Podes cancelar uma inscricao ate 1 hora antes da aula"

**PENALIZACOES (Penalties):**
- Flag icon: "Atletas com 3 ou mais faltas nos ultimos 15 dias, apenas poderao marcar aulas com uma antecedencia de 1 hora"

**WORKOUTS section:**
- Search icon: "Os workouts ficam disponiveis para consulta: Sempre"
- Pencil icon: Score registration available as soon as workout is published
- Star icon: Virtual trophies (1st, 2nd, 3rd) assigned next day at 00:00

#### Tab 2: ANIVERSARIOS HOJE (Today's Birthdays)

- List of athletes with birthdays today
- Each shows: photo (circle avatar), name
- Clicking opens birthday congratulations popup
- **"MOSTRAR ANTERIORES"** button to view past birthdays

#### Tab 3: ATLETAS (Athletes)

**Search form:**
- "Nome do atleta" (Athlete name): text input
- "Genero" (Gender): dropdown
  - Masculino e Feminino (Both)
  - Masculino
  - Feminino

**Action buttons:**
- "Anular" (Cancel) -- resets form
- "Pesquisar atletas" (Search athletes)

#### Tab 4: TREINADORES (Coaches)

- List of coaches with photos (circle avatars) and names
- Each clickable to open coach profile popup (`perfil_coach.php`)
- Example coaches: Coach Andre Loureiro, Coach David Sanchez, Coach Juvenal Fernandes, Coach Luis Mendes, Coach Marine Robba, Coach Ricardo Ribeiro, Coach Silvina Resende, Coach Tiago Neves

#### Tab 5: CONTACTOS (Contacts)

**Box info displayed:**
- Box name, address, postal code, GPS coordinates
- Email address
- Phone number (with note "Chamada para rede movel nacional")
- Facebook link

**Email form:**
- **"Enviar e-mail para"** (Send email to): dropdown of all coaches/staff
- **"Assunto"** (Subject): text input
- **"Mensagem"** (Message): textarea (resizable)
- **"Cancelar"** (Cancel) button
- **"Enviar email"** (Send email) button

### 4b. Birthday Detail (`aniversario`)

**Popup with:**
- Confetti background image
- Athlete photo (circle, 200px)
- Crowd image at bottom
- Header: "Parabens [Name]!"
- Birthday messages from other athletes

**Action buttons:**
- **"ENVIA UMA MENSAGEM DE PARABENS"** (Send a birthday message) -- opens form
- **"ESCREVE UMA MENSAGEM DE AGRADECIMENTO"** (Write a thank-you message) -- hidden by default, shown to birthday person

### 4c. News Feed (`noticias`)

**Page header:** "NOTICIAS"

**News cards (repeating pattern per post):**
- **Title** (bold, uppercase)
- **Optional image** (full width, clickable to zoom)
- **Body text** (rich HTML content with links)
- **Author and date** (e.g., "Coach Marine Robba, 14 Abr 2026")
- **Like count** with thumb_up icon and count
- **Comment count** with chat_bubble_fill icon and count (when > 0)

**Social actions per post:**
- **"GOSTO"** (Like) button with hand_thumbsup_fill icon -- toggles, fades out after click
- **"COMENTARIO"** (Comment) button with bubble_left_bubble_right_fill icon -- opens comment form popup

**Like details:** Clicking the like count expands to show who liked the post

**Content types observed:** Event announcements, schedule changes, merchandise orders, community WhatsApp links, staff introductions, competition registrations

### 4d. Fistbumps & Comments (`fist_coments`)

**Page header:** "REACOES E COMENTARIOS"

**Summary table (2x2 grid):**
- **Recebidos (Received):**
  - Fistbumps received (icon 197.png) with count
  - Comments received (icon 203.png) with count -- links to received comments page
- **Enviados (Sent):**
  - Fistbumps sent with count
  - Comments sent with count -- links to sent comments page

**Fan list:**
- "A tua lista de fas" (Your fan list)
- Shows people who gave you the most reactions
- "Reacoes" column header on right

### 4e. Best Results (`melhores_res`)

**Page header:** "MELHORES RESULTADOS NOS WODS"

**Search form:**
- **"Nome do atleta"** (Athlete name): text input
- **"Tipo"** (Type): dropdown
  - Masculino RX
  - Feminino RX
  - Masculino Scaled
  - Feminino Scaled

**Action buttons:**
- "Cancelar" (Cancel)
- "Pesquisar" (Search)

---

## 5. ACTIVITIES & CHALLENGES

### 5a. Activities (`atividades`)

**Page header:** "Atividades (2)"

**Box logo** displayed top right

**Search form:**
- **"Atividades de"** (Activities from): dropdown of ALL RegyBox-networked boxes (200+ boxes listed!)
  - Includes boxes across Portugal, Angola, Mozambique
  - Current box pre-selected (CrossFit Aveiro)
  - Changing box dynamically loads that box's activities
- **"Digite parte do titulo"** (Type part of the title): text input
- **"Ordenar por"** (Sort by): dropdown
  - Titulo (Title)
  - Mais antigo (Oldest)
  - Mais recente (Most recent) -- default

**Action buttons:**
- "Cancelar" (Cancel)
- "Pesquisar" (Search)

**Results area:** Dynamic content loaded after search
**Note:** Activities require reading and accepting a regulation ("Tem que ler e aceitar o regulamento")

### 5b. Challenges/Gamification (`desafios`)

**3-tab layout:**
- Tab 1: "Desafios" (Challenges) -- active by default
- Tab 2: "Atividades" (Activities)
- Tab 3: "Pontos" (Points)

#### Tab 1: Challenges

**Player stats card:**
- Points: "Pts: 11"
- Ranking: "Rnk: 328o"
- Level progress bar (e.g., "92%" toward next level)
- Level badge (circular, clickable to leaderboard)
- Current level number (e.g., "1")

**Link:** "Ver tabela classificativa" (View leaderboard)

**Medal grid:** 63 medals displayed in a grid
- Each medal is clickable to view challenge details
- Medal images (medal1.png through medal63.png)
- Faded appearance for unearned medals

**Explanation text:** "Por cada desafio que consigas concluir ganhas os respetivos pontos..."

#### Tab 2: Activities

**Status display:**
- Error state: "AINDA NAO PARTICIPASTE EM NENHUMA ATIVIDADE" (You haven't participated in any activity yet)
- When active: shows participated activities

#### Tab 3: Points -- How to Earn

Point-earning mechanisms:
1. **Class attendance:** 1 point per attended class/training
2. **Activity participation:** Points from organized activities
3. **Athlete of the Month voting:** 5 points per vote cast
4. **Questionnaires:** 5 points per completed questionnaire
5. **Password change:** 5 points (one-time)
6. **Profile photo:** 5 points (one-time)
7. **Complete profile data:** 15 points (one-time)

---

## 6. TOOLS

### 6a. Timers (`timers`)

**Tab bar (6 timer modes):**
- Back button
- **TABATA** (filter_tilt_shift icon) -- default active
- **EMOM** (adjust icon)
- **AMRAP** (update icon)
- **FOR TIME** (access_time icon)
- **STOPWATCH** (timer icon)
- **GUARDADO** (Saved) (favorite_border icon) -- opens saved timers popup, pulsing icon for unseen

**Timer configuration form:**
- **Contagem inicial** (Initial countdown / Preparation time): picker (0-99 min : 0-59 sec), default "0m 10s"
- **Exercicio** (Exercise duration): picker (0-99 min : 0-59 sec), default "7m 00s"
- **Pausa** (Rest/Recovery time): picker (0-99 min : 0-59 sec), default "0m 30s"
- **Numero de Rondas** (Number of rounds): picker (1-99), default "1"
- **Ascending/Descending toggle:** Button toggles between:
  - "Descendente" / "Contagem ate zero" (Countdown to zero)
  - "Ascendente" / "Contagem crescente" (Count up)
  - Animated arrow rotation

**Save timer section:**
- "Titulo:" (Title) text input, max 30 characters
- "GUARDAR" (Save) button

**Launch buttons:**
- **"ABRIR NA APP"** (Open in app) -- opens timer in app view
- **"ENVIAR PARA ECRA"** (Send to screen) -- sends timer to home screen / external display

### 6b. Calculator (`calc_perc`)

**3-tab layout:**
- **"% RM"** -- active by default
- **"Calculadora"** (Calculator)
- **"Conversores"** (Converters)

#### Tab 1: % RM (Percentage of Rep Max)

**RM selector:** Dropdown (1RM through 10RM)

**Weight input:**
- -5 button, -1 button, weight input (number, default 100), +1 button, +5 button

**Percentage table (two columns):**
- Left column: 110%, 105%, 100%, 95%, 90%, 85%, 80%, 75%, 70%, 65%, 60%
- Right column: 55%, 50%, 45%, 40%, 35%, 30%, 25%, 20%, 15%, 10%, 5%
- Each shows calculated weight based on input

**Footer:** "Tabela calculada com base na 'Formula de Brzycki'"

#### Tab 2: Calculadora

- General calculator embedded via iframe

#### Tab 3: Conversores (Converters)

**4 conversion fields:**
- Miles to Km (input + result)
- Km to Miles (input + result)
- Libras (Pounds) to Kg (input + result)
- Kg to Libras (Pounds) (input + result)
- All update in real-time on keyup

---

## 7. STORE (POS)

### Store (`pos_loja_atletas`)

**2-tab layout:**
- **"A minha conta"** (My account) -- wallet icon, active by default
- **"Ver produtos"** (View products) -- dvr icon

#### Tab 1: My Account

**Balance display:**
- "O teu saldo" (Your balance): large text (e.g., "0,00 EUR")
- Hidden credit top-up form:
  - "Credito a ser acrescentado" (Credit to be added): number input
  - Dynamic display of new balance
  - **"EFETUAR PAGAMENTO"** (Make payment) button -- hidden until amount entered

**Info text:** "Fala com os gestores da tua box para acrescentar saldo a tua conta..."

**Purchase history:** Shows credit purchases (or empty state "Ainda nao fizeste nenhuma compra a credito")

#### Tab 2: Product Catalog

**Product grid (2-column float layout):**
Each product card shows:
- Product name
- Product image (clickable to zoom with multi-image gallery)
- Price in EUR
- Stock count

**Products observed (50+ items):** T-shirts, crop tops, sweaters, jackets, backpacks, socks, speed ropes, grips (multiple models), knee sleeves, wrist wraps, belts, patches, keychains, mugs, hats, tape, cables

---

## 8. TRAINING

### 8a. Training Planning (`planeamento`)

**Page header:** "[Month], [Year]"

**Navigation:**
- Back button
- Calendar icon (scrolls to top)

**Calendar widget:** Full month calendar for date selection

**Class type selector:** Dropdown with all class types:
- Animal Flow, Avaliacao Fisica, Breath Work, CF Endurance, CF Teens, CFA Games, Chuck Norris variants, CrossFit OPEN, Desafio Semanal, Dinner Time, Gratidao, Hyrox, HYROX Competition, Lift Off, Miss WOD (A/B), Mobility, Nutribox WOD, Open Box, Programa Iniciacao, Rabanada Killer, STAFF DAY OFF, Strength, Tasca Box, WOD, Workshop, Workshop + Hyrox, Workshop + WOD

**Create new button (+):** Reveals 3 options:
1. **"Inserir notas de treinador"** (Insert coach notes) -- assignment icon
2. **"Escolher de uma categoria"** (Choose from a category) -- menu icon
3. **"Criar um novo workout"** (Create a new workout) -- add_to_photos icon

**Events area:** Shows workouts planned for the selected date and class type

### 8b. Individual Workouts (`workouts_ind`)

**Scrollable category tab bar (21 categories):**
- Levantamentos (Lifts)
- Monoestruturados (Monostructural)
- PRs Gimnicos (Gymnastic PRs)
- Girls
- Heroes
- Notables
- Games
- CFA Secret Formula
- CFA Benchmarks
- CFA Partner Games
- APRE
- CONDITIONING
- CONDITIONING TESTs
- PT
- Warm Up
- Tabatas
- PRs Monostruturais
- Nutricao
- PRs Levantamentos
- ChalKIron Tests
- Breathwork

**Category list (also shown as vertical list):**
- Each category links to load that category's workouts
- Icon per category (SVG icons)

**Suggestion button:**
- "Escolhe uma categoria da lista acima, ou aceita uma sugestao do RegyBox"
- **"QUERO UMA SUGESTAO"** (I want a suggestion) -- RegyBox suggests a workout

---

## 9. SETTINGS

### 9a. Settings Menu (`configuracoes_submenu`)

**Page header:** "CONFIGURACOES"

**Menu items (list):**
1. **Dados pessoais** (Personal data) -- library_books icon
2. **Password de acesso** (Access password) -- featured_play_list icon
3. **A tua foto** (Your photo) -- photo_camera icon
4. **Tipos de aulas** (Class types) -- accessibility icon
5. **A tua conta** (Your account) -- work icon
6. **Opcoes de privacidade** (Privacy options) -- do_not_disturb_on icon
7. **Opcoes de e-mails** (Email options) -- at_fill icon
8. **Notificacoes** (Notifications) -- notifications icon
9. **Aspeto visual** (Visual appearance) -- color_lens icon
10. **Idioma** (Language) -- public icon -- smart select:
    - Portugues (selected)
    - English

### 9b. Personal Data (`dados_pessoais`)

**Page header:** "DADOS PESSOAIS"

**Save button** (top right): "GUARDAR"

**Form fields:**
1. **Nome apresentado** (Display name): dropdown with variations:
   - Primeiro e ultimo nome (First and last)
   - Segundo e ultimo nome
   - Primeiro e segundo nome
   - Primeiro e inicial do ultimo (First + last initial)
   - Segundo e inicial do ultimo
   - Apenas o primeiro nome (First only)
   - Apenas o segundo nome
   - Apenas o ultimo nome (Last only)
2. **Alcunha / Nickname**: text input
3. **E-mail**: text input
4. **Data de nascimento** (Date of birth): date picker
5. **B.I./C.C.** (ID card): text, max 20 chars
6. **Validade B.I./C.C.** (ID expiry): date picker
7. **No utente de saude** (Health number): text, max 14 chars
8. **NIF** (Tax ID): number, max 14 chars
9. **Telemovel** (Mobile phone): number, max 9 chars
10. **Contacto de emergencia** (Emergency contact): number, max 9 chars
11. **Genero** (Gender): dropdown -- Masculino / Feminino
12. **Profissao** (Profession): text, max 50 chars
13. **Morada** (Address): text, max 250 chars
14. **Localidade** (City): text, max 100 chars
15. **Codigo postal** (Postal code): text, max 9 chars
16. **Pais** (Country): dropdown with 240 countries
17. **T-shirt**: dropdown -- XS, S, M, L, XL, XXL
18. **Peso (Kg)** (Weight): dropdown 10-230 kg
19. **Estatura (cm)** (Height): dropdown 40-230 cm
20. **Indice de massa corporal** (BMI): auto-calculated read-only field (WHO formula)

**Bottom button:** "GUARDAR ALTERACOES" (Save changes)

**Validation messages:** Invalid nickname, invalid email, duplicate email, success

### 9c. Password Change (`dados_acesso`)

**Page header:** "PASSWORD DE ACESSO"

**Form fields:**
1. **Palavra passe atual** (Current password): password input (unlock icon)
2. **Nova palavra passe** (New password): password input (unlock_fill icon)
3. **Confirma a nova palavra passe** (Confirm new password): password input (unlock_fill icon)

**Button:** "ALTERAR PALAVRA PASSE" (Change password)

**Validation messages:** Missing current, incorrect current, missing new, missing confirm, mismatch, success

### 9d. Your Account (`sua_conta`)

**Page header:** "A TUA CONTA"

**Plan details card:**
- Editable plan name ("Plano principal") -- contentEditable div, auto-saves on blur
- Payment type: "Livre-transito" (Unlimited pass)
- **Allowed class types** (26 types listed with icons):
  - Animal Flow, Breath Work, CF Endurance, CF Teens, CFA Games, Chuck Norris variants, CrossFit OPEN, Desafio Semanal, Dinner Time, Gratidao, Hyrox, HYROX Competition, Lift Off, Miss WOD (A/B), Mobility, Nutribox WOD, Open Box, Rabanada Killer, STAFF DAY OFF, Strength, Tasca Box, WOD, Workshop, Workshop + Hyrox, Workshop + WOD

**Account deletion section:**
- Explanation text about permanent data deletion
- **"Pede a eliminacao da tua conta"** (Request account deletion) -- link with confirmation dialog

### 9e. Notifications (`opcoes`)

**Page header:** "NOTIFICACOES"

**Toggle switches (all green):**
1. **Notificacoes de comentarios** (Comment notifications): toggle, default ON
2. **Notificacoes de fist bumps**: toggle, default ON
3. **Notificacoes de aniversarios** (Birthday notifications): toggle, default ON
4. **Notificacoes de medalhas do challenge** (Challenge medal notifications): toggle, default ON

All auto-save on change.

### 9f. Class Options (`opt_aulas`)

**Page header:** "Locais das aulas" (Class locations)

**Content:** Loaded via iframe -- allows configuring which class locations to show

### 9g. Email Options (`opt_emails`)

**Page header:** "OPCOES DE E-MAILS"

**Instruction:** "Assinala os e-mails que pretendes receber" (Select the emails you want to receive)

**Checkboxes:**
1. Comprovativos de pagamentos de mensalidades (Payment receipts)
2. Confirmacao de marcacao de aula, quando a marcacao e feita por um treinador (Class booking confirmation when booked by coach)
3. Informacao de abertura de vaga para uma aula, quando o atleta se encontra em lista de espera (Waitlist spot opened notification)
4. Emails enviados pelos gestores da box (Emails sent by box managers)

All auto-save on change.

### 9h. Privacy Options (`opt_privacidade`)

**Page header:** "OPCOES DE PRIVACIDADE"

**4 privacy settings (smart select dropdowns):**
1. **Quem pode ver os meus recordes pessoais** (Who can see my personal records):
   - Todos (Everyone) -- default
   - A minha box (My box only)
   - So eu (Only me)
2. **Quem pode ver os resultados das atividades em que participei** (Who can see my activity results):
   - Todos / A minha box / So eu
3. **Quem pode ver o meu nome na lista de inscricoes para as aulas** (Who can see my name in class enrollments):
   - Todos / A minha box
4. **Quem pode ver os meus resultados na tabela classificativa dos workouts** (Who can see my leaderboard results):
   - So eu / A minha box -- default "A minha box"

**Save button:** "GUARDAR ALTERACOES"

**Important restriction:** Changes can only be made once every 48 hours (with confirmation dialog)

**Expandable details section:** Explains each privacy option in detail

### 9i. Photo Upload (`foto`)

**Page header:** "A TUA FOTO"

**Actions:**
- **"ESCOLHER FOTO"** (Choose photo) -- triggers image import
- **"GUARDAR"** (Save) -- saves cropped image
- **"ELIMINAR FOTO"** (Delete photo) -- with confirmation dialog

**Image cropper:** Embedded iframe with crop functionality (`crop_imagem/index.php`)

### 9j. Visual Appearance / Color Theme (`cores`)

**Page header:** "ASPETO VISUAL"

**Section 1: Cor do fundo (Background color)**
- White swatch (light theme)
- Black swatch (dark theme)

**Section 2: Padrao do fundo (Background pattern)** -- only shown in dark mode
- 6 background pattern options (back1.jpg through back6.jpg)
- Grid of 3x2 pattern swatches

**Section 3: Cor do tema (Theme color)**
- 6 color options as buttons:
  - Red, Green, Blue, Pink, Orange, Gray

All changes apply immediately with visual preview.

---

## 10. FEEDBACK

### Feedback Page (`feedback`)

**2-tab layout:**
- Tab 1: "A minha box" (My box) -- active
- Tab 2: "Equipa RegyBox" (RegyBox Team) -- hidden by default

#### Tab 1: Contact Box Staff

**Info text:** Instructions to contact box managers for payments, schedules, bookings, etc.

**Email form (identical to My Box contact):**
- **"Enviar e-mail para"** (Send to): dropdown of coaches/staff
- **"Assunto"** (Subject): text input
- **"Mensagem"** (Message): textarea (resizable)
- **"Cancelar"** / **"Enviar email"** buttons

#### Tab 2: Contact RegyBox Team

**Info text:** For reporting bugs, sending suggestions, or requesting help

**Feedback form:**
- **"Duvida, sugestao, bug?"** (Question, suggestion, bug?): dropdown
  - Tenho uma duvida (I have a question)
  - Tenho uma sugestao (I have a suggestion)
  - Encontrei um bug (I found a bug)
- **"Descricao"** (Description): textarea with placeholder
- **"CANCELAR"** / **"ENVIAR"** buttons

**Social links:** Facebook iframe, RegyBox logo

---

## 11. DIGITAL DOSSIERS

### Dossiers Page (`dossies`)

**Page header:** "DOSSIES DIGITAIS"

**Content:**
- Items count label (top right: "Items")
- Empty list (no dossiers available in captured state)
- Likely contains documents, waivers, contracts, or informational files from the box

---

## CROSS-CUTTING PATTERNS

### Navigation
- Every page has a back button (arrow_left_circle_fill icon)
- Framework7 routing with `open_page()`, `popup()`, and `atual()` functions
- Popups used extensively for detail views, forms, and modals
- iframes used for JS controllers and form submissions

### Social Features
- **Fist bumps** (like/reaction system) -- used on WOD results, news posts
- **Comments** -- available on WODs, news posts, birthday messages
- **Like counts** with expandable viewer lists
- **Fan list** tracking who gives you the most reactions

### Authentication
- Token-based auth via `z` parameter (SHA hash)
- Session maintained across all pages

### Theming
- Dark/light mode toggle
- 6 background patterns (dark mode only)
- 6 accent colors (red, green, blue, pink, orange, gray)
- Saved per-user

### Internationalization
- Portuguese (default) and English
- All UI strings are in Portuguese in the captured state

### Data Loading
- AJAX content loading via `carrega_pagina()` function
- iframes for JS controllers (`prov_*` naming convention)
- Spinner overlay during loads
- Fade/slide animations

### Form Patterns
- Framework7 list inputs with labels
- Clear buttons on text inputs
- Smart selects for dropdowns (open as bottom sheets)
- Inline form validation with hidden error message fields
- Form submission via hidden iframes (`target="prov"`)

### Cross-Box Features
- Activities can be viewed across ALL RegyBox-networked boxes (200+)
- PR import from other boxes
- Box records searchable across the network
