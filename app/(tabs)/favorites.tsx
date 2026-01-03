


import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock saved hostels
const savedHostels = [
    {
        id: "3",
        name: "Student Haven",
        price: 280,
        rating: 4.1,
        distance: "1.2km",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        amenities: ["Water", "Security"],
    },
    {
        id: "4",
        name: "Prestige Lodge",
        price: 520,
        rating: 4.8,
        distance: "0.4km",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
        amenities: ["Wi-Fi", "AC", "Kitchen", "Gym"],
    },
    {
        id: "1",
        name: "Unity Hostel",
        price: 300,
        rating: 4.3,
        distance: "0.6km",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
        amenities: ["Wi-Fi", "Water", "Security"],
    },
];


export default function FavoritesScreen() {
    const router = useRouter();

    if (savedHostels.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Saved Hostels</Text>
                </View>
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="heart-outline" size={48} color="#cbd5e1" />
                    </View>
                    <Text style={styles.emptyTitle}>No saved hostels yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Tap the heart icon on any hostel to save it here for quick access
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => router.push("/(tabs)/hostels")}
                    >
                        <Text style={styles.browseButtonText}>Browse Hostels</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saved Hostels</Text>
                <Text style={styles.headerCount}>{savedHostels.length} saved</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            >
                {savedHostels.map((hostel) => (
                    <TouchableOpacity
                        key={hostel.id}
                        style={styles.hostelCard}
                        onPress={() => router.push(`/hostel/${hostel.id}`)}
                        activeOpacity={0.9}
                    >
                        <Image source={{ uri: hostel.image }} style={styles.hostelImage} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.hostelName}>{hostel.name}</Text>
                                <TouchableOpacity style={styles.heartButton}>
                                    <Ionicons name="heart" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardMeta}>
                                <View style={styles.ratingBadge}>
                                    <Ionicons name="star" size={12} color="#fbbf24" />
                                    <Text style={styles.ratingText}>{hostel.rating}</Text>
                                </View>
                                <Text style={styles.distanceText}>
                                    <Ionicons name="location" size={12} color="#6b7280" /> {hostel.distance}
                                </Text>
                            </View>
                            <View style={styles.cardFooter}>
                                <View style={styles.amenitiesRow}>
                                    {hostel.amenities.slice(0, 3).map((amenity, idx) => (
                                        <View key={idx} style={styles.amenityTag}>
                                            <Text style={styles.amenityText}>{amenity}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.priceText}>GHS {hostel.price}/mo</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e293b",
    },
    headerCount: {
        fontSize: 14,
        color: "#64748b",
        fontWeight: "500",
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    hostelCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    hostelImage: {
        width: 110,
        height: 130,
    },
    cardContent: {
        flex: 1,
        padding: 14,

        justifyContent: "space-between",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    hostelName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        flex: 1,
        marginRight: 8,
    },
    heartButton: {
        padding: 4,
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#92400e",
    },
    distanceText: {
        fontSize: 13,
        color: "#6b7280",
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amenitiesRow: {
        flexDirection: "row",
        gap: 6,
    },
    amenityTag: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    amenityText: {
        fontSize: 10,
        color: "#64748b",
        fontWeight: "500",
    },
    priceText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#059669",
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: "#2563eb",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    browseButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
});
