import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import type { PetType } from "../types/pet";

// Average lifespans in human years
const PET_LIFESPAN: Record<PetType, number> = {
  cat: 15,
  dog: 13,
};
// Human lifespan reference
const HUMAN_LIFESPAN = 79;

/**
 * Speed multiplier: how many pet-seconds pass per real second.
 * e.g. cat lifespan 15 → multiplier = 79/15 ≈ 5.27
 * The clock hands spin this many times faster than a normal clock.
 */
function getSpeedMultiplier(petType: PetType): number {
  return HUMAN_LIFESPAN / PET_LIFESPAN[petType];
}

interface Props {
  petType: PetType;
  /** Pet's age in decimal years at the moment the app session started */
  initialAgeYears: number;
  /** Timestamp (Date.now()) when the session started */
  sessionStartMs: number;
}

export function CatYearsClock({ petType, initialAgeYears, sessionStartMs }: Props) {
  const multiplier = getSpeedMultiplier(petType);

  // --- Animated clock hands ---
  const secondAnim = useRef(new Animated.Value(0)).current;
  const minuteAnim = useRef(new Animated.Value(0)).current;
  const hourAnim = useRef(new Animated.Value(0)).current;

  // --- Age display state ---
  const [displayAge, setDisplayAge] = useState({ years: 0, months: 0 });

  useEffect(() => {
    // One real second = `multiplier` pet-seconds
    // A full rotation of the second hand (60 pet-seconds) happens every (60 / multiplier) real seconds
    const realSecondsPerPetMinute = 60 / multiplier;
    const realSecondsPerPetHour = 3600 / multiplier;

    Animated.loop(
      Animated.timing(secondAnim, {
        toValue: 1,
        duration: realSecondsPerPetMinute * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(minuteAnim, {
        toValue: 1,
        duration: realSecondsPerPetHour * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(hourAnim, {
        toValue: 1,
        duration: realSecondsPerPetHour * 12 * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Update age display every real second
    const interval = setInterval(() => {
      const elapsedRealMs = Date.now() - sessionStartMs;
      const elapsedPetYears = (elapsedRealMs / 1000 / 31536000) * multiplier;
      const totalPetYears = initialAgeYears + elapsedPetYears;
      const years = Math.floor(totalPetYears);
      const months = Math.floor((totalPetYears - years) * 12);
      setDisplayAge({ years, months });
    }, 1000);

    return () => clearInterval(interval);
  }, [petType, initialAgeYears, sessionStartMs]);

  // Seed the initial display immediately
  useEffect(() => {
    const years = Math.floor(initialAgeYears);
    const months = Math.floor((initialAgeYears - years) * 12);
    setDisplayAge({ years, months });
  }, [initialAgeYears]);

  const toRotation = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const cx = 60;
  const cy = 60;
  const r = 54;

  const speedLabel =
    multiplier >= 5
      ? `~${multiplier.toFixed(1)}× faster than human time`
      : `~${multiplier.toFixed(1)}× human speed`;

  return (
    <View style={styles.wrapper}>
      {/* Analogue clock */}
      <View style={styles.clockContainer}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          {/* Face */}
          <Circle cx={cx} cy={cy} r={r} fill="#1e293b" stroke="#334155" strokeWidth={2} />
          <Circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="#475569" strokeWidth={0.5} />

          {/* Hour ticks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = cx + (r - 6) * Math.sin(angle);
            const y1 = cy - (r - 6) * Math.cos(angle);
            const x2 = cx + (r - 10) * Math.sin(angle);
            const y2 = cy - (r - 10) * Math.cos(angle);
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#94a3b8"
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}

          {/* Center dot */}
          <Circle cx={cx} cy={cy} r={3} fill="#f97316" />
        </Svg>

        {/* Hour hand */}
        <Animated.View
          style={[
            styles.hand,
            styles.hourHand,
            { transform: [{ rotate: toRotation(hourAnim) }] },
          ]}
        />
        {/* Minute hand */}
        <Animated.View
          style={[
            styles.hand,
            styles.minuteHand,
            { transform: [{ rotate: toRotation(minuteAnim) }] },
          ]}
        />
        {/* Second hand */}
        <Animated.View
          style={[
            styles.hand,
            styles.secondHand,
            { transform: [{ rotate: toRotation(secondAnim) }] },
          ]}
        />
      </View>

      {/* Age display */}
      <View style={styles.ageBlock}>
        <Text style={styles.ageText}>
          {displayAge.years} yr{displayAge.years !== 1 ? "s" : ""}{" "}
          {displayAge.months} mo
        </Text>
        <Text style={styles.speedLabel}>{speedLabel}</Text>
      </View>
    </View>
  );
}

const CLOCK_SIZE = 120;
const CENTER = CLOCK_SIZE / 2;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginVertical: 10,
  },
  clockContainer: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  hand: {
    position: "absolute",
    bottom: CENTER,
    left: CENTER - 1,
    transformOrigin: "bottom",
  },
  hourHand: {
    width: 3,
    height: 28,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginBottom: -2,
  },
  minuteHand: {
    width: 2,
    height: 38,
    backgroundColor: "#cbd5e1",
    borderRadius: 2,
    marginBottom: -2,
  },
  secondHand: {
    width: 1.5,
    height: 44,
    backgroundColor: "#f97316",
    borderRadius: 1,
    marginBottom: -6,
  },
  ageBlock: {
    flexDirection: "column",
    gap: 4,
  },
  ageText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    letterSpacing: -0.5,
  },
  speedLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
  },
});