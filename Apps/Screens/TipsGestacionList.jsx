import React, { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// COLORES E ICONOS POR NIVEL
const levelStyles = {
  "Iniciadora del hierro": { color: "#6366F1", icon: "baby-face" },
  "Aspirante del hierro": { color: "#06B6D4", icon: "arm-flex" },
  "Exploradora del hierro": { color: "#F97316", icon: "compass" },
  "Guerrera del hierro": { color: "#DC2626", icon: "sword-cross" },
  "Defensora del hierro": { color: "#16A34A", icon: "shield" },
  "Dama de hierro": { color: "#9333EA", icon: "crown-outline" },
  "Princesa de hierro": { color: "#D946EF", icon: "star" },
  "Reina de hierro": { color: "#EA580C", icon: "chess-queen" },
  "Emperatriz del hierro": { color: "#B91C1C", icon: "diamond-stone" },
};

const nivelActual = "Guerrera del hierro";

const levelsData = [
  {
    title: "Iniciadora del hierro",
    items: [
      "Video Premio: Kegel",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
  },
  { title: "Aspirante del hierro",
    items: [
      "Video Premio: Estimulación Prenatal Musical",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
   },
  { title: "Exploradora del hierro",
    items: [
      "Video Premio: Ejercicios Prenatales",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
   },
  {
    title: "Guerrera del hierro",
    items: [
      "Video Premio: Estimulación Mixta Motora - Musical",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
  },
  { title: "Defensora del hierro",
    items: [
      "Video Premio: Posición de Descanso",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
   },
  { title: "Dama de hierro",
    items: [
      "Video Premio: Baño del Bebe",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
   },
  { title: "Princesa de hierro",
    items: [
      "Video Premio: Cambio de Pañal",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
   },
  { title: "Reina de hierro",
    items: [
      "Video Premio: Masajes al Bebe",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
   },
  { title: "Emperatriz del hierro",
    items: [
      "Video Premio: Lactancia",
      "Consejos Nutricionales",
      "Consejos Obstétricos",
      "Consejos Estimulación",
      "Tips Mamá y Bebé",
      "Recetas Diarias",
    ],
   },
];

export default function TipsGestacionList() {
  const [openIndex, setOpenIndex] = useState(null);     // controla acordeón abierto
  const [activeIndex, setActiveIndex] = useState(null); // controla resaltado
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return levelsData;
    return levelsData.filter((x) =>
      x.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <View className="flex-1 bg-gray-100 p-4">

      <TextInput
        placeholder="Buscar nivel..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        className="bg-white px-4 py-2.5 rounded-xl text-base mb-4 shadow border border-gray-200"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => (
          <AccordionItem
            item={item}
            index={index}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        )}
      />
    </View>
  );
}

function AccordionItem({ item, index, openIndex, setOpenIndex, activeIndex, setActiveIndex }) {
  const expanded = openIndex === index;

  const real = levelStyles[item.title];
  const color = item.title === nivelActual ? real.color : "#9CA3AF";
  const icon = real.icon;

  const [isPressed, setIsPressed] = useState(false);

  // Si está presionado o es activo, se resalta
  const highlighted = isPressed || activeIndex === index;

  return (
    <LinearGradient
      colors={[
        highlighted ? color + "40" : color + "15",
        "#FFFFFF",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 18,
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: highlighted ? color : "#D1D5DB",
      }}
    >
      <Pressable
        onPressIn={() => {
          setIsPressed(true);
          setActiveIndex(index); // Resalta inmediatamente
        }}
        onPressOut={() => setIsPressed(false)}
        onPress={() => {
          const newState = expanded ? null : index;
          setOpenIndex(newState);
          setActiveIndex(newState); // Mantiene resaltado si queda abierto
        }}
        className="flex-row justify-between items-center"
      >
        <View className="flex-row items-center space-x-2">
          <MaterialCommunityIcons name={icon} size={26} color={color} />

          <Text
            className="text-lg font-bold"
            style={{ color: highlighted ? color : "#9CA3AF" }}
          >
            {item.title}
          </Text>
        </View>

        <MotiView
          animate={{ rotate: expanded ? "180deg" : "0deg" }}
          transition={{ type: "timing", duration: 250 }}
        >
          <AntDesign
            name="down"
            size={22}
            color={highlighted ? color : "#9CA3AF"}
          />
        </MotiView>
      </Pressable>

      <AnimatePresence>
        {expanded && item.items.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ type: "timing", duration: 250 }}
            className="mt-2 ml-8"
          >
            {item.items.map((sub, idx) => (
              <Text key={idx} className="text-base text-gray-700 py-1.5">
                • {sub}
              </Text>
            ))}
          </MotiView>
        )}
      </AnimatePresence>
    </LinearGradient>
  );
}
