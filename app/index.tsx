

import { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Mock blurred hostel data for preview
const previewHostels = [
    {
        id: "1",
        name: "Unity Hostel",
        price: 300,
        rating: 4.3,
        distance: "0.6km",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
        amenities: ["Wi-Fi", "Water", "Security"],
    },
    {
        id: "2",
        name: "Campus View Lodge",
        price: 450,
        rating: 4.7,
        distance: "0.3km",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        amenities: ["Wi-Fi", "AC", "Kitchen"],
    },
    {
        id: "3",
        name: "Student Haven",
        price: 280,
        rating: 4.1,
        distance: "1.2km",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        amenities: ["Water", "Security"],
    },
];

const features = [
    { icon: "camera-outline", text: "Real Photos" },
    { icon: "cash-outline", text: "Verified Prices" },
    { icon: "location-outline", text: "Distance Info" },
    { icon: "star-outline", text: "Student Reviews" },
    { icon: "call-outline", text: "Direct Contact" },
];

export default function LandingScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <Ionicons name="home" size={24} color="#fff" />
                        </View>
                        <Text style={styles.logoText}>HostelFinder</Text>
                    </View>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>
                        Find Verified Hostels{"\n"}Near Your School
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Browse 500+ student hostels across Ghana
                    </Text>
                </View>

                {/* Features Grid */}
                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={feature.icon as any} size={20} color="#2563eb" />
                            </View>
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Blurred Preview Section */}
                <View style={styles.previewSection}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>Available Hostels</Text>
                        <View style={styles.lockBadge}>
                            <Ionicons name="lock-closed" size={12} color="#fff" />
                            <Text style={styles.lockText}>Locked</Text>
                        </View>
                    </View>

                    {/* Blurred Hostel Cards */}
                    {previewHostels.map((hostel) => (
                        <View key={hostel.id} style={styles.blurredCard}>
                            <View style={styles.cardImageContainer}>
                                <Image
                                    source={{ uri: hostel.image }}
                                    style={styles.cardImage}
                                    blurRadius={Platform.OS === "ios" ? 8 : 5}
                                />
                                <View style={styles.blurOverlay}>
                                    <Ionicons name="lock-closed" size={24} color="#fff" />
                                </View>
                            </View>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.hostelName}>{hostel.name}</Text>
                                    <View style={styles.ratingBadge}>

                                        <Ionicons name="star" size={12} color="#fbbf24" />
                                        <Text style={styles.ratingText}>{hostel.rating}</Text>
                                    </View>
                                </View>
                                <View style={styles.cardMeta}>
                                    <Text style={styles.distanceText}>
                                        <Ionicons name="location" size={12} color="#6b7280" /> {hostel.distance}
                                    </Text>
                                    <Text style={styles.priceText}>
                                        From GHS {hostel.price}/mo
                                    </Text>
                                </View>
                                <View style={styles.amenitiesRow}>
                                    {hostel.amenities.map((amenity, idx) => (
                                        <View key={idx} style={styles.amenityTag}>
                                            <Text style={styles.amenityText}>{amenity}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Spacer for sticky button */}
                <View style={{ height: 180 }} />
            </ScrollView>

            {/* Sticky CTA Section */}
            <View style={styles.ctaContainer}>
                <View style={styles.ctaGradient}>
                    <View style={styles.ctaContent}>
                        <View style={styles.priceBox}>
                            <Text style={styles.priceLabel}>Full Access</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.currency}>GHS</Text>
                                <Text style={styles.priceAmount}>20</Text>
                                <Text style={styles.pricePeriod}>/month</Text>
                            </View>
                        </View>

                        <View style={styles.benefitsList}>
                            <View style={styles.benefitItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                                <Text style={styles.benefitText}>Full access for 30 days</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                                <Text style={styles.benefitText}>No account required</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                                <Text style={styles.benefitText}>Mobile Money supported</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.subscribeButton}
                            onPress={() => router.push("/subscribe")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* Payment Methods */}
                        <View style={styles.paymentMethods}>
                            <Text style={styles.paymentLabel}>Pay with</Text>
                            <View style={styles.paymentIcons}>
                                <View style={styles.paymentBadge}>
                                    <Text style={styles.paymentBadgeText}>MTN MoMo</Text>
                                </View>
                                <View style={styles.paymentBadge}>
                                    <Text style={styles.paymentBadgeText}>Vodafone Cash</Text>
                                </View>
                                <View style={styles.paymentBadge}>
                                    <Text style={styles.paymentBadgeText}>AirtelTigo</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1e293b",
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,

    },
    heroTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#0f172a",
        lineHeight: 40,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: "#64748b",
        lineHeight: 24,
    },
    featuresContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eff6ff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    featureIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#dbeafe",
        alignItems: "center",
        justifyContent: "center",
    },
    featureText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e40af",
    },
    previewSection: {
        paddingHorizontal: 20,
    },
    previewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
    },
    lockBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ef4444",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    lockText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    blurredCard: {
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
    cardImageContainer: {
        position: "relative",
        height: 160,
    },
    cardImage: {
        width: "100%",
        height: "100%",
    },
    blurOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        fontSize: 17,
        fontWeight: "700",
        color: "#1e293b",
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
    cardMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    distanceText: {
        fontSize: 13,
        color: "#6b7280",
    },
    priceText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#059669",
    },
    amenitiesRow: {
        flexDirection: "row",
        gap: 8,
    },
    amenityTag: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    amenityText: {
        fontSize: 12,
        color: "#475569",
        fontWeight: "500",
    },
    ctaContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    ctaGradient: {
        paddingTop: 20,
        backgroundColor: "#fff",
    },
    ctaContent: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    priceBox: {
        alignItems: "center",
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 14,
        color: "#64748b",
        fontWeight: "500",
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    currency: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1e293b",
        marginRight: 2,
    },
    priceAmount: {
        fontSize: 42,
        fontWeight: "800",

        color: "#1e293b",
    },
    pricePeriod: {
        fontSize: 16,
        color: "#64748b",
        marginLeft: 2,
    },
    benefitsList: {
        marginBottom: 16,
    },
    benefitItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    benefitText: {
        fontSize: 14,
        color: "#475569",
    },
    subscribeButton: {
        backgroundColor: "#2563eb",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        marginBottom: 16,
    },
    subscribeButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
    },
    paymentMethods: {
        alignItems: "center",
    },
    paymentLabel: {
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 8,
    },
    paymentIcons: {
        flexDirection: "row",
        gap: 8,
    },
    paymentBadge: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    paymentBadgeText: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: "500",
    },
});
