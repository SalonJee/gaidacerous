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

const T = {
  gradientStart: "#FD297B",
  gradientMid:   "#FF655B",
  gradientEnd:   "#FF9A45",
  bg:            "#0D0D0D",
  card:          "#1A1A1A",
  cardBorder:    "#2A2A2A",
  textPrimary:   "#FFFFFF",
  textSecondary: "#A0A0A0",
  radiusBtn:     14,
} as const;

interface Props {
  onContinue: () => void;
}

export function IntroScreen({ onContinue }: Props) {
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pawY        = useRef(new Animated.Value(20)).current;
  const pawOpacity  = useRef(new Animated.Value(0)).current;
  const taglineOp   = useRef(new Animated.Value(0)).current;
  const taglineY    = useRef(new Animated.Value(14)).current;
  const btnOp       = useRef(new Animated.Value(0)).current;
  const btnY        = useRef(new Animated.Value(24)).current;
  const heartPulse  = useRef(new Animated.Value(1)).current;
  const lineFill    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo spring pop
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Underline draw (non-native: animates width %)
    Animated.sequence([
      Animated.delay(250),
      Animated.timing(lineFill, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Paw slides up
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(pawOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(pawY, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Tagline fades up
    Animated.sequence([
      Animated.delay(550),
      Animated.parallel([
        Animated.timing(taglineOp, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // CTA button bounces in
    Animated.sequence([
      Animated.delay(880),
      Animated.parallel([
        Animated.timing(btnOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(btnY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Double-heartbeat loop
    Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.spring(heartPulse, { toValue: 1.28, tension: 200, friction: 4, useNativeDriver: true }),
        Animated.spring(heartPulse, { toValue: 1,    tension: 200, friction: 4, useNativeDriver: true }),
        Animated.delay(320),
        Animated.spring(heartPulse, { toValue: 1.16, tension: 200, friction: 4, useNativeDriver: true }),
        Animated.spring(heartPulse, { toValue: 1,    tension: 200, friction: 4, useNativeDriver: true }),
        Animated.delay(2200),
      ])
    ).start();
  }, []);

  const lineWidth = lineFill.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Background glow blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Decorative floating dots */}
      <View style={[styles.dot, { top: 88, left: 30 }]} />
      <View style={[styles.dot, styles.dotLg, { top: 148, left: 62 }]} />
      <View style={[styles.dot, { bottom: 170, right: 38 }]} />
      <View style={[styles.dot, styles.dotLg, { bottom: 230, right: 74 }]} />
      <View style={[styles.dot, { top: 200, right: 28 }]} />

      {/* ── Centre content ── */}
      <View style={styles.centre}>

        {/* Paw icon with heartbeat */}
        <Animated.Text style={[
          styles.pawIcon,
          {
            opacity: pawOpacity,
            transform: [{ translateY: pawY }, { scale: heartPulse }],
          },
        ]}>
          🐾
        </Animated.Text>

        {/* Brand name block */}
        <Animated.View style={[
          styles.brandBlock,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}>
          <View style={styles.brandRow}>
            <Text style={styles.brandWhite}>Pet</Text>
            <Text style={styles.brandPink}>Pal</Text>
          </View>

          {/* Animated draw-in underline */}
          <View style={styles.underlineTrack}>
            <Animated.View style={[styles.underlineFill, { width: lineWidth }]} />
          </View>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[
          styles.tagline,
          { opacity: taglineOp, transform: [{ translateY: taglineY }] },
        ]}>
          Your pet's digital twin.{"\n"}Always by your side.
        </Animated.Text>

        {/* Decorative divider */}
        <Animated.View style={[styles.divider, { opacity: taglineOp }]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerHeart}>♥</Text>
          <View style={styles.dividerLine} />
        </Animated.View>
      </View>

      {/* ── Bottom CTA ── */}
      <Animated.View style={[
        styles.bottomArea,
        { opacity: btnOp, transform: [{ translateY: btnY }] },
      ]}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaBtn,
            pressed && styles.ctaBtnPressed,
          ]}
          onPress={onContinue}
        >
          <Text style={styles.ctaBtnText}>Get Started</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </Pressable>

        <Text style={styles.subCta}>Choose your pet twin to begin</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },

  // ── Blobs ──
  blobTop: {
    position: "absolute",
    top: -130,
    left: -90,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: `${T.gradientStart}16`,
  },
  blobBottom: {
    position: "absolute",
    bottom: -110,
    right: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${T.gradientEnd}10`,
  },

  // ── Dots ──
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${T.gradientStart}45`,
  },
  dotLg: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: `${T.gradientMid}28`,
  },

  // ── Centre ──
  centre: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
    gap: 4,
  },

  pawIcon: {
    fontSize: 68,
    marginBottom: 10,
  },

  brandBlock: {
    alignItems: "center",
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  brandWhite: {
    fontSize: 68,
    fontWeight: "900",
    color: T.textPrimary,
    letterSpacing: -3,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif-black",
    textTransform: "uppercase",
  },
  brandPink: {
    fontSize: 68,
    fontWeight: "900",
    color: T.gradientStart,
    letterSpacing: -3,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif-black",
    textTransform: "uppercase",
  },

  underlineTrack: {
    width: "100%",
    height: 4,
    backgroundColor: T.cardBorder,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  underlineFill: {
    height: "100%",
    backgroundColor: T.gradientStart,
    borderRadius: 2,
  },

  tagline: {
    fontSize: 16,
    color: T.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    marginTop: 20,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Regular" : "sans-serif-light",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 32,
    width: "70%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.cardBorder,
  },
  dividerHeart: {
    fontSize: 14,
    color: T.gradientStart,
  },

  // ── Bottom CTA ──
  bottomArea: {
    paddingHorizontal: 28,
    paddingBottom: 44,
    gap: 14,
    alignItems: "center",
  },
  ctaBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: T.gradientStart,
    borderRadius: T.radiusBtn,
    paddingVertical: 18,
    shadowColor: T.gradientStart,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  ctaBtnPressed: {
    backgroundColor: T.gradientMid,
  },
  ctaBtnText: {
    color: T.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-Heavy" : "sans-serif-black",
    textTransform: "uppercase",
  },
  ctaArrow: {
    color: T.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  subCta: {
    color: T.textSecondary,
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
export default IntroScreen;