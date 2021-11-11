import axios from 'axios'
import config from '../../../config'
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export class Fetch {
    static async get(url: string) {
        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));  
        console.info(`service:fetch | req: ${url}`)
        return client(`${config.BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                "Accept-Encoding": "gzip, deflate",
            },
        })
    }
}
