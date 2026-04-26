import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PetType } from "../types/pet";

const T = {
  gradientStart: "#FD297B",
  gradientMid:   "#FF655B",
  gradientEnd:   "#FF9A45",
  bg:            "#0D0D0D",
  card:          "#1A1A1A",
  cardBorder:    "#2A2A2A",
  cardActive:    "#231018",
  textPrimary:   "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted:     "#505050",
  radiusCard:    24,
  radiusBtn:     14,
} as const;

const PET_META = {
  dog: {
    emoji: "🐶",
    label: "Dog",
    subtitle: "Loyal & playful",
    traits: ["Walks", "Fetch", "Cuddles"],
    accentColor: T.gradientMid,
  },
  cat: {
    emoji: "🐱",
    label: "Cat",
    subtitle: "Independent & curious",
    traits: ["Naps", "Purring", "Zoomies"],
    accentColor: T.gradientStart,
  },
} as const;

export function PetPicker({ onChoosePet }: { onChoosePet: (pet: PetType) => void }) {
  const titleOp  = useRef(new Animated.Value(0)).current;
  const titleY   = useRef(new Animated.Value(-16)).current;
  const cardLeftX  = useRef(new Animated.Value(-60)).current;
  const cardLeftOp = useRef(new Animated.Value(0)).current;
  const cardRightX  = useRef(new Animated.Value(60)).current;
  const cardRightOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title drops in
    Animated.parallel([
      Animated.timing(titleOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Cards slide in from sides
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(cardLeftX,  { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(cardLeftOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardRightX,  { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(cardRightOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Decorative dots */}
      <View style={[styles.dot, { top: 100, left: 24 }]} />
      <View style={[styles.dot, styles.dotLg, { top: 160, left: 56 }]} />
      <View style={[styles.dot, { bottom: 130, right: 32 }]} />

      <View style={styles.inner}>

        {/* ── Header ── */}
        <Animated.View style={[
          styles.headerBlock,
          { opacity: titleOp, transform: [{ translateY: titleY }] },
        ]}>
          <Text style={styles.eyebrow}>YOUR DIGITAL TWIN</Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleWhite}>Choose</Text>
            <Text style={styles.titlePink}> Your Pet</Text>
          </View>
          <View style={styles.underlineRow}>
            <View style={styles.underline} />
          </View>
          <Text style={styles.subtitle}>
            Pick the companion you want to simulate
          </Text>
        </Animated.View>

        {/* ── Pet Cards ── */}
        <View style={styles.cardsRow}>
          {(["dog", "cat"] as PetType[]).map((type, i) => {
            const meta = PET_META[type];
            const animX  = i === 0 ? cardLeftX  : cardRightX;
            const animOp = i === 0 ? cardLeftOp : cardRightOp;

            return (
              <Animated.View
                key={type}
                style={[
                  styles.cardWrap,
                  { opacity: animOp, transform: [{ translateX: animX }] },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => onChoosePet(type)}
                >
                  {/* Top accent stripe */}
                  <View style={[styles.cardStripe, { backgroundColor: meta.accentColor }]} />

                  {/* Emoji */}
                  <View style={styles.emojiWrap}>
                    <Text style={styles.emoji}>{meta.emoji}</Text>
                  </View>

                  {/* Label */}
                  <Text style={styles.cardLabel}>{meta.label}</Text>
                  <Text style={styles.cardSubtitle}>{meta.subtitle}</Text>

                  {/* Trait pills */}
                  <View style={styles.traits}>
                    {meta.traits.map((t) => (
                      <View key={t} style={[styles.traitPill, { borderColor: `${meta.accentColor}60` }]}>
                        <Text style={[styles.traitText, { color: meta.accentColor }]}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  {/* CTA arrow row */}
                  <View style={[styles.cardCta, { backgroundColor: `${meta.accentColor}18` }]}>
                    <Text style={[styles.cardCtaText, { color: meta.accentColor }]}>Select</Text>
                    <Text style={[styles.cardCtaArrow, { color: meta.accentColor }]}>→</Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Footer note ── */}
        <Animated.Text style={[styles.footerNote, { opacity: cardLeftOp }]}>
          You can change your pet anytime
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },

  // Blobs
  blobTop: {
    position: "absolute",
    top: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${T.gradientStart}14`,
  },
  blobBottom: {
    position: "absolute",
    bottom: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: `${T.gradientEnd}0E`,
  },

  // Dots
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${T.gradientStart}40`,
  },
  dotLg: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: `${T.gradientMid}28`,
  },

  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    justifyContent: "space-between",
  },

  // Header
  headerBlock: {
    marginBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: T.gradientStart,
    letterSpacing: 2.5,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Bold" : "sans-serif-medium",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  titleWhite: {
    fontSize: 38,
    fontWeight: "900",
    color: T.textPrimary,
    letterSpacing: -1.5,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif-black",
    textTransform: "uppercase",
  },
  titlePink: {
    fontSize: 38,
    fontWeight: "900",
    color: T.gradientStart,
    letterSpacing: -1.5,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif-black",
    textTransform: "uppercase",
  },
  underlineRow: {
    marginTop: 6,
    marginBottom: 12,
  },
  underline: {
    width: 52,
    height: 3,
    backgroundColor: T.gradientStart,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: T.textSecondary,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Regular" : "sans-serif-light",
  },

  // Cards row
  cardsRow: {
    flexDirection: "row",
    gap: 14,
    flex: 1,
    marginVertical: 20,
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: T.card,
    borderRadius: T.radiusCard,
    borderWidth: 1,
    borderColor: T.cardBorder,
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 0,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  cardPressed: {
    borderColor: T.gradientStart,
    backgroundColor: T.cardActive,
    transform: [{ scale: 0.97 }],
  },

  cardStripe: {
    width: "100%",
    height: 5,
    marginBottom: 20,
  },

  emojiWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: T.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emoji: {
    fontSize: 48,
  },

  cardLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: T.textPrimary,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif-black",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: T.textSecondary,
    textAlign: "center",
    letterSpacing: 0.2,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  traits: {
    gap: 6,
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  traitPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  traitText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  cardCta: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    marginTop: "auto",
  },
  cardCtaText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Bold" : "sans-serif-medium",
  },
  cardCtaArrow: {
    fontSize: 15,
    fontWeight: "700",
  },

  footerNote: {
    textAlign: "center",
    color: T.textMuted,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});