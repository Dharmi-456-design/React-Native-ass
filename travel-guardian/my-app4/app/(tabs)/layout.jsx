import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>

      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
        }}
      />

      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
        }}
      />

      <Tabs.Screen
        name="location"
        options={{
          title: "Location",
        }}
      />

    </Tabs>
  );
}