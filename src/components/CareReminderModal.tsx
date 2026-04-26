import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { CareReminder } from "../types/pet";

export const CareReminderModal = ({
  reminder,
  onConfirm,
  onLater
}: {
  reminder: CareReminder | null;
  onConfirm: (type: CareReminder["type"]) => void;
  onLater: () => void;
}) => {
  return (
    <Modal animationType="fade" transparent visible={!!reminder}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{reminder?.title}</Text>
          <Text style={styles.message}>{reminder?.message}</Text>

          <View style={styles.buttons}>
            <Pressable style={[styles.button, styles.secondary]} onPress={onLater}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Later</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.primary]}
              onPress={() => reminder && onConfirm(reminder.type)}
            >
              <Text style={styles.buttonText}>{reminder?.confirmLabel ?? "Done"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8
  },
  message: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  primary: {
    backgroundColor: "#2563eb"
  },
  secondary: {
    backgroundColor: "#e5e7eb"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  },
  secondaryText: {
    color: "#1f2937"
  }
});
