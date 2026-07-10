import { MoodleResponse } from './types';

export class MoodleError extends Error {
  constructor(public errorCode: string, public message: string, public debugInfo?: string) {
    super(`Moodle Error [${errorCode}]: ${message}`);
    this.name = 'MoodleError';
  }
}

/**
 * Base client for calling Moodle Web Services from the Next.js backend (Server Components / API Routes).
 * NEVER import this on the client-side as it will expose the Moodle URL and tokens.
 */
export class MoodleClient {
  private readonly baseUrl: string;
  private readonly defaultToken?: string;

  constructor(token?: string) {
    const url = process.env.MOODLE_URL || 'http://localhost';
    // Ensure URL has a trailing slash for the REST endpoint
    this.baseUrl = url.endsWith('/') ? `${url}webservice/rest/server.php` : `${url}/webservice/rest/server.php`;
    this.defaultToken = token || process.env.MOODLE_WS_TOKEN;
  }

  /**
   * Make a standard REST call to Moodle.
   * @param wsfunction The Moodle Web Service function name (e.g., 'core_course_get_courses')
   * @param params Additional parameters to send to the function
   * @param options Fetch options (e.g., Next.js caching controls)
   * @param userToken Override the default token with a specific user's token
   */
  async call<T extends MoodleResponse | MoodleResponse[]>(
    wsfunction: string,
    params: Record<string, string | number | boolean | object> = {},
    options?: RequestInit,
    userToken?: string
  ): Promise<T> {
    const token = userToken || this.defaultToken;
    if (!token) {
      throw new Error('No Moodle token provided for request');
    }

    const urlParams = new URLSearchParams();
    urlParams.append('wstoken', token);
    urlParams.append('wsfunction', wsfunction);
    urlParams.append('moodlewsrestformat', 'json');

    // Moodle expects arrays/objects in specific URL encoded formats (e.g., param[0]=1&param[1]=2)
    // For a robust implementation, a deep object serializer like qs is recommended. 
    // Here we use a basic flat URLSearchParams mapping suitable for simple parameters.
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'object') {
        // Simplified for this template; in production use a robust query string builder
        urlParams.append(key, JSON.stringify(value)); 
      } else {
        urlParams.append(key, String(value));
      }
    }

    const url = `${this.baseUrl}?${urlParams.toString()}`;

    const response = await fetch(url, {
      method: 'POST', // Use POST to avoid large URL limits on complex queries
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Moodle returns 200 OK even for application-level errors (like invalid token)
    // We must check if the response contains an exception
    if (data && typeof data === 'object' && 'exception' in data) {
      throw new MoodleError(
        data.errorcode || 'UNKNOWN_ERROR',
        data.message || 'An unknown Moodle error occurred',
        data.debuginfo
      );
    }

    return data as T;
  }
}

// Global instance for Admin/System level calls
export const moodle = new MoodleClient();
