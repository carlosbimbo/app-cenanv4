import React, { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import PushNotifications from "../Components/Notifications/PushNotifications";

export default function TipsGestacionList() {
  return (
    <View style={{ flex: 1 }}>
      <PushNotifications />
    </View>
  );
}
