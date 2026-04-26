/**
 * PetAvatar2D — Lottie edition
 *
 * Replaces the hand-drawn SVG avatar with a Lottie animation.
 * Drop your downloaded JSON files into assets/animations/ and you're done.
 *
 * Mood → animation behaviour mapping:
 *   Happy / Playful  → plays fast
 *   Okay             → normal speed
 *   Weak / Sleepy    → plays slow
 *   Sick             → paused on first frame + sweat drop overlay
 *
 * The outer Animated.View still provides the gentle bob (native driver).
 */

import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Mood, PetAppearance, PetType } from "../types/pet";

// ─── Asset map ────────────────────────────────────────────────────────────────
// Add your downloaded Lottie JSONs here.
// If a file is missing the component falls back gracefully to a large emoji.
const LOTTIE_ASSETS: Record<PetType, any> = {
  cat: require("../../assets/animations/cat.json"),
  dog: require("../../assets/animations/dog.json"),
};

// ─── Mood → playback config ───────────────────────────────────────────────────
interface PlaybackCfg {
  speed:   number;   // Lottie playback speed multiplier
  paused:  boolean;  // freeze on first frame (sick state)
  bobAmp:  number;   // px for the translateY bob
  bobMs:   number;   // ms per half-bob cycle
}

const MOOD_PLAYBACK: Record<Mood, PlaybackCfg> = {
  Happy:  { speed: 1.4,  paused: false, bobAmp: 8,  bobMs: 900  },
  Okay:   { speed: 1.0,  paused: false, bobAmp: 5,  bobMs: 1400 },
  Weak:   { speed: 0.55, paused: false, bobAmp: 3,  bobMs: 2000 },
  Sleepy: { speed: 0.35, paused: false, bobAmp: 2,  bobMs: 2800 },
  Sick:   { speed: 0.2,  paused: true,  bobAmp: 1,  bobMs: 3200 },
};

// Emoji fallback — shown while Lottie file loads or if require() fails
const PET_EMOJI: Record<PetType, string> = {
  cat: "🐱",
  dog: "🐶",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  petType:     PetType;
  mood:        Mood;
  actionPulse: number;        // increments on every care action → triggers sparkle
  appearance:  PetAppearance; // kept for API compatibility, unused with Lottie
  onTapPet?:   () => void;
}

const AVATAR_HEIGHT = 240;

// ─── Component ────────────────────────────────────────────────────────────────
export const PetAvatar2D = ({ petType, mood, actionPulse, onTapPet }: Props) => {
  const cfg = MOOD_PLAYBACK[mood];

  const bobAnim    = useRef(new Animated.Value(0)).current;
  const bobLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const sparkleAnim  = useRef(new Animated.Value(0)).current;
  const prevPulseRef = useRef(actionPulse);

  const lottieRef = useRef<LottieView>(null);

  // ── Bob loop ──
  useEffect(() => {
    bobLoopRef.current?.stop();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -cfg.bobAmp,
          duration: cfg.bobMs,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: cfg.bobMs,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    bobLoopRef.current = loop;
    loop.start();
    return () => loop.stop();
  }, [mood]);

  // ── Sparkle burst on care actions ──
  useEffect(() => {
    if (actionPulse === prevPulseRef.current) return;
    prevPulseRef.current = actionPulse;
    sparkleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(sparkleAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start();
  }, [actionPulse]);

  const handleTap = useCallback(() => {
    lottieRef.current?.play();
    onTapPet?.();
  }, [onTapPet]);

  const sparkleScale = sparkleAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0.6, 1.35],
  });

  let lottieSource: any = null;
  try {
    lottieSource = LOTTIE_ASSETS[petType];
  } catch {
    // require() failed — will render emoji fallback
  }

  return (
    <Pressable onPress={handleTap} style={styles.wrap}>

      {/* Sparkle ring — expands on care action */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.sparkleRing,
          {
            opacity:   sparkleAnim,
            transform: [{ scale: sparkleScale }],
          },
        ]}
      />

      {/* Bob wrapper */}
      <Animated.View style={[styles.inner, { transform: [{ translateY: bobAnim }] }]}>

        {lottieSource ? (
          <LottieView
            ref={lottieRef}
            source={lottieSource}
            autoPlay={!cfg.paused}
            loop
            speed={cfg.speed}
            style={styles.lottie}
            backgroundColor="transparent"
            renderMode={Platform.OS === "android" ? "HARDWARE" : "AUTOMATIC"}
          />
        ) : (
          <View style={styles.emojiFallback}>
            <Text style={styles.emojiText}>{PET_EMOJI[petType]}</Text>
            <Text style={styles.fallbackHint}>
              Add {petType}.json to{"\n"}assets/animations/
            </Text>
          </View>
        )}

        {/* Sick overlay */}
        {mood === "Sick" && (
          <View style={styles.sickOverlay} pointerEvents="none">
            <Text style={styles.sickEmoji}>💦</Text>
          </View>
        )}

        {/* Sleepy ZZZ */}
        {mood === "Sleepy" && (
          <View style={styles.zzzOverlay} pointerEvents="none">
            <Text style={styles.zzzText}>z z z</Text>
          </View>
        )}

      </Animated.View>
    </Pressable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrap: {
    width:          "100%",
    height:         AVATAR_HEIGHT,
    alignItems:     "center",
    justifyContent: "center",
  },

  inner: {
    width:          "75%",
    height:         AVATAR_HEIGHT,
    alignItems:     "center",
    justifyContent: "center",
  },

  lottie: {
    width:  "100%",
    height: "100%",
  },

  sparkleRing: {
    position:     "absolute",
    width:        180,
    height:       180,
    borderRadius: 90,
    borderWidth:  2.5,
    borderColor:  "#FD297B",
  },

  emojiFallback: {
    alignItems: "center",
    gap:        8,
  },
  emojiText: {
    fontSize:   96,
    lineHeight: 110,
  },
  fallbackHint: {
    fontSize:  11,
    color:     "#606060",
    textAlign: "center",
    lineHeight: 16,
  },

  sickOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     "flex-end",
    justifyContent: "flex-start",
    paddingTop:     8,
    paddingRight:   8,
  },
  sickEmoji: {
    fontSize: 28,
  },

  zzzOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     "flex-end",
    justifyContent: "flex-start",
    paddingTop:     4,
  },
  zzzText: {
    fontSize:      16,
    color:         "#A0A0A0",
    fontStyle:     "italic",
    letterSpacing: 3,
  },
});