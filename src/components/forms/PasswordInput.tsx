import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";

type PasswordInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  label: string;
  error?: string;
  rightLabel?: string;
  onRightPress?: () => void;
};

export default function PasswordInput({
  label,
  error,
  rightLabel,
  onRightPress,
  onFocus,
  onBlur,
  ...props
}: PasswordInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>

        {rightLabel && onRightPress ? (
          <Pressable onPress={onRightPress} accessibilityRole="button">
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.inputContainer, isFocused && styles.focusedInput]}>
        <TextInput
          {...props}
          style={styles.input}
          secureTextEntry={!isVisible}
          placeholderTextColor="#94A3B8"
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />

        <Pressable
          onPress={() => setIsVisible(!isVisible)}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          hitSlop={10}
        >
          {isVisible ? (
            <Eye size={20} color="#64748B" />
          ) : (
            <EyeOff size={20} color="#64748B" />
          )}
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  rightLabel: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 8,
    ...({ outlineStyle: "none" } as object),
  },
  focusedInput: {
    borderColor: "#2563EB",
    borderWidth: 1.5,
  },
  error: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 5,
  },
});
