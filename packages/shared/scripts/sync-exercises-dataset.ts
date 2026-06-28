import { writeFile } from "node:fs/promises";
import path from "node:path";

type RemoteExercise = {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: {
    en: string;
    tr: string;
  };
  instruction_steps?: {
    en?: string[];
    tr?: string[];
  };
  muscle_group?: string;
  secondary_muscles?: string[];
  target?: string;
  image?: string;
  gif_url?: string;
};

type ExerciseCategory = "weightlifting" | "gymnastics" | "cardio" | "strength" | "mobility" | "other";

const RAW_URL = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";
const DATASET_URL = `${RAW_URL}/data/exercises.json`;
const OUT_FILE = path.resolve(
  process.cwd(),
  "packages/shared/src/mock/exercises-dataset.generated.ts",
);

function mapCategory(remote: RemoteExercise): ExerciseCategory {
  const bucket = `${remote.body_part} ${remote.category}`.toLowerCase();
  if (bucket.includes("cardio") || bucket.includes("aerobic")) return "cardio";
  if (bucket.includes("stretch") || bucket.includes("mobility")) return "mobility";
  if (
    bucket.includes("back") ||
    bucket.includes("chest") ||
    bucket.includes("shoulder") ||
    bucket.includes("arm") ||
    bucket.includes("leg") ||
    bucket.includes("waist") ||
    bucket.includes("core") ||
    bucket.includes("upper") ||
    bucket.includes("lower")
  ) {
    return "strength";
  }
  return "other";
}

function toArray(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;
  return Array.isArray(value)
    ? value.map((item) => item.trim()).filter(Boolean)
    : value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function toInstructions(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildPortugueseInstructions(name: string, category: ExerciseCategory, equipment: string[]) {
  const equipmentText = equipment.length > 0 ? equipment.join(", ") : "peso corporal";
  const base = [
    `Prepara ${name.toLowerCase()} com controlo e confirma a posição antes de acelerar.`,
    `Mantém o tronco firme e usa ${equipmentText} quando fizer sentido para o movimento.`,
    "Termina cada repetição com estabilidade e reduz a variação se a técnica degradar.",
  ];

  if (category === "mobility") {
    return [
      "Entra na posição sem pressa e regula a respiração antes de aprofundar.",
      "Mantém a postura com controlo e relaxa as zonas que precisam de abrir.",
      "Ajusta a intensidade para ser útil e não agressiva.",
    ];
  }

  if (category === "cardio") {
    return [
      "Encontra um ritmo que consigas sustentar sem perder a mecânica.",
      "Mantém o movimento eficiente para poupar energia.",
      "Controla a respiração e ajusta a cadência antes de rebentar.",
    ];
  }

  if (category === "gymnastics") {
    return [
      "Começa com tensão ativa e mantém a linha corporal controlada.",
      "Usa o impulso certo para atravessar a transição com eficiência.",
      "Fecha com bloqueio sólido e regressa sem perder a posição.",
    ];
  }

  if (category === "weightlifting") {
    return [
      "Ajusta os pés, prepara o core e mantém o tronco estável.",
      "Desce e sobe com controlo, mantendo a barra ou carga no trajeto certo.",
      "Protege a técnica sempre que a carga ou o ritmo aumentarem.",
    ];
  }

  return base;
}

function rawMediaUrl(kind: "images" | "videos", file?: string): string | undefined {
  if (!file) return undefined;
  return `${RAW_URL}/${kind}/${file}`;
}

async function main() {
  const exercises = (await fetch(DATASET_URL).then((response) => response.json())) as RemoteExercise[];

  const mapped = exercises.map((item) => {
    const stepsEn = item.instruction_steps?.en?.length ? item.instruction_steps.en : toInstructions(item.instructions.en);
    const stepsEs = item.instruction_steps?.es?.length ? item.instruction_steps.es : toInstructions(item.instructions.es);
    const stepsPt = buildPortugueseInstructions(item.name, mapCategory(item), toArray(item.equipment) ?? []);
    return {
      id: `ds-${item.id}`,
      name: item.name,
      category: mapCategory(item),
      thumbnailUrl: rawMediaUrl("images", item.image),
      gifUrl: rawMediaUrl("videos", item.gif_url),
      description: toInstructions(item.instructions.en)[0] ?? item.name,
      equipment: toArray(item.equipment) ?? undefined,
      muscleGroups: [
        ...new Set(
          [
            item.target,
            item.muscle_group,
            ...(item.secondary_muscles ?? []),
          ].flatMap((value) => (value ? [value] : [])),
        ),
      ],
      scaledVariations: [
        `Bodyweight / reduced range version`,
        `Tempo / pause version`,
        `Assisted or regression version`,
      ],
      instructions: {
        pt: stepsPt,
        en: stepsEn,
        es: stepsEs,
      },
    };
  });

  const file = `import type { Exercise } from "../types/models";\n\nexport const importedExercises: Exercise[] = ${JSON.stringify(mapped, null, 2)};\n`;
  await writeFile(OUT_FILE, file, "utf8");
  console.log(`Wrote ${mapped.length} exercises to ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
