module.exports = function (api) {
  api.cache(true);
  const isEAS = process.env.EAS_BUILD === "true";

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      !isEAS && "nativewind/babel",
      "react-native-reanimated/plugin",
    ].filter(Boolean),
  };
};
