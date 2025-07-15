// AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/Splash';
import OnBoarding from '../screens/OnBoarding';
import LoginTV from '../screens/Login';
import SignUpScreen from '../screens/Signup';
// import SignUp, Login etc.

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="OnBoarding" component={OnBoarding} />
      <Stack.Screen name="Login" component={LoginTV} /> 
       <Stack.Screen name="SignUp" component={SignUpScreen} />
   
    </Stack.Navigator>
  );
};

export default AppNavigator;
