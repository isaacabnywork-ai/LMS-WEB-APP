import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0d9488' }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'My Courses',
          tabBarLabel: 'Dashboard'
        }} 
      />
    </Tabs>
  );
}
