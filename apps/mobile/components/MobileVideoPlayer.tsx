import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface MobileVideoPlayerProps {
  url: string;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}

export default function MobileVideoPlayer({ url, onPlaybackStatusUpdate }: MobileVideoPlayerProps) {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  const handlePlaybackUpdate = (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(newStatus);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: url,
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackUpdate}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
});
