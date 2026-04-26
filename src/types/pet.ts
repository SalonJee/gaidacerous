export type PetType = "dog" | "cat";
export type Mood = "Sick" | "Weak" | "Happy" | "Sleepy" | "Okay";
export type PetAction = "feed" | "water" | "play" | "giveFood";

export type PetState = {
  health: number;
  hunger: number;
  thirst: number;
  happiness: number;
  energy: number;
  foodSafetyRisk: number;
};

export type PetAppearance = {
  baseColor: string;
  accentColor: string;
  earStyle: "pointed" | "floppy";
  snoutScale: number;
  eyeScale: number;
};

export type AnalyzerResult = {
  species: PetType | null;
  fur: {
    primaryColor: string | null;
    secondaryColor: string | null;
    pattern: string | null;
  };
  face: {
    earShape: string | null;
    snoutLength: string | null;
    eyeColor: string | null;
  };
  confidence: number;
};

export type CareReminderType = "feed" | "water" | "play" | "walk";

export type CareReminder = {
  id: string;
  type: CareReminderType;
  title: string;
  message: string;
  confirmLabel: string;
};
