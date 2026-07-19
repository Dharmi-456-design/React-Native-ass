import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SurveyProvider } from '../context/SurveyContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SurveyProvider>
        <Drawer
          screenOptions={{
            headerShown: true,
            drawerType: 'front'
          }}>
          
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: 'Dashboard',
              title: 'Smart Field Survey'
            }} />
          
          <Drawer.Screen
            name="camera"
            options={{
              drawerLabel: 'Camera',
              title: 'Camera'
            }} />
          
          <Drawer.Screen
            name="location"
            options={{
              drawerLabel: 'Location',
              title: 'Location'
            }} />
          
          <Drawer.Screen
            name="contacts"
            options={{
              drawerLabel: 'Contacts',
              title: 'Contacts'
            }} />
          
          <Drawer.Screen
            name="clipboard"
            options={{
              drawerLabel: 'Clipboard',
              title: 'Clipboard'
            }} />
          
          <Drawer.Screen
            name="preview"
            options={{
              drawerLabel: 'Survey Preview',
              title: 'Preview & Submit'
            }} />
          
        </Drawer>
      </SurveyProvider>
    </GestureHandlerRootView>);

}