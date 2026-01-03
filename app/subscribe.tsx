


import { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const plans = [
    {
        id: "monthly",
        name: "Monthly",
        price: 20,
        period: "month",
        popular: true,
        features: [
            "Full access to all hostels",
            "Contact landlords directly",
            "Save favorites",
            "View all photos & details",
        ],
    },
    {
        id: "semester",
        name: "Semester",
        price: 50,
        period: "4 months",
        popular: false,
        savings: "Save GHS 30",
        features: [
            "Everything in Monthly",
            "Priority support",
            "Early access to new listings",
        ],
    },
];

const paymentMethods = [
    { id: "mtn", name: "MTN Mobile Money", color: "#ffcc00" },
    { id: "vodafone", name: "Vodafone Cash", color: "#e60000" },
    { id: "airteltigo", name: "AirtelTigo Money", color: "#ff0000" },
];

export default function SubscribeScreen() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [selectedPayment, setSelectedPayment] = useState("mtn");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setIsLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsLoading(false);
            router.replace("/select-school");
        }, 2000);
    };

    const currentPlan = plans.find((p) => p.id === selectedPlan);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="close" size={24} color="#1e293b" />

                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscribe</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="diamond" size={32} color="#2563eb" />
                    </View>
                    <Text style={styles.heroTitle}>Unlock Full Access</Text>
                    <Text style={styles.heroSubtitle}>
                        Get unlimited access to all hostel listings, contact details, and
                        exclusive features
                    </Text>
                </View>

                {/* Plans */}
                <View style={styles.plansContainer}>
                    {plans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planCard,
                                selectedPlan === plan.id && styles.planCardSelected,
                            ]}
                            onPress={() => setSelectedPlan(plan.id)}
                            activeOpacity={0.8}
                        >
                            {plan.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularText}>POPULAR</Text>
                                </View>
                            )}
                            {plan.savings && (
                                <View style={styles.savingsBadge}>
                                    <Text style={styles.savingsText}>{plan.savings}</Text>
                                </View>
                            )}
                            <View style={styles.planHeader}>
                                <View
                                    style={[
                                        styles.radioOuter,
                                        selectedPlan === plan.id && styles.radioOuterSelected,
                                    ]}
                                >
                                    {selectedPlan === plan.id && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                                <View style={styles.planInfo}>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <View style={styles.planPriceRow}>
                                        <Text style={styles.planCurrency}>GHS</Text>
                                        <Text style={styles.planPrice}>{plan.price}</Text>
                                        <Text style={styles.planPeriod}>/{plan.period}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.planFeatures}>
                                {plan.features.map((feature, index) => (
                                    <View key={index} style={styles.featureRow}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={18}
                                            color="#22c55e"
                                        />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Payment Methods */}
                <View style={styles.paymentSection}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentMethods}>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.paymentCard,
                                    selectedPayment === method.id && styles.paymentCardSelected,
                                ]}
                                onPress={() => setSelectedPayment(method.id)}
                            >
                                <View
                                    style={[
                                        styles.paymentIcon,
                                        { backgroundColor: method.color },
                                    ]}
                                >
                                    <Ionicons name="phone-portrait" size={16} color="#fff" />
                                </View>
                                <Text style={styles.paymentName}>{method.name}</Text>
                                {selectedPayment === method.id && (
                                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>
                            {currentPlan?.name} Plan</Text>
                        <Text style={styles.summaryValue}>GHS {currentPlan?.price}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>GHS {currentPlan?.price}</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomCTA}>
                <TouchableOpacity
                    style={[styles.subscribeButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSubscribe}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.subscribeButtonText}>
                                Pay GHS {currentPlan?.price}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
                <Text style={styles.secureText}>
                    <Ionicons name="lock-closed" size={12} color="#94a3b8" /> Secure
                    payment via Paystack
                </Text>
            </View>
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
    },
    hero: {
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    heroIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1e293b",
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 22,
    },
    plansContainer: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    planCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: "#e2e8f0",
        position: "relative",
    },
    planCardSelected: {
        borderColor: "#2563eb",
        backgroundColor: "#fafbff",
    },
    popularBadge: {
        position: "absolute",
        top: -10,
        right: 16,
        backgroundColor: "#2563eb",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    popularText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#fff",
    },
    savingsBadge: {
        position: "absolute",
        top: -10,
        right: 16,
        backgroundColor: "#22c55e",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    savingsText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#fff",
    },
    planHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#cbd5e1",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    radioOuterSelected: {
        borderColor: "#2563eb",
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#2563eb",
    },
    planInfo: {},
    planName: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 4,
    },
    planPriceRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    planCurrency: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748b",
        marginRight: 2,
    },
    planPrice: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1e293b",
    },
    planPeriod: {
        fontSize: 14,
        color: "#64748b",
        marginLeft: 2,
    },
    planFeatures: {
        gap: 8,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    featureText: {
        fontSize: 14,
        color: "#475569",
    },
    paymentSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 12,
    },
    paymentMethods: {
        gap: 10,
    },
    paymentCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    paymentCardSelected: {
        borderColor: "#2563eb",
        backgroundColor: "#fafbff",
    },
    paymentIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    paymentName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
    },
    summarySection: {
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryLabel: {
        fontSize: 14,
        color: "#64748b",
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
    },
    summaryDivider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1e293b",
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
    subscribeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        marginBottom: 12,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    subscribeButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
    },
    secureText: {
        fontSize: 12,
        color: "#94a3b8",
        textAlign: "center",
    },
});

