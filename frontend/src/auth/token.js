let accessToken = localStorage.getItem("accessToken");

export const setAccessToken = (token) => {
  accessToken = token;
  localStorage.setItem("accessToken", token);
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem("accessToken");
};
