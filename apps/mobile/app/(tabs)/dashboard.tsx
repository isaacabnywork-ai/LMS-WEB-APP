import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';

import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;
const localIp = hostUri ? hostUri.split(':')[0] : '10.0.2.2';
const API_URL = `http://${localIp}:3000/api/mobile`;

export default function DashboardScreen() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const renderCourse = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => router.push(`/course/${item.id}`)}
    >
      <View style={styles.courseImageContainer}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.courseImage} />
        ) : (
          <View style={styles.courseImagePlaceholder}>
            <Text style={styles.courseImagePlaceholderText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.courseInstructor}>by {item.instructor?.name || 'Instructor'}</Text>
        <View style={styles.courseMeta}>
          <Text style={styles.courseMetaText}>{item._count?.modules || 0} Modules</Text>
          <Text style={styles.courseMetaText}>•</Text>
          <Text style={styles.courseMetaText}>{item._count?.enrolments || 0} Enrolled</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Student'}</Text>
          <Text style={styles.subtitle}>Ready to learn today?</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Available Courses</Text>
      
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseImageContainer: {
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  courseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  courseImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseImagePlaceholderText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseMetaText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
