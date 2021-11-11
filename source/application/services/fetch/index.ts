import axios from 'axios'
import config from '../../../config'
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import UserAgent from 'user-agents';

export class Fetch {
    static async get(url: string) {
        const userAgent = new UserAgent();
        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));  
        console.info(`service:fetch | req: ${url}`)
        return client(`${config.BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                "User-Agent": userAgent.toString(),
                "Accept-Encoding": "gzip, deflate",
            },
        })
    }
}
