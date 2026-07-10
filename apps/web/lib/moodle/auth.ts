import { MoodleAuthResponse, MoodleUser } from './types';
import { moodle } from './client';

/**
 * Authenticates a user against Moodle and retrieves their token and profile data.
 * @param username The user's Moodle username or email
 * @param password The user's Moodle password
 * @returns The user's Moodle token and profile details
 */
export async function authenticateWithMoodle(username: string, password: string) {
  try {
    const url = process.env.MOODLE_URL;
    if (!url) {
      throw new Error('MOODLE_URL environment variable is not set');
    }

    const tokenUrl = url.endsWith('/') ? `${url}login/token.php` : `${url}/login/token.php`;
    
    // 1. Get the User Token using the moodle_mobile_app service
    const tokenParams = new URLSearchParams({
      username: username,
      password: password,
      service: 'moodle_mobile_app',
    });

    if (process.env.USE_MOCK_MOODLE === 'true' || url.includes('localhost')) {
      console.warn("⚠️ Bypassing Moodle Auth for local development.");
      const isAdmin = username === 'admin' || username === 'admin@edunova.com';
      const isTeacher = username === 'teacher' || username === 'teacher@edunova.com';
      
      let mockId = "3"; // default to student
      if (isAdmin) mockId = "2";
      else if (isTeacher) mockId = "4";

      return {
        id: mockId,
        username: username,
        name: username.split('@')[0],
        email: username,
        moodleToken: process.env.MOODLE_WS_TOKEN || "mock_moodle_token",
      };
    }

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      cache: 'no-store'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to contact Moodle auth server: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as MoodleAuthResponse;
    
    if (tokenData.errorcode) {
      throw new Error(`Moodle Error [${tokenData.errorcode}]: ${tokenData.message || 'Authentication failed'}`);
    }

    if (!tokenData.token) {
      throw new Error('Moodle did not return a valid token.');
    }

    const userToken = tokenData.token;

    // 2. Get User Profile Information using core_webservice_get_site_info
    const siteInfo = await moodle.call<any>('core_webservice_get_site_info', {}, { cache: 'no-store' }, userToken);
    
    if (!siteInfo || !siteInfo.userid) {
      throw new Error('Could not retrieve user site info from Moodle');
    }

    return {
      id: String(siteInfo.userid),
      username: siteInfo.username,
      name: siteInfo.fullname,
      email: siteInfo.username, 
      moodleToken: userToken,
      privateToken: tokenData.privatetoken,
    } as MoodleUser;
  } catch (err: any) {
    const fs = require('fs');
    fs.writeFileSync('/tmp/moodle_full_error.txt', err.toString() + (err.stack ? '\\n' + err.stack : ''));
    throw err;
  }
}
