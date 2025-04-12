const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/v1"

export const redditApis = {
   PROCESS_USER_PROMPT: `${apiBaseUrl}/reddit/process-user-prompt`,
   TOKEN_VALIDATION: `${apiBaseUrl}/reddit/check-tokens`,
   ACCESS_TOKEN_API: `${apiBaseUrl}/reddit/access-token`,
   VALIDATE_ACCESS_TOKEN_API: `${apiBaseUrl}/reddit/validate-access-token`
};
