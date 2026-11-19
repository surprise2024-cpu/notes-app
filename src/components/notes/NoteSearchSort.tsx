import { Search } from "lucide-react-native";

import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { NoteSortOrder } from "@/utils/noteFilters";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sortOrder: NoteSortOrder;
  onSortChange: (value: NoteSortOrder) => void;
};

export default function NoteSearchSort({
  search,
  onSearchChange,
  sortOrder,
  onSortChange,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search size={18} color="#64748B" />

        <TextInput
          style={styles.input}
          placeholder="Search your notes..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search notes"
        />
      </View>

      <View style={styles.sortRow}>
        <Pressable
          style={[styles.sortButton, sortOrder === "newest" && styles.selected]}
          onPress={() => onSortChange("newest")}
          accessibilityRole="button"
          accessibilityState={{
            selected: sortOrder === "newest",
          }}
        >
          <Text
            style={[
              styles.sortText,
              sortOrder === "newest" && styles.selectedText,
            ]}
          >
            Newest First
          </Text>
        </Pressable>

        <Pressable
          style={[styles.sortButton, sortOrder === "oldest" && styles.selected]}
          onPress={() => onSortChange("oldest")}
          accessibilityRole="button"
          accessibilityState={{
            selected: sortOrder === "oldest",
          }}
        >
          <Text
            style={[
              styles.sortText,
              sortOrder === "oldest" && styles.selectedText,
            ]}
          >
            Oldest First
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: 46,
    fontSize: 14,
    color: "#0F172A",
    ...({ outlineStyle: "none" } as object),
  },

  sortRow: {
    flexDirection: "row",
    gap: 10,
  },

  sortButton: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },

  selected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  sortText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  selectedText: {
    color: "#FFFFFF",
  },
});
