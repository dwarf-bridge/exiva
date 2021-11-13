import puppeteer, { TimeoutError } from 'puppeteer'

;(async () => {
    console.time('start')
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    console.timeEnd('start')
    console.time('req')
    await page.goto('https://www.tibia.com/community/?subtopic=worlds', {
        waitUntil: 'networkidle0',
    })
    console.log(await page.content());
    console.timeEnd('req')
    // console.time('req2')
    // await page.goto(
    //     'https://www.tibia.com/community/?subtopic=worlds&world=Bona'
    // )
    // console.timeEnd('req2')

    // console.time('req3')
    // await page.goto(
    //     'https://www.tibia.com/community/?subtopic=worlds&world=Nossobra'
    // )
    // console.timeEnd('req3')

    // await browser.close()
    // ;('')
})()
