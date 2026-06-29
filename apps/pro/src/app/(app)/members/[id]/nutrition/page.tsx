"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useDataStore } from "@/stores/data-store";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";
import {
  Apple,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Beef,
  Wheat,
  Droplets,
  X,
  Edit,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  type: "breakfast" | "lunch" | "dinner" | "snacks";
  items: FoodItem[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const dailyMeals: Meal[] = [
  {
    type: "breakfast",
    items: [
      { name: "Oatmeal with banana", calories: 350, protein: 12, carbs: 58, fat: 8 },
      { name: "Scrambled eggs (3)", calories: 280, protein: 21, carbs: 2, fat: 20 },
      { name: "Orange juice", calories: 110, protein: 2, carbs: 26, fat: 0 },
    ],
  },
  {
    type: "lunch",
    items: [
      { name: "Grilled chicken breast", calories: 320, protein: 48, carbs: 0, fat: 14 },
      { name: "Brown rice (150g)", calories: 180, protein: 4, carbs: 38, fat: 2 },
      { name: "Mixed salad with olive oil", calories: 120, protein: 3, carbs: 8, fat: 9 },
    ],
  },
  {
    type: "dinner",
    items: [
      { name: "Salmon fillet (200g)", calories: 400, protein: 44, carbs: 0, fat: 24 },
      { name: "Sweet potato (200g)", calories: 180, protein: 4, carbs: 42, fat: 0 },
      { name: "Steamed broccoli", calories: 55, protein: 4, carbs: 10, fat: 1 },
    ],
  },
  {
    type: "snacks",
    items: [
      { name: "Whey protein shake", calories: 120, protein: 24, carbs: 3, fat: 1 },
      { name: "Almonds (30g)", calories: 170, protein: 6, carbs: 6, fat: 15 },
      { name: "Greek yogurt", calories: 100, protein: 15, carbs: 6, fat: 2 },
    ],
  },
];

const macroTargets = {
  calories: { current: 2385, target: 2400, unit: "kcal" },
  protein: { current: 187, target: 180, unit: "g" },
  carbs: { current: 199, target: 250, unit: "g" },
  fat: { current: 96, target: 80, unit: "g" },
};

const weeklyCalories = [
  { day: "Mon", actual: 2320, target: 2400 },
  { day: "Tue", actual: 2450, target: 2400 },
  { day: "Wed", actual: 2180, target: 2400 },
  { day: "Thu", actual: 2390, target: 2400 },
  { day: "Fri", actual: 2510, target: 2400 },
  { day: "Sat", actual: 2100, target: 2400 },
  { day: "Sun", actual: 2385, target: 2400 },
];

const mealPlan = {
  name: "Fat Loss 2400kcal",
  dailyMacros: { calories: 2400, protein: 180, carbs: 250, fat: 80 },
};

const mealTypeConfig: Record<string, { label: string; icon: typeof Apple; color: string }> = {
  breakfast: { label: "Breakfast", icon: Apple, color: "text-vytal-amber" },
  lunch: { label: "Lunch", icon: Beef, color: "text-vytal-green" },
  dinner: { label: "Dinner", icon: Flame, color: "text-vytal-red" },
  snacks: { label: "Snacks", icon: Apple, color: "text-vytal-blue" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NutritionPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams();
  const memberId = params.id as string;
  const members = useDataStore((s) => s.members);
  const member = members.find((m) => m.id === memberId);

  const [selectedDate, setSelectedDate] = useState("2026-06-04");
  const [meals, setMeals] = useState<Meal[]>(dailyMeals);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [addMealType, setAddMealType] = useState<string>("breakfast");
  const [addFoodName, setAddFoodName] = useState("");
  const [addCalories, setAddCalories] = useState("");
  const [addProtein, setAddProtein] = useState("");
  const [addCarbs, setAddCarbs] = useState("");
  const [addFat, setAddFat] = useState("");

  // Totals
  const totals = meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAddFood = useCallback(() => {
    if (!addFoodName.trim()) return;
    const newItem: FoodItem = {
      name: addFoodName.trim(),
      calories: parseInt(addCalories) || 0,
      protein: parseInt(addProtein) || 0,
      carbs: parseInt(addCarbs) || 0,
      fat: parseInt(addFat) || 0,
    };
    setMeals((prev) =>
      prev.map((meal) =>
        meal.type === addMealType
          ? { ...meal, items: [...meal.items, newItem] }
          : meal
      )
    );
    setAddFoodName("");
    setAddCalories("");
    setAddProtein("");
    setAddCarbs("");
    setAddFat("");
    setShowAddMeal(false);
    toast(t("nutrition.foodAdded"), "success");
  }, [addFoodName, addCalories, addProtein, addCarbs, addFat, addMealType, toast, t]);

  const navigateDate = useCallback(
    (dir: number) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + dir);
      setSelectedDate(d.toISOString().split("T")[0]);
    },
    [selectedDate]
  );

  if (!member) return notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t("nav.members"), href: "/members" },
          { label: member.name, href: `/members/${memberId}` },
          { label: t("nutrition.title") },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-vytal-text">{t("nutrition.title")}</h1>
        <button
          onClick={() => setShowAddMeal(true)}
          className="flex items-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          <Plus className="h-4 w-4" />
          {t("nutrition.addMeal")}
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateDate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-2">
          <Calendar className="h-4 w-4 text-vytal-muted" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm text-vytal-text focus:outline-none"
          />
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-vytal-border bg-vytal-bg2 text-vytal-muted hover:text-vytal-text"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Macros Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            key: "calories",
            label: t("nutrition.calories"),
            current: totals.calories,
            target: macroTargets.calories.target,
            unit: "kcal",
            icon: Flame,
            color: "text-vytal-amber",
            bg: "bg-vytal-amber/10",
          },
          {
            key: "protein",
            label: t("nutrition.protein"),
            current: totals.protein,
            target: macroTargets.protein.target,
            unit: "g",
            icon: Beef,
            color: "text-vytal-red",
            bg: "bg-vytal-red/10",
          },
          {
            key: "carbs",
            label: t("nutrition.carbs"),
            current: totals.carbs,
            target: macroTargets.carbs.target,
            unit: "g",
            icon: Wheat,
            color: "text-vytal-green",
            bg: "bg-vytal-green/10",
          },
          {
            key: "fat",
            label: t("nutrition.fat"),
            current: totals.fat,
            target: macroTargets.fat.target,
            unit: "g",
            icon: Droplets,
            color: "text-vytal-blue",
            bg: "bg-vytal-blue/10",
          },
        ].map((macro) => {
          const MacroIcon = macro.icon;
          const pct = Math.min((macro.current / macro.target) * 100, 100);
          return (
            <div
              key={macro.key}
              className="rounded-xl border border-vytal-border bg-vytal-bg2 p-4"
            >
              <div className="flex items-center gap-2">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", macro.bg)}>
                  <MacroIcon className={cn("h-4 w-4", macro.color)} />
                </div>
                <span className="text-xs font-medium text-vytal-muted">{macro.label}</span>
              </div>
              <p className="mt-2 text-xl font-bold text-vytal-text">
                {macro.current}
                <span className="text-sm font-normal text-vytal-muted">
                  /{macro.target}{macro.unit}
                </span>
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-vytal-bg3">
                <div
                  className={cn("h-1.5 rounded-full transition-all", macro.bg.replace("/10", ""))}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Meal Form */}
      {showAddMeal && (
        <div className="rounded-xl border border-vytal-green/30 bg-vytal-bg2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vytal-text">{t("nutrition.addMeal")}</h3>
            <button onClick={() => setShowAddMeal(false)} className="text-vytal-muted hover:text-vytal-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <select
              value={addMealType}
              onChange={(e) => setAddMealType(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2.5 text-sm text-vytal-text focus:border-vytal-green/30 focus:outline-none"
            >
              <option value="breakfast">{t("nutrition.breakfast")}</option>
              <option value="lunch">{t("nutrition.lunch")}</option>
              <option value="dinner">{t("nutrition.dinner")}</option>
              <option value="snacks">{t("nutrition.snacks")}</option>
            </select>
            <input
              type="text"
              placeholder={t("nutrition.foodItem")}
              value={addFoodName}
              onChange={(e) => setAddFoodName(e.target.value)}
              className="col-span-2 rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <input
              type="number"
              placeholder={t("nutrition.calories")}
              value={addCalories}
              onChange={(e) => setAddCalories(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <input
              type="number"
              placeholder={t("nutrition.protein") + " (g)"}
              value={addProtein}
              onChange={(e) => setAddProtein(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <input
              type="number"
              placeholder={t("nutrition.carbs") + " (g)"}
              value={addCarbs}
              onChange={(e) => setAddCarbs(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <input
              type="number"
              placeholder={t("nutrition.fat") + " (g)"}
              value={addFat}
              onChange={(e) => setAddFat(e.target.value)}
              className="rounded-lg border border-vytal-border bg-vytal-bg3 px-4 py-2.5 text-sm text-vytal-text placeholder:text-vytal-muted focus:border-vytal-green/30 focus:outline-none"
            />
            <button
              onClick={handleAddFood}
              disabled={!addFoodName.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-2.5 text-sm font-medium text-vytal-bg transition-colors hover:bg-vytal-green/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {t("nutrition.addFood")}
            </button>
          </div>
        </div>
      )}

      {/* Meal Cards */}
      <div className="grid grid-cols-2 gap-5">
        {meals.map((meal) => {
          const config = mealTypeConfig[meal.type];
          const MealIcon = config.icon;
          const mealTotal = meal.items.reduce(
            (acc, item) => ({
              calories: acc.calories + item.calories,
              protein: acc.protein + item.protein,
              carbs: acc.carbs + item.carbs,
              fat: acc.fat + item.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );

          return (
            <div key={meal.type} className="rounded-xl border border-vytal-border bg-vytal-bg2">
              <div className="flex items-center justify-between border-b border-vytal-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <MealIcon className={cn("h-4 w-4", config.color)} />
                  <span className="text-sm font-semibold text-vytal-text">{config.label}</span>
                </div>
                <span className="text-xs text-vytal-muted">{mealTotal.calories} kcal</span>
              </div>
              <div className="divide-y divide-vytal-border/50">
                {meal.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-vytal-text">{item.name}</span>
                    <div className="flex items-center gap-3 text-[10px] text-vytal-muted">
                      <span>{item.calories} kcal</span>
                      <span>P: {item.protein}g</span>
                      <span>C: {item.carbs}g</span>
                      <span>F: {item.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-vytal-border px-4 py-2">
                <div className="flex justify-end gap-3 text-[10px] font-semibold text-vytal-muted">
                  <span>P: {mealTotal.protein}g</span>
                  <span>C: {mealTotal.carbs}g</span>
                  <span>F: {mealTotal.fat}g</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Chart */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
        <h3 className="mb-4 text-sm font-semibold text-vytal-text">{t("nutrition.weeklyCalories")}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-vytal-border)" />
              <XAxis dataKey="day" tick={{ fill: "var(--color-vytal-muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--color-vytal-muted)", fontSize: 12 }} domain={[1800, 2800]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-vytal-bg2)",
                  border: "1px solid var(--color-vytal-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--color-vytal-green)"
                strokeWidth={2}
                dot={{ fill: "var(--color-vytal-green)", r: 4 }}
                name={t("nutrition.actual")}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="var(--color-vytal-muted)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name={t("nutrition.target")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meal Plan */}
      <div className="rounded-xl border border-vytal-border bg-vytal-bg2 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-vytal-text">{t("nutrition.mealPlan")}</h3>
            <p className="mt-1 text-xs text-vytal-muted">{mealPlan.name}</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-vytal-border bg-vytal-bg3 px-3 py-2 text-xs text-vytal-text transition-colors hover:border-vytal-green/30">
            <Edit className="h-3.5 w-3.5" />
            {t("nutrition.editPlan")}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-vytal-bg3 px-3 py-2 text-center">
            <p className="text-[10px] text-vytal-muted">{t("nutrition.calories")}</p>
            <p className="text-sm font-bold text-vytal-text">{mealPlan.dailyMacros.calories} kcal</p>
          </div>
          <div className="rounded-lg bg-vytal-bg3 px-3 py-2 text-center">
            <p className="text-[10px] text-vytal-muted">{t("nutrition.protein")}</p>
            <p className="text-sm font-bold text-vytal-text">{mealPlan.dailyMacros.protein}g</p>
          </div>
          <div className="rounded-lg bg-vytal-bg3 px-3 py-2 text-center">
            <p className="text-[10px] text-vytal-muted">{t("nutrition.carbs")}</p>
            <p className="text-sm font-bold text-vytal-text">{mealPlan.dailyMacros.carbs}g</p>
          </div>
          <div className="rounded-lg bg-vytal-bg3 px-3 py-2 text-center">
            <p className="text-[10px] text-vytal-muted">{t("nutrition.fat")}</p>
            <p className="text-sm font-bold text-vytal-text">{mealPlan.dailyMacros.fat}g</p>
          </div>
        </div>
      </div>
    </div>
  );
}
