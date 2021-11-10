import axios from 'axios'
import config from '../../../config'

export class Fetch {
    static async get(url: string) {
        console.info(`service:fetch | req: ${url}`)
        return axios(`${config.BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                "Accept-Encoding": "gzip, deflate",
            },
        })
    }
}
