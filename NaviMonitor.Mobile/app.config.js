module.exports = {
  expo: {
    name: "Navi",
    slug: "NaviMonitor-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "navimonitormobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gelo.navimonitor"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      // 🚀 FIXED: Must match the package_name inside your google-services.json exactly
      package: "com.gelo.navimonitor",
      // 🚀 FIXED: Securely reads the absolute path from the cloud secret, falls back locally
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-sqlite",
      "@react-native-community/datetimepicker",
      "@react-native-google-signin/google-signin"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "d4abe9c2-2930-405b-adeb-a0f54c24170c"
      }
    }
  }
};
