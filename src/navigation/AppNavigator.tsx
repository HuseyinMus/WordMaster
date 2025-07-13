import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import LearningScreen from '../screens/LearningScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WordListScreen from '../screens/WordListScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdTestComponent from '../components/AdTestComponent';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabBarOptions = {
  tabBarActiveTintColor: '#3B82F6', // Modern mavi
  tabBarInactiveTintColor: '#8E9BAE',
  tabBarShowLabel: true,
  tabBarStyle: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    height: Platform.OS === 'ios' ? 80 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginHorizontal: 0,
  },
  tabBarLabelStyle: {
    fontSize: 13,
    fontWeight: 'bold' as any,
    marginBottom: 4,
  },
  headerShown: false,
};

const MainTabs = () => {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          tabBarLabel: 'Öğren',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'book-open-variant' : 'book-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WordList"
        component={WordListScreen}
        options={{
          tabBarLabel: 'Kelimeler',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'format-list-bulleted-square' : 'format-list-bulleted'} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'account-circle' : 'account-circle-outline'} size={26} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Loading screen could be added here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AdTest" component={AdTestComponent} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 