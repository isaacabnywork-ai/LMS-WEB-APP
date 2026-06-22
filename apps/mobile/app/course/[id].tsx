import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AuthContext } from '../../src/context/AuthContext';
import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;
const localIp = hostUri ? hostUri.split(':')[0] : '10.0.2.2';
const API_URL = `http://${localIp}:3000/api/mobile`;

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // Setup Expo Video Player
  const videoSource = activeLesson?.type === 'video' && activeLesson?.contentUrl ? activeLesson.contentUrl : null;
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${id}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) return;
    setEnrolling(true);
    try {
      const response = await fetch(`${API_URL}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, userId: user.id })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'You are now enrolled!');
      } else {
        Alert.alert('Notice', data.error);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.centered}>
        <Text>Course not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Video Player or Header */}
      {videoSource ? (
        <View style={styles.videoContainer}>
          <VideoView 
            style={styles.video} 
            player={player} 
            allowsFullscreen 
            allowsPictureInPicture 
          />
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.instructor}>by {course.instructor?.name}</Text>
          <TouchableOpacity 
            style={styles.enrollBtn} 
            onPress={handleEnroll}
            disabled={enrolling}
          >
            <Text style={styles.enrollBtnText}>
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Curriculum */}
      <View style={styles.content}>
        {activeLesson && (
          <View style={styles.nowPlaying}>
            <Text style={styles.nowPlayingLabel}>Now Playing:</Text>
            <Text style={styles.nowPlayingTitle}>{activeLesson.title}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Curriculum</Text>
        
        {course.modules?.map((mod: any, index: number) => (
          <View key={mod.id} style={styles.moduleCard}>
            <Text style={styles.moduleTitle}>Module {index + 1}: {mod.title}</Text>
            
            {mod.lessons?.map((lesson: any) => (
              <TouchableOpacity 
                key={lesson.id} 
                style={[
                  styles.lessonRow, 
                  activeLesson?.id === lesson.id && styles.lessonRowActive
                ]}
                onPress={() => setActiveLesson(lesson)}
              >
                <Text style={[
                  styles.lessonIcon,
                  activeLesson?.id === lesson.id && styles.lessonIconActive
                ]}>
                  {lesson.type === 'video' ? '▶️' : '📄'}
                </Text>
                <View style={styles.lessonInfo}>
                  <Text style={[
                    styles.lessonTitle,
                    activeLesson?.id === lesson.id && styles.lessonTitleActive
                  ]}>{lesson.title}</Text>
                  {lesson.durationMinutes && (
                    <Text style={styles.lessonDuration}>{lesson.durationMinutes} min</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            {mod.lessons?.length === 0 && (
              <Text style={styles.emptyText}>No lessons yet.</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
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
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  header: {
    padding: 24,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructor: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 20,
  },
  enrollBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  enrollBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  nowPlaying: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  nowPlayingLabel: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nowPlayingTitle: {
    fontSize: 16,
    color: '#0c4a6e',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  lessonRowActive: {
    backgroundColor: '#f0fdfa',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  lessonIcon: {
    fontSize: 20,
    marginRight: 12,
    opacity: 0.5,
  },
  lessonIconActive: {
    opacity: 1,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    color: '#475569',
  },
  lessonTitleActive: {
    color: '#0d9488',
    fontWeight: '600',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    fontSize: 14,
    paddingVertical: 8,
  },
});
