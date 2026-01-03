


import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const menuItems = [
    {
        id: "subscription",
        icon: "card-outline",
        title: "Subscription",
        subtitle: "Active • 12 days left",
        color: "#22c55e",
    },
    {
        id: "school",
        icon: "school-outline",
        title: "My School",
        subtitle: "University of Ghana",
        color: "#2563eb",
    },
    {
        id: "notifications",
        icon: "notifications-outline",
        title: "Notifications",
        subtitle: "Push notifications enabled",
        color: "#f59e0b",
    },
    {
        id: "help",
        icon: "help-circle-outline",
        title: "Help & Support",
        subtitle: "FAQs, Contact us",
        color: "#8b5cf6",
    },
    {
        id: "about",
        icon: "information-circle-outline",
        title: "About",
        subtitle: "Version 1.0.0",
        color: "#64748b",
    },
];

export default function ProfileScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={32} color="#94a3b8" />
                        </View>
                        <View style={styles.statusDot} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Guest User</Text>
                        <Text style={styles.userEmail}>No account linked</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="create-outline" size={20} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                {/* Subscription Banner */}
                <TouchableOpacity style={styles.subscriptionBanner}>
                    <View style={styles.bannerContent}>
                        <View style={styles.bannerIcon}>
                            <Ionicons name="diamond" size={24} color="#fff" />
                        </View>
                        <View style={styles.bannerText}>
                            <Text style={styles.bannerTitle}>Premium Active</Text>
                            <Text style={styles.bannerSubtitle}>12 days remaining</Text>
                        </View>
                    </View>
                    <View style={styles.bannerProgress}>
                        <View style={[styles.bannerProgressFill, { width: "40%" }]} />
                    </View>
                </TouchableOpacity>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>3</Text>
                        <Text style={styles.statLabel}>Saved</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Viewed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Contacted</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && styles.menuItemLast,
                            ]}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                                <Ionicons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

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
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e293b",
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    statusDot: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#22c55e",
        borderWidth: 2,
        borderColor: "#fff",
    },
    userInfo: {
        flex: 1,
        marginLeft: 14,
    },
    userName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: "#64748b",
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
    },
    subscriptionBanner: {
        marginHorizontal: 20,
        backgroundColor: "#2563eb",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    bannerContent: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    bannerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    bannerText: {
        marginLeft: 12,
    },
    bannerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 2,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
    },
    bannerProgress: {
        height: 6,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 3,
    },
    bannerProgressFill: {
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 3,
    },
    statsContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: "#64748b",
    },
    statDivider: {
        width: 1,
        backgroundColor: "#e2e8f0",
    },
    menuContainer: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    menuContent: {
        flex: 1,
        marginLeft: 14,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: "#64748b",
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fef2f2",
        borderRadius: 14,
        gap: 8,
    },
    signOutText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ef4444",
    },
});

