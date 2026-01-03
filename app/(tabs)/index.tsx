


import { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Mock data
const recentlyViewed = [
    {
        id: "1",
        name: "Unity Hostel",
        price: 300,
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
    },
    {
        id: "2",
        name: "Campus View",
        price: 450,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    },
];

const favorites = [
    {
        id: "3",
        name: "Student Haven",
        price: 280,
        rating: 4.1,
        distance: "1.2km",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    },
    {
        id: "4",
        name: "Prestige Lodge",
        price: 520,
        rating: 4.8,
        distance: "0.4km",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    },
];

export default function DashboardScreen() {
    const router = useRouter();
    const daysLeft = 12;
    const isSubscribed = true;

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good morning 👋</Text>
                        <Text style={styles.schoolName}>University of Ghana</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Ionicons name="notifications-outline" size={24} color="#1e293b" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>

                {/* Subscription Card */}
                <View style={styles.subscriptionCard}>
                    <View style={styles.subscriptionHeader}>
                        <View style={styles.subscriptionBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                            <Text style={styles.subscriptionStatus}>Active</Text>
                        </View>
                        <Text style={styles.daysLeft}>{daysLeft} days left</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${(daysLeft / 30) * 100}%` }]} />
                    </View>
                    <TouchableOpacity style={styles.renewButton}>
                        <Text style={styles.renewButtonText}>Renew Subscription</Text>
                        <Ionicons name="arrow-forward" size={16} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => router.push("/(tabs)/hostels")}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: "#eff6ff" }]}>
                            <Ionicons name="search" size={24} color="#2563eb" />
                        </View>
                        <Text style={styles.quickActionText}>Browse</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionCard}>
                        <View style={[styles.quickActionIcon, { backgroundColor: "#f0fdf4" }]}>
                            <Ionicons name="map" size={24} color="#22c55e" />
                        </View>
                        <Text style={styles.quickActionText}>Map</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionCard}>
                        <View style={[styles.quickActionIcon, { backgroundColor: "#fefce8" }]}>
                            <Ionicons name="star" size={24} color="#eab308" />
                        </View>
                        <Text style={styles.quickActionText}>Top Rated</Text>
                    </TouchableOpacity>
                </View>

                {/* Favorites Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Favorites</Text>

                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {favorites.map((hostel) => (
                            <TouchableOpacity
                                key={hostel.id}
                                style={styles.favoriteCard}
                                onPress={() => router.push(`/hostel/${hostel.id}`)}
                            >
                                <Image source={{ uri: hostel.image }} style={styles.favoriteImage} />
                                <View style={styles.favoriteContent}>
                                    <Text style={styles.favoriteName} numberOfLines={1}>{hostel.name}</Text>
                                    <View style={styles.favoriteRow}>
                                        <View style={styles.ratingSmall}>
                                            <Ionicons name="star" size={10} color="#fbbf24" />
                                            <Text style={styles.ratingSmallText}>{hostel.rating}</Text>
                                        </View>
                                        <Text style={styles.distanceSmall}>{hostel.distance}</Text>
                                    </View>
                                    <Text style={styles.favoritePrice}>GHS {hostel.price}/mo</Text>
                                </View>
                                <TouchableOpacity style={styles.heartButton}>
                                    <Ionicons name="heart" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Recently Viewed */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recently Viewed</Text>

                    </View>
                    {recentlyViewed.map((hostel) => (
                        <TouchableOpacity
                            key={hostel.id}
                            style={styles.recentCard}
                            onPress={() => router.push(`/hostel/${hostel.id}`)}
                        >
                            <Image source={{ uri: hostel.image }} style={styles.recentImage} />
                            <View style={styles.recentContent}>
                                <Text style={styles.recentName}>{hostel.name}</Text>
                                <Text style={styles.recentPrice}>From GHS {hostel.price}/mo</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}
                </View>

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
    greeting: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 2,
    },
    schoolName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1e293b",
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationDot: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#ef4444",
    },
    subscriptionCard: {
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    subscriptionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        marginBottom: 12,
    },
    subscriptionBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0fdf4",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    subscriptionStatus: {
        fontSize: 13,
        fontWeight: "600",
        color: "#16a34a",
    },
    daysLeft: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748b",
    },
    progressBar: {
        height: 6,
        backgroundColor: "#e2e8f0",
        borderRadius: 3,
        marginBottom: 12,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#22c55e",
        borderRadius: 3,
    },
    renewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        backgroundColor: "#eff6ff",
        borderRadius: 10,
    },
    renewButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2563eb",
    },
    quickActions: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2563eb",
    },
    horizontalScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    favoriteCard: {
        width: 180,
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    favoriteImage: {
        width: "100%",
        height: 110,
    },
    favoriteContent: {
        padding: 12,
    },
    favoriteName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 4,
    },
    favoriteRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    ratingSmall: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    ratingSmallText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#92400e",
    },
    distanceSmall: {
        fontSize: 11,
        color: "#64748b",
    },
    favoritePrice: {
        fontSize: 14,
        fontWeight: "700",
        color: "#059669",
    },
    heartButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    recentCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    recentImage: {
        width: 56,
        height: 56,
        borderRadius: 10,
    },
    recentContent: {
        flex: 1,
        marginLeft: 12,
    },
    recentName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 2,
    },
    recentPrice: {
        fontSize: 13,
        color: "#64748b",
    },
});

