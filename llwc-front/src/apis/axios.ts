import axios from 'axios';

const client = axios.create({
    withCredentials: true,
});

client.interceptors.request.use(async config => {
    if (config.method !== undefined && ['post', 'put', 'delete'].includes(config.method)) {
        const res = await client.get('/user/csrf/');
        config.headers['x-csrftoken'] = res.headers['x-csrftoken'];
    }
    return config;
});

export default client;
