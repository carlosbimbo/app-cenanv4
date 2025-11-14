module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["nativewind/babel", { mode: "transformOnly" }], // Plugin de NativeWind
      "react-native-reanimated/plugin", // Debe ser el último plugin
    ],
  };
};