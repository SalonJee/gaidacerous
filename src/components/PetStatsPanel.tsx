import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { PetState } from "../types/pet";

const StatRow = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.statValue}>{Math.round(value)}</Text>
  </View>
);

export const PetStatsPanel = ({ petState }: { petState: PetState }) => (
  <View style={styles.panel}>
    <StatRow label="Health" value={petState.health} color="#34d399" />
    <StatRow label="Hunger" value={petState.hunger} color="#f59e0b" />
    <StatRow label="Thirst" value={petState.thirst} color="#38bdf8" />
    <StatRow label="Happiness" value={petState.happiness} color="#a78bfa" />
    <StatRow label="Energy" value={petState.energy} color="#fb7185" />
    <StatRow label="Food Safety" value={100 - petState.foodSafetyRisk} color="#22c55e" />
  </View>
);

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statLabel: {
    width: 86,
    fontSize: 13,
    color: "#374151",
    fontWeight: "600"
  },
  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999
  },
  statValue: {
    width: 34,
    textAlign: "right",
    fontWeight: "700",
    color: "#111827"
  }
});
