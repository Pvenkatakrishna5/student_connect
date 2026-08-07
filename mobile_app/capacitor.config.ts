import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studentconnect.app',
  appName: 'StudentConnect',
  webDir: 'www',
  server: {
    url: 'https://student-connect-tawny.vercel.app',
    cleartext: true
  }
};

export default config;
