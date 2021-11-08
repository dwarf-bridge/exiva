import fetch from 'node-fetch';
import config from '../../../config'

export class Fetch {
    static async get(url: string) {
        return fetch(`${config.BASE_URL}${url}`, {
            method: 'GET',
            headers: {},
        })
    }
}
