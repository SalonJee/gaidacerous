import type { Mood, PetAction, PetState } from "../types/pet";

const MAX_STAT = 100;
const MIN_STAT = 0;

const clamp = (value: number) => Math.max(MIN_STAT, Math.min(MAX_STAT, value));

export const initialPetState: PetState = {
  health: 80,
  hunger: 65,
  thirst: 65,
  happiness: 65,
  energy: 70,
  foodSafetyRisk: 5
};

export const decayPerTick = (state: PetState): PetState => {
  const hunger = clamp(state.hunger - 1.4);
  const thirst = clamp(state.thirst - 1.8);
  const happiness = clamp(state.happiness - 0.9);
  const energy = clamp(state.energy - 0.8);
  const foodSafetyRisk = clamp(state.foodSafetyRisk - 0.25);

  let healthPenalty = 0;
  if (hunger < 30) healthPenalty += 1.0;
  if (thirst < 30) healthPenalty += 1.2;
  if (happiness < 30) healthPenalty += 0.6;
  if (foodSafetyRisk > 70) healthPenalty += 1.7;

  const healthRecovery =
    hunger > 70 && thirst > 70 && happiness > 60 && foodSafetyRisk < 30 ? 0.7 : 0;

  return {
    health: clamp(state.health - healthPenalty + healthRecovery),
    hunger,
    thirst,
    happiness,
    energy,
    foodSafetyRisk
  };
};

export const applyAction = (
  state: PetState,
  action: PetAction
): { nextState: PetState; warning: string | null } => {
  let warning: string | null = null;
  const isAlreadyFull = state.hunger > 88;

  switch (action) {
    case "feed": {
      const nextState = {
        ...state,
        hunger: clamp(state.hunger + 18),
        happiness: clamp(state.happiness + 4),
        foodSafetyRisk: clamp(state.foodSafetyRisk + 2)
      };
      if (isAlreadyFull) {
        warning = "Overfeeding can be harmful. Try play or water instead.";
        nextState.health = clamp(nextState.health - 4);
        nextState.foodSafetyRisk = clamp(nextState.foodSafetyRisk + 8);
      }
      return { nextState, warning };
    }
    case "water":
      return {
        warning: null,
        nextState: {
          ...state,
          thirst: clamp(state.thirst + 22),
          happiness: clamp(state.happiness + 3),
          foodSafetyRisk: clamp(state.foodSafetyRisk - 3)
        }
      };
    case "play":
      return {
        warning: null,
        nextState: {
          ...state,
          happiness: clamp(state.happiness + 20),
          energy: clamp(state.energy - 8),
          thirst: clamp(state.thirst - 4)
        }
      };
    case "giveFood": {
      const nextState = {
        ...state,
        hunger: clamp(state.hunger + 11),
        happiness: clamp(state.happiness + 14),
        foodSafetyRisk: clamp(state.foodSafetyRisk + 10)
      };
      if (state.hunger > 84 || state.foodSafetyRisk > 65) {
        warning = "Too much snack food increases food-safety risk.";
        nextState.health = clamp(nextState.health - 5);
      }
      return { nextState, warning };
    }
    default:
      return { nextState: state, warning: null };
  }
};

export const getMood = (state: PetState): Mood => {
  if (state.health < 25 || state.foodSafetyRisk > 75) return "Sick";
  if (state.hunger < 25 || state.thirst < 25) return "Weak";
  if (state.happiness > 75 && state.energy > 35) return "Happy";
  if (state.energy < 20) return "Sleepy";
  return "Okay";
};
