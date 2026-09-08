import PostHog from 'posthog-react-native';

export const posthog = new PostHog('phc_nunjz73EtyRvT59GECviRQS5prDJfanJJHUi5ycGw3hX', {
    host: 'https://us.i.posthog.com',
  });


  /**
 * Identify the logged-in user
 */
  export const identifyUser = (userId, email, name) => {
    if (!userId) {
      return;
    }
  
    posthog.identify(String(userId), {
      userId: String(userId),
      email: email || '',
      name: name || '',
    });
  };
  
  /**
   * Capture a custom event
   */
  export const captureEvent = (userId, event, message, properties = {}) => {
    posthog.capture(event, {
      userId: userId,
      timeStamp: new Date().toISOString(),
      message: message,
      ...properties,
    });
  };
  
  /**
   * Reset PostHog user when logging out
   */
  export const resetUser = () => {
    posthog.reset();
  };