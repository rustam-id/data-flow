import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        meta?: any;
    }
    export interface AxiosResponse {
        responseTime?: number
    }
}

// интерсепторы для отслеживания времени ожидания запроса
axios.interceptors.request.use(x => {
    x.meta = x.meta || {}
    x.meta.requestStartedAt = new Date().getTime();
    return x;
})

axios.interceptors.response.use( x => {
    x.responseTime = (new Date().getTime() - x.config.meta.requestStartedAt) / 1000;
    return x;
})

export default axios