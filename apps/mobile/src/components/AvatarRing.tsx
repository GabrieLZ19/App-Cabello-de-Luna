import React from "react";
import { View, Image, Text } from "react-native";
import { Sparkles } from "lucide-react-native";

interface AvatarRingProps {
  imageUri?: string;
  name?: string;
  isIA?: boolean;
  size?: number;
}

export const AvatarRing: React.FC<AvatarRingProps> = ({
  imageUri,
  name,
  isIA = false,
  size = 48,
}) => {
  const ringBorderColor = isIA ? "#8B5CF6" : "#C9A45C";
  const shadowColor = isIA ? "#8B5CF6" : "#C9A45C";

  const getInitial = () => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    return parts[0] ? parts[0].charAt(0).toUpperCase() : "A";
  };

  return (
    <View
      style={{
        width: size + 6,
        height: size + 6,
        borderRadius: (size + 6) / 2,
        borderWidth: 2,
        borderColor: ringBorderColor,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#17120D",
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : isIA ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#1E1629",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles color="#8B5CF6" size={size * 0.45} />
        </View>
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#1A140E",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#C9A45C",
              fontSize: size * 0.4,
              fontWeight: "bold",
            }}
          >
            {getInitial()}
          </Text>
        </View>
      )}
    </View>
  );
};
