import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";

type FormInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export default function FormInput({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...props}
        style={[styles.input, isFocused && styles.focusedInput, style]}
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

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
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
