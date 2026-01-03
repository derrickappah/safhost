

import { useState, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    Animated,
    Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

// Mock hostel data
const hostelData = {
    id: "1",
    name: "Unity Hostel",
    price: 300,
    maxPrice: 450,
    rating: 4.3,
    reviewCount: 23,
    distance: "0.6km",
    address: "Near Main Gate, University of Ghana",
    description:
        "Unity Hostel offers comfortable and affordable accommodation for students. Located just 5 minutes walk from the main campus, it provides a safe and conducive environment for studying. All rooms come with basic furniture and access to shared facilities.",
    images: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    amenities: [
        { name: "Wi-Fi", icon: "wifi" },
        { name: "Water", icon: "water" },
        { name: "Security", icon: "shield-checkmark" },
        { name: "Electricity", icon: "flash" },
        { name: "Kitchen", icon: "restaurant" },
        { name: "Laundry", icon: "shirt" },
    ],
    roomTypes: [
        { type: "Single Room", price: 450, available: 3 },
        { type: "Double Room", price: 350, available: 5 },
        { type: "Triple Room", price: 300, available: 8 },
    ],
    landlord: {
        name: "Mr. Kwame Asante",
        phone: "+233 24 XXX XXXX",
        responseTime: "Usually responds within 2 hours",
    },
    reviewsList: [
        {
            id: "1",
            user: "Kofi A.",
            rating: 5,
            comment: "Great hostel! Very clean and the landlord is responsive.",
            date: "2 weeks ago",
        },
        {

            id: "2",
            user: "Ama B.",
            rating: 4,
            comment: "Good location, close to campus. Water supply is consistent.",
            date: "1 month ago",
        },
    ],
};

export default function HostelDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [currentImage, setCurrentImage] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const scrollX = useRef(new Animated.Value(0)).current;
    const isSubscribed = true; // Mock subscription status

    const handleSave = () => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setIsSaved(!isSaved);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${hostelData.name} on HostelFinder! From GHS ${hostelData.price}/month`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleContact = () => {
        if (!isSubscribed) {
            router.push("/subscribe");
        } else {
            // Show contact info
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View style={styles.imageContainer}>
                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={16}
                    >
                        {hostelData.images.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}
                                style={styles.hostelImage}
                            />
                        ))}
                    </Animated.ScrollView>

                    {/* Image Indicators */}
                    <View style={styles.imageIndicators}>
                        {hostelData.images.map((_, index) => {
                            const inputRange = [
                                (index - 1) * width,
                                index * width,
                                (index + 1) * width,
                            ];
                            const opacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.4, 1, 0.4],
                                extrapolate: "clamp",
                            });
                            const scale = scrollX.interpolate({
                                inputRange,
                                outputRange: [1, 1.3, 1],
                                extrapolate: "clamp",
                            });
                            return (
                                <Animated.View
                                    key={index}
                                    style={[styles.indicator, { opacity, transform: [{ scale }] }]}
                                />
                            );
                        })}
                    </View>

                    {/* Back Button */}
                    <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <Ionicons name="share-outline" size={22} color="#1e293b" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                                <Ionicons
                                    name={isSaved ? "heart" : "heart-outline"}
                                    size={22}
                                    color={isSaved ? "#ef4444" : "#1e293b"}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.hostelHeader}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.hostelName}>{hostelData.name}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={14} color="#64748b" />
                                <Text style={styles.locationText}>{hostelData.address}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={16} color="#fbbf24" />
                            <Text style={styles.ratingValue}>{hostelData.rating}</Text>
                            <Text style={styles.reviewCount}>({hostelData.reviewCount})</Text>
                        </View>
                    </View>

                    {/* Price & Distance */}
                    <View style={styles.infoRow}>
                        <View style={styles.priceBox}>
                            <Text style={styles.priceLabel}>Starting from</Text>
                            <Text style={styles.priceValue}>
                                GHS {hostelData.price}
                                <Text style={styles.pricePeriod}>/month</Text>
                            </Text>
                        </View>
                        <View style={styles.distanceBox}>
                            <Ionicons name="walk" size={20} color="#2563eb" />
                            <Text style={styles.distanceValue}>{hostelData.distance}</Text>
                            <Text style={styles.distanceLabel}>from campus</Text>
                        </View>
                    </View>

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {hostelData.amenities.map((amenity, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <View style={styles.amenityIcon}>
                                        <Ionicons
                                            name={amenity.icon as any}
                                            size={20}
                                            color="#2563eb"
                                        />
                                    </View>
                                    <Text style={styles.amenityName}>{amenity.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Room Types */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Room Types</Text>
                        {hostelData.roomTypes.map((room, index) => (

                            <View key={index} style={styles.roomCard}>
                                <View style={styles.roomInfo}>
                                    <Text style={styles.roomType}>{room.type}</Text>
                                    <Text style={styles.roomAvailable}>
                                        {room.available} rooms available
                                    </Text>
                                </View>
                                <Text style={styles.roomPrice}>GHS {room.price}/mo</Text>
                            </View>
                        ))}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>{hostelData.description}</Text>
                    </View>

                    {/* Reviews */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Reviews</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        {hostelData.reviewsList.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewUser}>
                                        <View style={styles.reviewAvatar}>
                                            <Text style={styles.reviewAvatarText}>
                                                {review.user.charAt(0)}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.reviewName}>{review.user}</Text>
                                            <Text style={styles.reviewDate}>{review.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.reviewRating}>
                                        {[...Array(5)].map((_, i) => (
                                            <Ionicons
                                                key={i}
                                                name={i < review.rating ? "star" : "star-outline"}
                                                size={14}
                                                color="#fbbf24"
                                            />
                                        ))}

                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomCTA}>
                <View style={styles.ctaPrice}>
                    <Text style={styles.ctaPriceLabel}>From</Text>
                    <Text style={styles.ctaPriceValue}>GHS {hostelData.price}/mo</Text>
                </View>
                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleContact}
                    activeOpacity={0.8}
                >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Contact Landlord</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    imageContainer: {
        position: "relative",
        height: 300,
    },
    hostelImage: {
        width: width,
        height: 300,
    },
    imageIndicators: {
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#fff",
    },
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerActions: {
        flexDirection: "row",
        gap: 10,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    hostelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    hostelName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        color: "#64748b",
        flex: 1,
    },
    ratingBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef3c7",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    ratingValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#92400e",
    },
    reviewCount: {
        fontSize: 12,
        color: "#b45309",
    },
    infoRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    priceBox: {
        flex: 1,
        backgroundColor: "#f0fdf4",
        borderRadius: 14,
        padding: 16,
    },
    priceLabel: {
        fontSize: 12,
        color: "#16a34a",
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 22,
        fontWeight: "700",
        color: "#15803d",
    },
    pricePeriod: {
        fontSize: 14,
        fontWeight: "500",
        color: "#22c55e",
    },
    distanceBox: {
        flex: 1,
        backgroundColor: "#eff6ff",
        borderRadius: 14,
        padding: 16,
        alignItems: "center",
    },
    distanceValue: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1d4ed8",
        marginTop: 4,
    },
    distanceLabel: {
        fontSize: 12,
        color: "#3b82f6",
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2563eb",
    },
    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    amenityItem: {
        width: (width - 52) / 3,
        alignItems: "center",
        backgroundColor: "#f8fafc",
        paddingVertical: 16,
        borderRadius: 12,
    },
    amenityIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    amenityName: {
        fontSize: 12,
        fontWeight: "500",
        color: "#475569",
    },
    roomCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    roomInfo: {},
    roomType: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 2,
    },
    roomAvailable: {
        fontSize: 13,
        color: "#64748b",
    },
    roomPrice: {
        fontSize: 16,
        fontWeight: "700",
        color: "#059669",
    },
    description: {
        fontSize: 15,
        color: "#475569",
        lineHeight: 24,
    },
    reviewCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    reviewUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
    },
    reviewAvatarText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    reviewName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
    },
    reviewDate: {
        fontSize: 12,
        color: "#94a3b8",
    },
    reviewRating: {
        flexDirection: "row",
        gap: 2,
    },
    reviewComment: {
        fontSize: 14,
        color: "#475569",
        lineHeight: 20,
    },
    bottomCTA: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    ctaPrice: {
        marginRight: 16,
    },
    ctaPriceLabel: {
        fontSize: 12,
        color: "#64748b",
    },
    ctaPriceValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
    },
    contactButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});
