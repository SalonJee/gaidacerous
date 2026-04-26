import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PetAction } from "../types/pet";

const ACTIONS: { label: string; value: PetAction }[] = [
  { label: "Feed", value: "feed" },
  { label: "Water", value: "water" },
  { label: "Play", value: "play" },
  { label: "Give Food", value: "giveFood" }
];

export const PetActions = ({ onAction }: { onAction: (action: PetAction) => void }) => (
  <View style={styles.actionsWrap}>
    {ACTIONS.map((item) => (
      <Pressable key={item.value} style={styles.actionButton} onPress={() => onAction(item.value)}>
        <Text style={styles.actionText}>{item.label}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  actionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 14
  },
  actionButton: {
    minWidth: 125,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center"
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15
  }
});
