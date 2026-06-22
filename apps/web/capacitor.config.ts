import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lmsapp.app',
  appName: 'LMS APP',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
