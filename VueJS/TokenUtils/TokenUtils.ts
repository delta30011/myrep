import {Cookies} from 'quasar';
import armConfig from '~/arm.conf';
import axios, {AxiosInstance} from 'axios';
import {store} from 'arm-sitex';

export default class TokenUtils {
    public axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({
            baseURL: armConfig?.VUE_APP_API_HOST || '',
            timeout: 20000,
            withCredentials: true
        });

            this.initCookie();

            this.axios.interceptors.request.use(async requestConfig => {

                if (!(requestConfig?.url||'').includes(armConfig?.AUTH_EP)) {
                    const accessToken = await this.getToken();
                    if (!accessToken) {
                        console.warn('Отсутствует токен');
                    } else {
                        requestConfig.headers = {
                            'Authorization': `Bearer ${accessToken}`,
                            'Accept': 'application/json;charset=utf-8',
                            'Content-Type': 'application/json'
                        }
                    }
                }
                return requestConfig;
            });
    }

    public async getToken() {
        if (!Cookies.has('JWT')) {
            await this.initCookie();
        }
        return Cookies.get('JWT');
    }


public async fetchToken(): Promise<any> {
        const tokenEndpoint = [armConfig?.VUE_APP_API_HOST].join('/').replace(/\\/,'');
        try {
            const response = await this.axios.post(tokenEndpoint);
            return response;
        } catch (error) {
            console.error('----',error);
            throw error;
        }
    }

 public async getUserInfo() {
     const userInfo = store.getters['petInfo/getUserInfo'];
     if (!userInfo) {
         try { const { data:res } = await this.axios.get(armConfig?.VUE_APP_API_HOST + armConfig?.USER_INFO_URL);
                store.commit('petInfo/setUserInfo',res);
                return res;
         } catch (e)  {
             throw e;
         }
     } else {
         return userInfo;
     }
 }

 public async initCookie(): Promise<boolean> {

        let hasToken = false;
        try {
            const freshToken = await this.fetchToken();

            if (freshToken?.data?.message) {
                const expires = freshToken?.data?.expTime ? new Date(freshToken?.data?.expTime) : new Date().setMilliseconds(10*864e+5);

                document.cookie = [
                    `JWT=${freshToken.data.message}`,
                    'Expires=' + (isNaN(+expires)? (expires as Date) : new Date(expires)).toUTCString(), // use expires attribute, max-age is not supported by IE
                    'Path=/',
                    'Domain=',
                    'Secure'
                ].join('; ');

                hasToken = true;
            }
        } catch (error) {
            console.error('Возникла ошибка при получении токена', error);
            hasToken = false;
            return hasToken;
        }
     return hasToken;
    }

    public resetCookie(): void {
        Cookies.remove('JWT', {
            path: '/',
        });
    }

}
