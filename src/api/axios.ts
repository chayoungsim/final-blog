import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:import.meta.env.VITE_API_URL,
  withCredentials:true
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");
    if(token) {
      config.headers =config.headers || {};
      config.headers.Authorization= `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
)

let retry = false;
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if(error.response && error.response.status === 401 && ! retry) {
      retry = true;
      try {
        const res = await axiosInstance.post("/auth/refresh");
        if(!res.data.accessToken) throw new Error("Access token is missing");
        retry=false;
        sessionStorage.setItem("access_token", res.data.accessToken);
        return axiosInstance(originalRequest)
      } catch(refreshError) {
        retry = false;
        sessionStorage.removeItem("access_token");
        // 로그아웃 요청이 실패해도 원래 에러를 전달하도록 무시
        await axiosInstance.post("/auth/logout").catch(() => {});
        return Promise.reject(refreshError)
      }
    }
    // 401 외의 에러(CORS, 네트워크, 500 등)는 호출한 쪽에서 처리하도록 그대로 전달
    return Promise.reject(error);
  }
)