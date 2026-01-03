


import { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const schools = [
    { id: "1", name: "University of Ghana", location: "Legon, Accra", hostels: 156 },
    { id: "2", name: "KNUST", location: "Kumasi", hostels: 203 },
    { id: "3", name: "University of Cape Coast", location: "Cape Coast", hostels: 89 },
    { id: "4", name: "University of Education, Winneba", location: "Winneba", hostels: 67 },
    { id: "5", name: "Ho Technical University", location: "Ho", hostels: 45 },
    { id: "6", name: "Ashesi University", location: "Berekuso", hostels: 23 },
    { id: "7", name: "Ghana Institute of Management", location: "Accra", hostels: 34 },
    { id: "8", name: "Kwame Nkrumah University", location: "Kabwe", hostels: 56 },
    { id: "9", name: "University for Development Studies", location: "Tamale", hostels: 78 },
    { id: "10", name: "Central University", location: "Accra", hostels: 41 },
];

export default function SelectSchoolScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

    const filteredSchools = schools.filter(
        (school) =>
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectSchool = (schoolId: string) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSelectedSchool(schoolId);
    };

    const handleContinue = () => {
        if (selectedSchool) {
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            router.replace("/(tabs)");
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Ionicons name="school" size={28} color="#2563eb" />
                </View>
                <Text style={styles.headerTitle}>Select Your School</Text>
                <Text style={styles.headerSubtitle}>
                    We'll show you hostels near your campus
                </Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search schools..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* School List */}
            <FlatList
                data={filteredSchools}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.schoolCard,
                            selectedSchool === item.id && styles.schoolCardSelected,
                        ]}
                        onPress={() => handleSelectSchool(item.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.schoolIcon}>
                            <Ionicons
                                name="school"
                                size={24}
                                color={selectedSchool === item.id ? "#2563eb" : "#64748b"}
                            />
                        </View>
                        <View style={styles.schoolInfo}>
                            <Text
                                style={[
                                    styles.schoolName,
                                    selectedSchool === item.id && styles.schoolNameSelected,

                                ]}
                            >
                                {item.name}
                            </Text>
                            <View style={styles.schoolMeta}>
                                <Ionicons name="location" size={12} color="#94a3b8" />
                                <Text style={styles.schoolLocation}>{item.location}</Text>
                                <Text style={styles.schoolHostels}>• {item.hostels} hostels</Text>
                            </View>
                        </View>
                        {selectedSchool === item.id && (
                            <View style={styles.checkIcon}>
                                <Ionicons name="checkmark" size={18} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="search" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No schools found</Text>
                        <Text style={styles.emptySubtitle}>
                            Try a different search term
                        </Text>
                    </View>
                }
            />

            {/* Continue Button */}
            {selectedSchool && (
                <View style={styles.bottomCTA}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    header: {
        alignItems: "center",
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#1e293b",
        marginLeft: 10,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    schoolCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "transparent",
    },
    schoolCardSelected: {
        borderColor: "#2563eb",
        backgroundColor: "#fafbff",
    },
    schoolIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    schoolInfo: {
        flex: 1,
        marginLeft: 14,
    },
    schoolName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 4,
    },
    schoolNameSelected: {
        color: "#2563eb",
    },
    schoolMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    schoolLocation: {
        fontSize: 13,
        color: "#64748b",
    },
    schoolHostels: {
        fontSize: 13,
        color: "#94a3b8",
    },
    checkIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1e293b",
        marginTop: 16,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#64748b",
    },
    bottomCTA: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    continueButton: {

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
    },
});

