import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { PetType } from "../types/pet";

const PET_LIFESPAN: Record<PetType, number> = { cat: 15, dog: 13 };
const HUMAN_LIFESPAN = 79;

const THEME = {
  bg:          "#0D0D0D",
  card:        "#161616",
  border:      "#2A2A2A",
  borderFocus: "#FD297B",
  text:        "#F0F0F0",
  textMuted:   "#888888",
  textHint:    "#444444",
  accent:      "#FD297B",
  accentSoft:  "#200A12",
  accentText:  "#FF6B9D",
  success:     "#00E0A1",
  successSoft: "#04150F",
  error:       "#FF3B5C",
  errorSoft:   "#1A0608",
} as const;

interface Props {
  petType: PetType;
  onConfirm: (ageYears: number) => void;
}

export function PetAgeInput({ petType, onConfirm }: Props) {
  const [years,  setYears]  = useState("");
  const [months, setMonths] = useState("");
  const [error,  setError]  = useState<string | null>(null);
  const [focusY, setFocusY] = useState(false);
  const [focusM, setFocusM] = useState(false);

  const lifespan   = PET_LIFESPAN[petType];
  const multiplier = (HUMAN_LIFESPAN / lifespan).toFixed(1);
  const petLabel   = petType === "cat" ? "Cat" : "Dog";
  const petEmoji   = petType === "cat" ? "🐱" : "🐶";

  const handleConfirm = () => {
    const y = parseInt(years  || "0", 10);
    const m = parseInt(months || "0", 10);
    if (isNaN(y) || isNaN(m) || y < 0 || m < 0 || m > 11) {
      setError("Months must be between 0 and 11.");
      return;
    }
    if (y > 30) {
      setError("That's older than the oldest pet ever recorded!");
      return;
    }
    setError(null);
    onConfirm(y + m / 12);
  };

  // Live human-age equivalent preview
  const yNum = parseInt(years  || "0", 10) || 0;
  const mNum = parseInt(months || "0", 10) || 0;
  const humanEq    = ((yNum + mNum / 12) * (HUMAN_LIFESPAN / lifespan)).toFixed(1);
  const showPreview = (yNum > 0 || mNum > 0) && !error;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top accent bar */}
      <View style={styles.topBar} />

      <View style={styles.card}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.emoji}>{petEmoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>How old is your {petLabel}?</Text>
            <Text style={styles.subtitle}>
              Their clock runs{" "}
              <Text style={styles.accentText}>{multiplier}× faster</Text>
              {" "}than ours
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Section label */}
        <Text style={styles.sectionLabel}>ENTER YOUR PET'S AGE</Text>

        {/* Inputs row */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.unitLabel}>YEARS</Text>
            <TextInput
              style={[styles.input, focusY && styles.inputFocused]}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={THEME.textHint}
              maxLength={2}
              value={years}
              onChangeText={(v) => { setYears(v); setError(null); }}
              onFocus={() => setFocusY(true)}
              onBlur={() =>  setFocusY(false)}
              selectionColor={THEME.accent}
            />
          </View>

          <Text style={styles.andText}>and</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.unitLabel}>MONTHS</Text>
            <TextInput
              style={[styles.input, focusM && styles.inputFocused]}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={THEME.textHint}
              maxLength={2}
              value={months}
              onChangeText={(v) => { setMonths(v); setError(null); }}
              onFocus={() => setFocusM(true)}
              onBlur={() =>  setFocusM(false)}
              selectionColor={THEME.accent}
            />
          </View>
        </View>

        {/* Human-age preview */}
        {showPreview && (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Human age equivalent</Text>
            <Text style={styles.previewValue}>≈ {humanEq} yrs</Text>
          </View>
        )}

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleConfirm}
        >
          <Text style={styles.buttonText}>Start Tracking</Text>
        </Pressable>

        <Text style={styles.finePrint}>
          Based on avg. lifespan of {lifespan} yrs for a {petLabel.toLowerCase()}.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: THEME.accent,
    opacity: 0.8,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  emoji: {
    fontSize: 44,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textMuted,
    lineHeight: 18,
  },
  accentText: {
    color: THEME.accentText,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  unitLabel: {
    fontSize: 10,
    color: THEME.textHint,
    letterSpacing: 1.5,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: THEME.text,
    backgroundColor: "#1A1A1A",
  },
  inputFocused: {
    borderColor: THEME.borderFocus,
    borderWidth: 1.5,
    backgroundColor: THEME.accentSoft,
  },
  andText: {
    fontSize: 13,
    color: THEME.textHint,
    fontWeight: "500",
    paddingBottom: 14,
  },
  previewBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.successSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0A2E1F",
  },
  previewLabel: {
    fontSize: 12,
    color: THEME.success,
    fontWeight: "500",
  },
  previewValue: {
    fontSize: 15,
    color: THEME.success,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: THEME.errorSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3A0A10",
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    backgroundColor: THEME.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.4,
  },
  finePrint: {
    fontSize: 11,
    color: THEME.textHint,
    textAlign: "center",
    lineHeight: 16,
  },
});