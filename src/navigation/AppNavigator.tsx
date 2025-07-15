// AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/Splash';
import OnBoarding from '../screens/OnBoarding';
// import SignUp, Login etc.

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="OnBoarding" component={OnBoarding} />
      {/* <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
