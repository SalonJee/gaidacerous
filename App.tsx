import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { CareReminderModal } from "./src/components/CareReminderModal";
import { CatYearsClock } from "./src/components/CatYearsClock";
import { PetActions } from "./src/components/PetActions";
import { PetAvatar2D } from "./src/components/PetAvatar2D";
import { PetAgeInput } from "./src/components/PetAgeInput";
import { PetPicker } from "./src/components/PetPicker";
import { IntroScreen } from "./src/components/IntroScreen";
import { PetStatsPanel } from "./src/components/PetStatsPanel";
import { Sidebar } from "./src/components/Sidebar";
import { useCareReminders } from "./src/hooks/useCareReminders";
import {
  applyAction,
  decayPerTick,
  getMood,
  initialPetState,
} from "./src/simulation/petEngine";
import {
  analyzePetImageWithGemini,
  mapTraitsToAppearance,
} from "./src/services/geminiPetAnalyzer";
import type {
  AnalyzerResult,
  CareReminderType,
  PetAppearance,
  PetType,
} from "./src/types/pet";

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const TINDER = {
  gradientStart: "#FD297B",
  gradientMid: "#FF655B",
  gradientEnd: "#FF9A45",
  bg: "#0D0D0D",
  card: "#1A1A1A",
  cardBorder: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#505050",
  success: "#00E0A1",
  warning: "#FF9A45",
  danger: "#FF3B5C",
  radiusCard: 20,
  radiusPill: 50,
  radiusBtn: 14,
} as const;

// ─── Constants ──────────────────────────────────────────────────────────────
const TICK_SECONDS = 1;

const petNameMap: Record<PetType, string> = {
  dog: "Dog Twin",
  cat: "Cat Twin",
};

const moodEmoji: Record<string, string> = {
  Happy: "😊",
  Playful: "🎉",
  Hungry: "🍖",
  Thirsty: "💧",
  Tired: "😴",
  Sad: "😢",
};

type AppScreen = "splash" | "picker" | "ageInput" | "main";

// ─── App Component ─────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<AppScreen>("splash");
  const [petType, setPetType] = useState<PetType | null>(null);
  const [initialPetAgeYears, setInitialPetAgeYears] = useState<number>(0);
  const [sessionStartMs, setSessionStartMs] = useState<number>(() => Date.now());

  const [petState, setPetState] = useState(initialPetState);
  const [actionPulse, setActionPulse] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { activeReminder, dismissReminder, confirmReminder, resetAllReminders, recordAction } =
    useCareReminders({ petType, petState, demoMode });

  // Game tick — only runs on main screen
  useEffect(() => {
    if (screen !== "main") return;
    const timer = setInterval(
      () => setPetState((prev) => decayPerTick(prev)),
      TICK_SECONDS * 1000
    );
    return () => clearInterval(timer);
  }, [screen]);

  // Warning auto-dismiss
  useEffect(() => {
    if (!warning) return;
    const timer = setTimeout(() => setWarning(null), 3500);
    return () => clearTimeout(timer);
  }, [warning]);

  const mood = useMemo(() => getMood(petState), [petState]);

  const appearance: PetAppearance = useMemo(() => {
    if (!petType) {
      return {
        baseColor: "#d4a373",
        accentColor: "#b08968",
        earStyle: "floppy",
        snoutScale: 1,
        eyeScale: 1,
      };
    }
    return mapTraitsToAppearance(petType, analyzerResult);
  }, [analyzerResult, petType]);

  // ─── Navigation Handlers ──────────────────────────────────────────────────
  const handleContinueFromIntro = useCallback(() => {
    setScreen("picker");
  }, []);

  const handleChoosePet = useCallback((type: PetType) => {
    setPetType(type);
    setScreen("ageInput");
  }, []);

  const handleConfirmAge = useCallback((ageYears: number) => {
    setInitialPetAgeYears(ageYears);
    setSessionStartMs(Date.now());
    setPetState(initialPetState);
    setAnalyzerResult(null);
    setActionPulse(0);
    setWarning(null);
    resetAllReminders();
    setScreen("main");
  }, [resetAllReminders]);

  const handleChangePet = useCallback(() => {
    setPetType(null);
    setScreen("splash");
  }, []);

  const handleTapPet = useCallback(() => {
    setActionPulse((prev) => prev + 1);
    setWarning("Your pet noticed you. Tap interactions improve bonding.");
  }, []);

  const handleAction = useCallback((action: "feed" | "water" | "play" | "giveFood") => {
    const { nextState, warning: actionWarning } = applyAction(petState, action);
    setPetState(nextState);
    setActionPulse((prev) => prev + 1);

    if (action === "feed" || action === "giveFood") recordAction("feed");
    if (action === "water") recordAction("water");
    if (action === "play") {
      recordAction("play");
      recordAction("walk");
    }

    if (actionWarning) {
      setWarning(actionWarning);
      Alert.alert("Careful", actionWarning);
    }
  }, [petState, recordAction]);

  const handleConfirmReminder = useCallback((type: CareReminderType) => {
    if (type === "walk" || type === "play") handleAction("play");
    else if (type === "feed") handleAction("feed");
    else if (type === "water") handleAction("water");
    confirmReminder(type);
  }, [handleAction, confirmReminder]);

  const handleAnalyzePetImage = useCallback(async () => {
    if (!petType) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow photo access to analyze your pet.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
        base64: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      if (!asset?.base64) return;
      setIsAnalyzing(true);
      const analysis = await analyzePetImageWithGemini(
        asset.base64,
        asset.mimeType || "image/jpeg"
      );
      setAnalyzerResult(analysis);
      setWarning("Pet style updated from image traits.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown analysis error";
      Alert.alert("Analysis failed", message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [petType]);

  // ─── Screen Renders ──────────────────────────────────────────────────────
  if (screen === "splash") {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <IntroScreen onContinue={handleContinueFromIntro} />
      </View>
    );
  }

  if (screen === "picker") {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <PetPicker onChoosePet={handleChoosePet} isTransitioning={false} />
      </View>
    );
  }

  if (screen === "ageInput") {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        {petType && <PetAgeInput petType={petType} onConfirm={handleConfirmAge} />}
      </View>
    );
  }

  // ─── Main Screen ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => setSidebarOpen(true)}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Text style={styles.iconBtnText}>☰</Text>
          </Pressable>

          <View style={styles.titleWrapper}>
            <View style={styles.titleGradientBar} />
            <Text style={styles.title}>{petNameMap[petType!]}</Text>
          </View>

          <View style={styles.moodPill}>
            <Text style={styles.moodPillText}>
              {moodEmoji[mood] ?? "✨"} {mood}
            </Text>
          </View>
        </View>

        {!!warning && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️  {warning}</Text>
          </View>
        )}
      </View>

      {/* Scrollable body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <CatYearsClock
            petType={petType!}
            initialAgeYears={initialPetAgeYears}
            sessionStartMs={sessionStartMs}
          />
        </View>

        <View style={[styles.card, styles.avatarCard]}>
          <View style={styles.avatarGlow} />
          <PetAvatar2D
            petType={petType!}
            mood={mood}
            actionPulse={actionPulse}
            appearance={appearance}
            onTapPet={handleTapPet}
          />
        </View>

        <View style={styles.card}>
          <PetStatsPanel petState={petState} />
        </View>

        <View style={styles.card}>
          <PetActions onAction={handleAction} />
        </View>

        <View style={styles.bottomButtons}>
          <Pressable
            onPress={handleAnalyzePetImage}
            disabled={isAnalyzing}
            style={[styles.gradientBtn, isAnalyzing && styles.gradientBtnDisabled]}
          >
            <Text style={styles.gradientBtnText}>
              {isAnalyzing ? "Analysing…  ✨" : "📷  Upload Real Pet Photo"}
            </Text>
          </Pressable>

          <Pressable onPress={handleChangePet} style={styles.ghostBtn}>
            <Text style={styles.ghostBtnText}>Change Pet</Text>
          </Pressable>
        </View>
      </ScrollView>

      <CareReminderModal
        reminder={activeReminder}
        onConfirm={handleConfirmReminder}
        onLater={dismissReminder}
      />

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        demoMode={demoMode}
        onToggleDemoMode={setDemoMode}
      />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Root wrapper for non-main screens — fills the whole display
  root: {
    flex: 1,
    backgroundColor: TINDER.bg,
  },

  // Main screen uses SafeAreaView directly
  container: {
    flex: 1,
    backgroundColor: TINDER.bg,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: TINDER.cardBorder,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: TINDER.card,
    borderWidth: 1,
    borderColor: TINDER.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    fontSize: 18,
    color: TINDER.textPrimary,
  },

  titleWrapper: {
    alignItems: "center",
  },
  titleGradientBar: {
    position: "absolute",
    bottom: -3,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: TINDER.gradientStart,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: TINDER.textPrimary,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif-black",
    textTransform: "uppercase",
  },

  moodPill: {
    borderRadius: TINDER.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: TINDER.gradientStart,
  },
  moodPillText: {
    color: TINDER.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  warningBanner: {
    marginTop: 10,
    backgroundColor: "#2A1010",
    borderColor: `${TINDER.danger}55`,
    borderWidth: 1,
    borderRadius: TINDER.radiusBtn,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  warningText: {
    color: "#FF8A8A",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },

  card: {
    backgroundColor: TINDER.card,
    borderRadius: TINDER.radiusCard,
    borderWidth: 1,
    borderColor: TINDER.cardBorder,
    overflow: "hidden",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarCard: {
    alignItems: "center",
    paddingVertical: 24,
    minHeight: 260,
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    top: -60,
    left: "10%",
    right: "10%",
    height: 200,
    borderRadius: 100,
    backgroundColor: `${TINDER.gradientStart}22`,
  },

  bottomButtons: {
    marginTop: 4,
    gap: 10,
  },
  gradientBtn: {
    borderRadius: TINDER.radiusBtn,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TINDER.gradientStart,
    shadowColor: TINDER.gradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  gradientBtnDisabled: {
    backgroundColor: "#444",
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientBtnText: {
    color: TINDER.textPrimary,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Bold" : "sans-serif-medium",
  },

  ghostBtn: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: TINDER.radiusPill,
    borderWidth: 1,
    borderColor: TINDER.cardBorder,
  },
  ghostBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: TINDER.textSecondary,
    letterSpacing: 0.5,
  },
});