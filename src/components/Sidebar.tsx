import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.72;

interface Props {
  visible: boolean;
  onClose: () => void;
  demoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
}

export function Sidebar({ visible, onClose, demoMode, onToggleDemoMode }: Props) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && slideAnim._value === -SIDEBAR_WIDTH) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? "auto" : "none"}>
      {/* Dim overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>⚙️  Settings</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Demo Mode section */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionIcon}>🚀</Text>
            <View style={styles.sectionLabelText}>
              <Text style={styles.sectionTitle}>Demo Mode</Text>
              <Text style={styles.sectionDesc}>
                {demoMode
                  ? "Reminders fire every ~20–35 sec — great for live demos."
                  : "Reminders fire on realistic intervals (3–6 hrs)."}
              </Text>
            </View>
          </View>

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, !demoMode && styles.toggleLabelActive]}>
              Off  (Practical)
            </Text>
            <Switch
              value={demoMode}
              onValueChange={onToggleDemoMode}
              trackColor={{ false: "#d1d5db", true: "#0f766e" }}
              thumbColor={demoMode ? "#fff" : "#fff"}
            />
            <Text style={[styles.toggleLabel, demoMode && styles.toggleLabelActive]}>
              On  (Hackathon)
            </Text>
          </View>

          {demoMode && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>
                🎤  Demo mode active — reminders are sped up
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Reminder intervals info */}
        <View style={styles.section}>
          <Text style={styles.infoHeading}>
            {demoMode ? "Demo intervals" : "Practical intervals"}
          </Text>
          {[
            { icon: "🍖", label: "Feed",  demo: "20 sec",  real: "6 hrs" },
            { icon: "💧", label: "Water", demo: "30 sec",  real: "4 hrs" },
            { icon: "🎾", label: "Play",  demo: "25 sec",  real: "3 hrs" },
            { icon: "🦮", label: "Walk",  demo: "35 sec",  real: "5 hrs" },
          ].map((item) => (
            <View key={item.label} style={styles.intervalRow}>
              <Text style={styles.intervalIcon}>{item.icon}</Text>
              <Text style={styles.intervalLabel}>{item.label}</Text>
              <Text style={styles.intervalValue}>
                {demoMode ? item.demo : item.real}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 },
    elevation: 12,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },
  section: {
    gap: 10,
  },
  sectionLabelRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  sectionIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  sectionLabelText: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionDesc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 17,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
  },
  toggleLabelActive: {
    color: "#0f766e",
  },
  demoBadge: {
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#6ee7b7",
  },
  demoBadgeText: {
    fontSize: 12,
    color: "#065f46",
    fontWeight: "600",
  },
  infoHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  intervalIcon: {
    fontSize: 15,
    width: 22,
  },
  intervalLabel: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  intervalValue: {
    fontSize: 13,
    color: "#0f766e",
    fontWeight: "700",
  },
});