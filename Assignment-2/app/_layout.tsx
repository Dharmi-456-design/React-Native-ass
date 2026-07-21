import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SurveyProvider } from '../context/SurveyContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

function AppDrawer() {
  const { theme, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Drawer
        screenOptions={{
          headerShown: true,
          drawerType: 'front',
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          drawerStyle: { backgroundColor: theme.card },
          drawerActiveTintColor: theme.primary,
          drawerInactiveTintColor: theme.textMuted,
        }}>

        <Drawer.Screen
          name="(tabs)"
          options={{ drawerLabel: 'Dashboard', title: 'Smart Field Survey' }} />

        <Drawer.Screen
          name="camera"
          options={{ drawerLabel: 'Camera', title: 'Camera' }} />

        <Drawer.Screen
          name="location"
          options={{ drawerLabel: 'Location', title: 'Location' }} />

        <Drawer.Screen
          name="contacts"
          options={{ drawerLabel: 'Contacts', title: 'Contacts' }} />

        <Drawer.Screen
          name="clipboard"
          options={{ drawerLabel: 'Clipboard', title: 'Clipboard' }} />

        <Drawer.Screen
          name="preview"
          options={{ drawerLabel: 'Survey Preview', title: 'Preview & Submit' }} />

        <Drawer.Screen
          name="survey-detail"
          options={{ drawerLabel: 'Survey Detail', title: 'Survey Details', drawerItemStyle: { display: 'none' } }} />

      </Drawer>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SurveyProvider>
          <AppDrawer />
        </SurveyProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}