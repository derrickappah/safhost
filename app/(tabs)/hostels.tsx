


import { useState, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    Modal,
    Animated,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Mock hostel data
const hostels = [
    {
        id: "1",
        name: "Unity Hostel",
        price: 300,
        rating: 4.3,
        reviews: 23,
        distance: "0.6km",
        images: [
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        ],
        amenities: ["Wi-Fi", "Water", "Security"],
        isNew: true,
    },
    {
        id: "2",
        name: "Campus View Lodge",
        price: 450,
        rating: 4.7,
        reviews: 45,
        distance: "0.3km",
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        ],
        amenities: ["Wi-Fi", "AC", "Kitchen", "Security"],
        isNew: false,
    },
    {
        id: "3",
        name: "Student Haven",
        price: 280,
        rating: 4.1,
        reviews: 18,
        distance: "1.2km",
        images: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        ],
        amenities: ["Water", "Security"],
        isNew: false,
    },
    {
        id: "4",
        name: "Prestige Lodge",
        price: 520,
        rating: 4.8,
        reviews: 67,
        distance: "0.4km",
        images: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
        ],
        amenities: ["Wi-Fi", "AC", "Kitchen", "Gym", "Security"],
        isNew: true,
    },
    {
        id: "5",
        name: "Comfort Inn Hostel",
        price: 350,
        rating: 4.4,
        reviews: 32,
        distance: "0.8km",
        images: [
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400",
        ],
        amenities: ["Wi-Fi", "Water", "Kitchen"],
        isNew: false,
    },
];

const amenityIcons: Record<string, string> = {
    "Wi-Fi": "wifi",
    "Water": "water",
    "Security": "shield-checkmark",
    "AC": "snow",
    "Kitchen": "restaurant",
    "Gym": "fitness",
};

export default function HostelsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [savedHostels, setSavedHostels] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const slideAnim = useRef(new Animated.Value(height)).current;

    const toggleSave = (id: string) => {
        setSavedHostels((prev) =>
            prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
        );
    };

    const openFilters = () => {
        setShowFilters(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    };

    const closeFilters = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShowFilters(false));
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const filteredHostels = hostels.filter((hostel) =>
        hostel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Find Hostels</Text>
                <TouchableOpacity style={styles.mapButton}>
                    <Ionicons name="map-outline" size={20} color="#2563eb" />
                    <Text style={styles.mapButtonText}>Map</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput
                        }
                        placeholder="Search hostels..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={openFilters}>
                    <Ionicons name="options-outline" size={20} color="#1e293b" />
                </TouchableOpacity>
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {filteredHostels.length} hostels found
                </Text>
                <TouchableOpacity style={styles.sortButton}>
                    <Text style={styles.sortText}>Sort by</Text>
                    <Ionicons name="chevron-down" size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* Hostel List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            >
                {filteredHostels.map((hostel) => (
                    <TouchableOpacity
                        key={hostel.id}
                        style={styles.hostelCard}
                        onPress={() => router.push(`/hostel/${hostel.id}`)}
                        activeOpacity={0.9}
                    >
                        {/* Image */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: hostel.images[0] }}
                                style={styles.hostelImage}
                            />
                            {hostel.isNew && (
                                <View style={styles.newBadge}>
                                    <Text style={styles.newBadgeText}>NEW</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => toggleSave(hostel.id)}
                            >
                                <Ionicons
                                    name={savedHostels.includes(hostel.id) ? "heart" : "heart-outline"}

                                    size={20}
                                    color={savedHostels.includes(hostel.id) ? "#ef4444" : "#fff"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.hostelName}>{hostel.name}</Text>
                                <View style={styles.ratingBadge}>
                                    <Ionicons name="star" size={12} color="#fbbf24" />
                                    <Text style={styles.ratingText}>{hostel.rating}</Text>
                                    <Text style={styles.reviewCount}>({hostel.reviews})</Text>
                                </View>
                            </View>

                            <View style={styles.cardMeta}>
                                <View style={styles.distanceBadge}>
                                    <Ionicons name="location" size={12} color="#6b7280" />
                                    <Text style={styles.distanceText}>{hostel.distance}</Text>
                                </View>
                                <Text style={styles.priceText}>
                                    From <Text style={styles.priceAmount}>GHS {hostel.price}</Text>/mo
                                </Text>
                            </View>

                            <View style={styles.amenitiesRow}>
                                {hostel.amenities.slice(0, 4).map((amenity, idx) => (
                                    <View key={idx} style={styles.amenityTag}>
                                        <Ionicons
                                            name={amenityIcons[amenity] as any || "checkmark"}
                                            size={12}
                                            color="#64748b"
                                        />
                                        <Text style={styles.amenityText}>{amenity}</Text>
                                    </View>
                                ))}
                                {hostel.amenities.length > 4 && (
                                    <View style={styles.moreTag}>
                                        <Text style={styles.moreText}>+{hostel.amenities.length - 4}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Filter Bottom Sheet */}

            <Modal visible={showFilters} transparent animationType="none">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeFilters}
                />
                <Animated.View
                    style={[
                        styles.filterSheet,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Filters</Text>

                    {/* Price Range */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Price Range</Text>
                        <View style={styles.priceInputs}>
                            <View style={styles.priceInput}>
                                <Text style={styles.priceInputLabel}>Min</Text>
                                <Text style={styles.priceInputValue}>GHS {priceRange[0]}</Text>
                            </View>
                            <View style={styles.priceDivider} />
                            <View style={styles.priceInput}>
                                <Text style={styles.priceInputLabel}>Max</Text>
                                <Text style={styles.priceInputValue}>GHS {priceRange[1]}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Distance */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Distance from campus</Text>
                        <View style={styles.distanceOptions}>
                            {["0.5km", "1km", "2km", "5km"].map((dist) => (
                                <TouchableOpacity key={dist} style={styles.distanceOption}>
                                    <Text style={styles.distanceOptionText}>{dist}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Amenities */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {Object.keys(amenityIcons).map((amenity) => (
                                <TouchableOpacity
                                    key={amenity}
                                    style={[
                                        styles.amenityOption,

                                        selectedAmenities.includes(amenity) && styles.amenityOptionActive,
                                    ]}
                                    onPress={() => toggleAmenity(amenity)}
                                >
                                    <Ionicons
                                        name={amenityIcons[amenity] as any}
                                        size={18}
                                        color={selectedAmenities.includes(amenity) ? "#2563eb" : "#64748b"}
                                    />
                                    <Text
                                        style={[
                                            styles.amenityOptionText,
                                            selectedAmenities.includes(amenity) && styles.amenityOptionTextActive,
                                        ]}
                                    >
                                        {amenity}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Apply Button */}
                    <TouchableOpacity style={styles.applyButton} onPress={closeFilters}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Modal>
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
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e293b",
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eff6ff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    mapButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2563eb",
    },
    searchContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    searchInput: {
        flex: 1,

        fontSize: 15,
        color: "#1e293b",
        marginLeft: 10,
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    resultsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    resultsCount: {
        fontSize: 14,
        color: "#64748b",
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    sortText: {
        fontSize: 14,
        color: "#64748b",
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    hostelCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        position: "relative",
        height: 180,
    },
    hostelImage: {
        width: "100%",
        height: "100%",
    },
    newBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "#22c55e",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    newBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#fff",
    },
    saveButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    hostelName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        flex: 1,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef3c7",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 13,

        fontWeight: "600",
        color: "#92400e",
    },
    reviewCount: {
        fontSize: 11,
        color: "#b45309",
    },
    cardMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    distanceBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    distanceText: {
        fontSize: 13,
        color: "#6b7280",
    },
    priceText: {
        fontSize: 14,
        color: "#64748b",
    },
    priceAmount: {
        fontSize: 16,
        fontWeight: "700",
        color: "#059669",
    },
    amenitiesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    amenityTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    amenityText: {
        fontSize: 12,
        color: "#475569",
        fontWeight: "500",
    },
    moreTag: {
        backgroundColor: "#e2e8f0",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    moreText: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    filterSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        maxHeight: height * 0.75,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#e2e8f0",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 20,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 12,
    },
    priceInputs: {
        flexDirection: "row",
        alignItems: "center",
    },
    priceInput: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 12,

        padding: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    priceInputLabel: {
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 4,
    },
    priceInputValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
    },
    priceDivider: {
        width: 20,
        height: 2,
        backgroundColor: "#e2e8f0",
        marginHorizontal: 10,
    },
    distanceOptions: {
        flexDirection: "row",
        gap: 10,
    },
    distanceOption: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    distanceOptionText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#475569",
    },
    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    amenityOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    amenityOptionActive: {
        backgroundColor: "#eff6ff",
        borderColor: "#2563eb",
    },
    amenityOptionText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#64748b",
    },
    amenityOptionTextActive: {
        color: "#2563eb",
    },
    applyButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 8,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});

