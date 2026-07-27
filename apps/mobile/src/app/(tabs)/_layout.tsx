import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Home, BookOpen, Scissors, User } from "lucide-react-native";
import { DESIGN_TOKENS } from "@iltct/shared";

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const bottomInset = insets.bottom > 0 ? insets.bottom : 16;
  const tabHeight = 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: DESIGN_TOKENS.colors.gold,
        tabBarInactiveTintColor: DESIGN_TOKENS.colors.textMuted,
        tabBarStyle: {
          backgroundColor: "#0C0A07",
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("nav.home"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="theory"
        options={{
          title: t("nav.theory"),
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t("nav.practice"),
          tabBarIcon: ({ color, size }) => (
            <Scissors color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
