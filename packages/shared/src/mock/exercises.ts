import type { Exercise } from "../types/models";
import { importedExercises } from "./exercises-dataset.generated";

type ExerciseCategory = Exercise["category"];

function buildExerciseDescription(name: string, category: ExerciseCategory): string {
  const descriptions: Record<string, string> = {
    "Back Squat":
      "The back squat is a foundational strength movement. With the barbell resting on the upper back, the athlete squats to below parallel and drives up. It builds tremendous lower-body strength and is a staple of any strength program.",
    "Front Squat":
      "The front squat places the barbell across the front of the shoulders, demanding an upright torso. This variation develops quad strength and core stability, and carries over directly to the clean.",
    Deadlift:
      "The deadlift is the ultimate test of full-body strength. Lifting a loaded barbell from the floor to standing engages the entire posterior chain, grip, and core. Proper bracing and hip hinge mechanics are essential.",
    "Clean & Jerk":
      "The clean and jerk is one of two Olympic lifts contested in competition. The barbell is pulled from the floor to the shoulders (clean), then driven overhead (jerk). It demands power, speed, and coordination.",
    Snatch:
      "The snatch is the fastest lift in Olympic weightlifting. The barbell travels from the floor to overhead in one continuous motion. It requires exceptional mobility, timing, and explosive hip extension.",
    "Pull-Up":
      "The pull-up is a fundamental gymnastics movement for developing upper-body pulling strength. Starting from a dead hang, the athlete pulls until the chin clears the bar.",
    "Muscle-Up (Ring)":
      "The ring muscle-up combines a pull-up and dip in one fluid motion on gymnastics rings. It requires significant pulling strength, a powerful hip kip, and a fast transition above the rings.",
    Burpee:
      "The burpee is a full-body conditioning movement. Drop to the floor, perform a push-up, jump to feet, and jump with hands overhead. Simple but devastatingly effective for metabolic conditioning.",
    "Double Under":
      "Double unders involve spinning the jump rope twice under the feet per jump. They develop coordination, calf endurance, and cardiovascular capacity. A key CrossFit skill movement.",
    "Wall Ball":
      "The wall ball shot combines a front squat with a push-press throw to a target. Using a medicine ball, the athlete squats to depth and explosively throws the ball to the specified height.",
    "KB Swing":
      "The kettlebell swing is a dynamic hip-hinge movement. The kettlebell swings between the legs and is driven forward and upward by explosive hip extension. It builds posterior chain power and grip endurance.",
  };

  if (descriptions[name]) return descriptions[name];

  const genericByCategory: Record<ExerciseCategory, string> = {
    weightlifting: `${name} is a weightlifting movement that develops strength and power. Focus on proper form, controlled tempo, and progressive overload. This exercise is commonly programmed in strength blocks and competition preparation.`,
    gymnastics: `${name} is a gymnastics movement that builds body control, coordination, and relative strength. Start with scaled progressions and work toward the full range of motion. Consistency in practice is key to mastery.`,
    cardio: `${name} is a cardiovascular conditioning exercise that improves aerobic and anaerobic capacity. It can be programmed at various intensities for endurance work, intervals, or as part of metabolic conditioning circuits.`,
    strength: `${name} is an accessory strength movement that targets specific muscle groups. It complements the major compound lifts and helps address weaknesses, prevent imbalances, and build work capacity.`,
    mobility: `${name} is a mobility exercise designed to improve range of motion and tissue quality. Regular practice helps prevent injury, improves movement quality, and supports recovery between training sessions.`,
    other: `${name} is a functional training movement that develops work capacity and general physical preparedness. It can be scaled to various fitness levels and is commonly used in metabolic conditioning workouts.`,
  };

  return genericByCategory[category];
}

function buildExerciseVideoUrl(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${name} CrossFit movement demo`,
  )}`;
}

function buildExerciseInstructions(name: string, category: ExerciseCategory, equipment: string[]) {
  const equipmentText = equipment.length > 0 ? equipment.join(", ") : undefined;
  const ptEquipment = equipmentText ?? "peso corporal";
  const enEquipment = equipmentText ?? "bodyweight";
  const esEquipment = equipmentText ?? "peso corporal";
  const base = {
    pt: [
      `Posiciona-te para ${name.toLowerCase()} com controlo e define a técnica antes de acelerar.`,
      `Mantém o tronco firme, usa ${ptEquipment} quando aplicável e completa a amplitude com intenção.`,
      `Termina a repetição com estabilidade e ajusta carga, tempo ou variação se perderes qualidade.`,
    ],
    en: [
      `Set up for ${name} with control and lock in the movement pattern before you move faster.`,
      `Brace the midline, use ${enEquipment} when relevant, and move through the full range with intent.`,
      `Finish with stability and adjust load, tempo, or variation as soon as quality drops.`,
    ],
    es: [
      `Colócate para ${name.toLowerCase()} con control y fija el patrón antes de acelerar.`,
      `Mantén el tronco firme, usa ${esEquipment} cuando aplique y completa el recorrido con intención.`,
      `Termina la repetición con estabilidad y ajusta carga, tempo o variante si la calidad cae.`,
    ],
  };

  if (name === "Back Squat" || name === "Front Squat" || name === "Overhead Squat") {
    return {
      pt: [
        "Coloca os pés firmes, prepara o core e mantém o peito aberto durante toda a descida.",
        "Desce com controlo até abaixo do paralelo e sobe a partir do meio do pé.",
        "Mantém a barra estável e evita colapsar joelhos ou inclinar demasiado o tronco.",
      ],
      en: [
        "Set the feet, brace the core, and keep the chest tall throughout the descent.",
        "Descend under control to full depth and drive up through the midfoot.",
        "Keep the bar stable and avoid knee collapse or excessive torso pitch.",
      ],
      es: [
        "Coloca los pies firmes, activa el core y mantén el pecho alto durante toda la bajada.",
        "Desciende con control hasta la profundidad completa y sube desde el medio del pie.",
        "Mantén la barra estable y evita que las rodillas colapsen o que el tronco se incline demasiado.",
      ],
    };
  }

  if (name.includes("Pull-Up") || name.includes("Muscle-Up")) {
    return {
      pt: [
        "Parte de uma suspensão ativa e mantém a linha corporal controlada.",
        "Usa tensão no tronco e o impulso correto para atravessar a transição com eficiência.",
        "Termina com bloqueio sólido acima da barra ou dos anéis e regressa sem perder a posição.",
      ],
      en: [
        "Start from an active hang and keep the body line controlled.",
        "Use midline tension and the right kip to move through the transition efficiently.",
        "Finish with a solid lockout above the bar or rings and return without losing position.",
      ],
      es: [
        "Empieza desde una suspensión activa y mantén la línea corporal controlada.",
        "Usa tensión en el tronco y el impulso correcto para pasar la transición con eficiencia.",
        "Termina con bloqueo sólido sobre la barra o los anillos y baja sin perder la posición.",
      ],
    };
  }

  if (name === "Burpee" || name.includes("Burpee")) {
    return {
      pt: [
        "Mantém o ritmo constante e pousa as mãos e os pés no sítio certo a cada repetição.",
        "Mexe-te de forma compacta para poupar tempo e reduzir impacto desnecessário.",
        "Salta com extensão total do corpo e volta a respirar antes da próxima repetição.",
      ],
      en: [
        "Keep the pace steady and place hands and feet consistently on every rep.",
        "Move compactly to save time and reduce unnecessary impact.",
        "Jump to full extension and reset breathing before the next rep.",
      ],
      es: [
        "Mantén un ritmo constante y coloca manos y pies en el mismo sitio en cada repetición.",
        "Muévete de forma compacta para ahorrar tiempo y reducir impacto innecesario.",
        "Salta con extensión total del cuerpo y recupera la respiración antes de la siguiente repetición.",
      ],
    };
  }

  if (category === "mobility") {
    return {
      pt: [
        "Entra na posição sem pressa e procura respiração calma antes de aprofundar o movimento.",
        "Sustém a posição com controlo e procura relaxar as zonas que precisam de abrir.",
        "Respeita a sensação do corpo e ajusta a intensidade para permanecer útil, não agressivo.",
      ],
      en: [
        "Ease into the position and settle your breathing before deepening the movement.",
        "Hold the shape with control and relax the areas that need to open up.",
        "Respect the body's feedback and keep the intensity useful, not aggressive.",
      ],
      es: [
        "Entra en la posición sin prisa y regula la respiración antes de profundizar el movimiento.",
        "Sostén la postura con control y relaja las zonas que necesitan abrirse.",
        "Respeta la sensación del cuerpo y ajusta la intensidad para que sea útil, no agresiva.",
      ],
    };
  }

  if (category === "cardio") {
    return {
      pt: [
        "Estabelece um ritmo que consigas sustentar sem perder a técnica nas últimas repetições.",
        "Mantém uma mecânica eficiente para conservar energia e reduzir quebras no movimento.",
        "Usa respiração controlada e ajusta a cadência antes de chegares ao limite.",
      ],
      en: [
        "Set a pace you can sustain without losing mechanics late in the set.",
        "Keep the movement efficient to conserve energy and reduce breakdown.",
        "Use controlled breathing and adjust cadence before you hit the wall.",
      ],
      es: [
        "Marca un ritmo que puedas sostener sin perder técnica al final de la serie.",
        "Mantén el movimiento eficiente para conservar energía y reducir fallos.",
        "Usa respiración controlada y ajusta la cadencia antes de llegar al límite.",
      ],
    };
  }

  return base;
}

function buildScaledVariations(name: string, category: ExerciseCategory) {
  if (category === "mobility") {
    return [
      "Shorter hold with more support",
      "Use a gentler range of motion",
      "Add longer pauses between reps",
    ];
  }

  if (category === "cardio") {
    return [
      "Shorten the distance or reps",
      "Reduce pace and keep moving",
      "Swap to a lower-impact pattern",
    ];
  }

  if (category === "gymnastics") {
    return [
      "Band-assisted progression",
      "Strict / reduced-ROM version",
      "Use a low-ring or box setup",
    ];
  }

  if (category === "weightlifting") {
    return [
      "Reduce load and keep positions",
      "Use a hang or power variation",
      "Add a pause to remove momentum",
    ];
  }

  return [
    `Reduce load or range for ${name}`,
    "Use dumbbells or bodyweight where possible",
    "Slow the tempo and build back up",
  ];
}

const legacyExercises: Exercise[] = [
  // ─── Weightlifting (20) ────────────────────────────────────
  { id: "ex-1", name: "Back Squat", category: "weightlifting", equipment: ["barbell", "rack"], muscleGroups: ["quads", "glutes", "core"] },
  { id: "ex-2", name: "Front Squat", category: "weightlifting", equipment: ["barbell", "rack"], muscleGroups: ["quads", "core"] },
  { id: "ex-3", name: "Deadlift", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["posterior chain", "back", "grip"] },
  { id: "ex-4", name: "Clean & Jerk", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["full body"] },
  { id: "ex-5", name: "Snatch", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["full body"] },
  { id: "ex-6", name: "Power Clean", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["full body"] },
  { id: "ex-7", name: "Hang Clean", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["full body", "grip"] },
  { id: "ex-8", name: "Clean Pull", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["posterior chain", "traps"] },
  { id: "ex-9", name: "Snatch Pull", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["posterior chain", "traps"] },
  { id: "ex-10", name: "Push Press", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["shoulders", "triceps", "legs"] },
  { id: "ex-11", name: "Push Jerk", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["shoulders", "triceps", "legs"] },
  { id: "ex-12", name: "Split Jerk", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["shoulders", "triceps", "legs"] },
  { id: "ex-13", name: "Overhead Squat", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["quads", "shoulders", "core"] },
  { id: "ex-14", name: "Sumo Deadlift", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["glutes", "adductors", "back"] },
  { id: "ex-15", name: "Romanian Deadlift", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["hamstrings", "glutes", "back"] },
  { id: "ex-16", name: "Good Morning", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["hamstrings", "lower back"] },
  { id: "ex-17", name: "Bench Press", category: "weightlifting", equipment: ["barbell", "bench"], muscleGroups: ["chest", "triceps"] },
  { id: "ex-18", name: "Incline Press", category: "weightlifting", equipment: ["barbell", "bench"], muscleGroups: ["upper chest", "shoulders", "triceps"] },
  { id: "ex-19", name: "Floor Press", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["chest", "triceps"] },
  { id: "ex-20", name: "Pendlay Row", category: "weightlifting", equipment: ["barbell"], muscleGroups: ["back", "biceps"] },

  // ─── Gymnastics (20) ───────────────────────────────────────
  { id: "ex-21", name: "Pull-Up", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["back", "biceps"] },
  { id: "ex-22", name: "Chest-to-Bar", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["back", "biceps", "lats"] },
  { id: "ex-23", name: "Muscle-Up (Bar)", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["back", "chest", "triceps"] },
  { id: "ex-24", name: "Muscle-Up (Ring)", category: "gymnastics", equipment: ["rings"], muscleGroups: ["back", "chest", "triceps"] },
  { id: "ex-25", name: "Ring Dip", category: "gymnastics", equipment: ["rings"], muscleGroups: ["chest", "triceps"] },
  { id: "ex-26", name: "Handstand Push-Up", category: "gymnastics", equipment: ["wall"], muscleGroups: ["shoulders", "triceps"] },
  { id: "ex-27", name: "Handstand Walk", category: "gymnastics", equipment: [], muscleGroups: ["shoulders", "core", "balance"] },
  { id: "ex-28", name: "Toes to Bar", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["core", "grip"] },
  { id: "ex-29", name: "Knees to Elbow", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["core", "grip"] },
  { id: "ex-30", name: "L-Sit", category: "gymnastics", equipment: ["parallettes"], muscleGroups: ["core", "hip flexors"] },
  { id: "ex-31", name: "Pistol Squat", category: "gymnastics", equipment: [], muscleGroups: ["quads", "glutes", "balance"] },
  { id: "ex-32", name: "Box Jump", category: "gymnastics", equipment: ["box"], muscleGroups: ["quads", "glutes"] },
  { id: "ex-33", name: "Box Step-Up", category: "gymnastics", equipment: ["box"], muscleGroups: ["quads", "glutes"] },
  { id: "ex-34", name: "Rope Climb", category: "gymnastics", equipment: ["rope"], muscleGroups: ["back", "grip", "biceps"] },
  { id: "ex-35", name: "Pegboard", category: "gymnastics", equipment: ["pegboard"], muscleGroups: ["back", "grip", "shoulders"] },
  { id: "ex-36", name: "Strict Pull-Up", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["back", "biceps"] },
  { id: "ex-37", name: "Kipping Pull-Up", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["back", "biceps", "core"] },
  { id: "ex-38", name: "Butterfly Pull-Up", category: "gymnastics", equipment: ["pull-up bar"], muscleGroups: ["back", "biceps", "coordination"] },
  { id: "ex-39", name: "Ring Row", category: "gymnastics", equipment: ["rings"], muscleGroups: ["back", "biceps"] },
  { id: "ex-40", name: "GHD Sit-Up", category: "gymnastics", equipment: ["GHD"], muscleGroups: ["core", "hip flexors"] },

  // ─── Cardio (15) ───────────────────────────────────────────
  { id: "ex-41", name: "Run", category: "cardio", equipment: [], muscleGroups: ["legs", "cardio"] },
  { id: "ex-42", name: "Row (Concept2)", category: "cardio", equipment: ["rower"], muscleGroups: ["full body"] },
  { id: "ex-43", name: "Assault Bike", category: "cardio", equipment: ["assault bike"], muscleGroups: ["full body"] },
  { id: "ex-44", name: "Ski Erg", category: "cardio", equipment: ["ski erg"], muscleGroups: ["back", "triceps", "core"] },
  { id: "ex-45", name: "Double Under", category: "cardio", equipment: ["jump rope"], muscleGroups: ["calves", "coordination"] },
  { id: "ex-46", name: "Single Under", category: "cardio", equipment: ["jump rope"], muscleGroups: ["calves"] },
  { id: "ex-47", name: "Burpee", category: "cardio", equipment: [], muscleGroups: ["full body"] },
  { id: "ex-48", name: "Burpee Box Jump Over", category: "cardio", equipment: ["box"], muscleGroups: ["full body"] },
  { id: "ex-49", name: "Burpee Over Bar", category: "cardio", equipment: ["barbell"], muscleGroups: ["full body"] },
  { id: "ex-50", name: "Shuttle Run", category: "cardio", equipment: [], muscleGroups: ["legs", "agility"] },
  { id: "ex-51", name: "Bike (Outdoor)", category: "cardio", equipment: ["bicycle"], muscleGroups: ["quads", "cardio"] },
  { id: "ex-52", name: "Swimming", category: "cardio", equipment: [], muscleGroups: ["full body"] },
  { id: "ex-53", name: "Jump Rope", category: "cardio", equipment: ["jump rope"], muscleGroups: ["calves", "coordination"] },
  { id: "ex-54", name: "Sled Push", category: "cardio", equipment: ["sled"], muscleGroups: ["quads", "glutes", "cardio"] },
  { id: "ex-55", name: "Sled Pull", category: "cardio", equipment: ["sled"], muscleGroups: ["back", "hamstrings", "grip"] },

  // ─── Strength (15) ─────────────────────────────────────────
  { id: "ex-56", name: "Hip Thrust", category: "strength", equipment: ["barbell", "bench"], muscleGroups: ["glutes", "hamstrings"] },
  { id: "ex-57", name: "Glute Bridge", category: "strength", equipment: [], muscleGroups: ["glutes", "hamstrings"] },
  { id: "ex-58", name: "Leg Press", category: "strength", equipment: ["leg press machine"], muscleGroups: ["quads", "glutes"] },
  { id: "ex-59", name: "Leg Curl", category: "strength", equipment: ["machine"], muscleGroups: ["hamstrings"] },
  { id: "ex-60", name: "Leg Extension", category: "strength", equipment: ["machine"], muscleGroups: ["quads"] },
  { id: "ex-61", name: "Calf Raise", category: "strength", equipment: ["barbell"], muscleGroups: ["calves"] },
  { id: "ex-62", name: "Dumbbell Row", category: "strength", equipment: ["dumbbell", "bench"], muscleGroups: ["back", "biceps"] },
  { id: "ex-63", name: "Dumbbell Press", category: "strength", equipment: ["dumbbells", "bench"], muscleGroups: ["chest", "triceps"] },
  { id: "ex-64", name: "Arnold Press", category: "strength", equipment: ["dumbbells"], muscleGroups: ["shoulders", "triceps"] },
  { id: "ex-65", name: "Lateral Raise", category: "strength", equipment: ["dumbbells"], muscleGroups: ["shoulders"] },
  { id: "ex-66", name: "Face Pull", category: "strength", equipment: ["cable machine", "band"], muscleGroups: ["rear delts", "traps"] },
  { id: "ex-67", name: "Tricep Extension", category: "strength", equipment: ["dumbbell"], muscleGroups: ["triceps"] },
  { id: "ex-68", name: "Bicep Curl", category: "strength", equipment: ["dumbbell"], muscleGroups: ["biceps"] },
  { id: "ex-69", name: "Hammer Curl", category: "strength", equipment: ["dumbbells"], muscleGroups: ["biceps", "forearms"] },
  { id: "ex-70", name: "Skull Crusher", category: "strength", equipment: ["barbell", "bench"], muscleGroups: ["triceps"] },

  // ─── Mobility (10) ─────────────────────────────────────────
  { id: "ex-71", name: "Foam Roll", category: "mobility", equipment: ["foam roller"], muscleGroups: ["full body"] },
  { id: "ex-72", name: "Pigeon Stretch", category: "mobility", equipment: [], muscleGroups: ["glutes", "hip flexors"] },
  { id: "ex-73", name: "Couch Stretch", category: "mobility", equipment: [], muscleGroups: ["hip flexors", "quads"] },
  { id: "ex-74", name: "Banded Shoulder", category: "mobility", equipment: ["band"], muscleGroups: ["shoulders"] },
  { id: "ex-75", name: "Lacrosse Ball", category: "mobility", equipment: ["lacrosse ball"], muscleGroups: ["full body"] },
  { id: "ex-76", name: "Cat-Cow", category: "mobility", equipment: [], muscleGroups: ["spine", "core"] },
  { id: "ex-77", name: "World's Greatest Stretch", category: "mobility", equipment: [], muscleGroups: ["hips", "thoracic", "hamstrings"] },
  { id: "ex-78", name: "90/90 Hip", category: "mobility", equipment: [], muscleGroups: ["hips", "glutes"] },
  { id: "ex-79", name: "Scorpion", category: "mobility", equipment: [], muscleGroups: ["thoracic", "hip flexors"] },
  { id: "ex-80", name: "Thoracic Rotation", category: "mobility", equipment: [], muscleGroups: ["thoracic spine", "core"] },

  // ─── Other / Equipment (20) ────────────────────────────────
  { id: "ex-81", name: "Wall Ball", category: "other", equipment: ["medicine ball"], muscleGroups: ["quads", "shoulders"] },
  { id: "ex-82", name: "KB Swing", category: "other", equipment: ["kettlebell"], muscleGroups: ["posterior chain", "grip"] },
  { id: "ex-83", name: "KB Clean", category: "other", equipment: ["kettlebell"], muscleGroups: ["full body", "grip"] },
  { id: "ex-84", name: "KB Snatch", category: "other", equipment: ["kettlebell"], muscleGroups: ["full body", "grip"] },
  { id: "ex-85", name: "Turkish Get-Up", category: "other", equipment: ["kettlebell"], muscleGroups: ["full body", "stability"] },
  { id: "ex-86", name: "Farmers Carry", category: "other", equipment: ["dumbbells", "kettlebells"], muscleGroups: ["grip", "core", "traps"] },
  { id: "ex-87", name: "Sandbag Clean", category: "other", equipment: ["sandbag"], muscleGroups: ["full body", "grip"] },
  { id: "ex-88", name: "D-Ball Over Shoulder", category: "other", equipment: ["d-ball"], muscleGroups: ["full body", "grip"] },
  { id: "ex-89", name: "Tire Flip", category: "other", equipment: ["tire"], muscleGroups: ["full body"] },
  { id: "ex-90", name: "Battle Ropes", category: "other", equipment: ["battle ropes"], muscleGroups: ["shoulders", "core", "cardio"] },
  { id: "ex-91", name: "Medicine Ball Slam", category: "other", equipment: ["medicine ball"], muscleGroups: ["core", "shoulders", "full body"] },
  { id: "ex-92", name: "Plank", category: "other", equipment: [], muscleGroups: ["core"] },
  { id: "ex-93", name: "Side Plank", category: "other", equipment: [], muscleGroups: ["obliques", "core"] },
  { id: "ex-94", name: "Hollow Hold", category: "other", equipment: [], muscleGroups: ["core"] },
  { id: "ex-95", name: "Superman", category: "other", equipment: [], muscleGroups: ["lower back", "glutes"] },
  { id: "ex-96", name: "Bear Crawl", category: "other", equipment: [], muscleGroups: ["core", "shoulders", "coordination"] },
  { id: "ex-97", name: "Crab Walk", category: "other", equipment: [], muscleGroups: ["triceps", "core", "shoulders"] },
  { id: "ex-98", name: "Duck Walk", category: "other", equipment: [], muscleGroups: ["quads", "glutes", "hip mobility"] },
  { id: "ex-99", name: "Lunges", category: "other", equipment: [], muscleGroups: ["quads", "glutes", "balance"] },
  { id: "ex-100", name: "Thruster", category: "other", equipment: ["barbell"], muscleGroups: ["quads", "shoulders", "full body"] },
];

const mappedLegacyExercises: Exercise[] = legacyExercises.map((exercise) => ({
  ...exercise,
  videoUrl: exercise.videoUrl ?? buildExerciseVideoUrl(exercise.name),
  thumbnailUrl: exercise.thumbnailUrl ?? undefined,
  gifUrl: exercise.gifUrl ?? undefined,
  description: exercise.description ?? buildExerciseDescription(exercise.name, exercise.category),
  scaledVariations: exercise.scaledVariations ?? buildScaledVariations(exercise.name, exercise.category),
  instructions: exercise.instructions ?? buildExerciseInstructions(exercise.name, exercise.category, exercise.equipment ?? []),
}));

export const mockExercises: Exercise[] = [...mappedLegacyExercises, ...importedExercises];
