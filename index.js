
const puppeteer = require('puppeteer');
const  fs = require('fs');
let link = '';
(async () => {
  let flag = true
  let res = []
  let counter = 1
  try {
    let browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      devtools: true
    })
    let page = await browser.newPage()
    await page.setViewport({
      width: 1400, height: 900
    })

    while (flag) {
      await page.goto(`${link}`)
      await page.waitForSelector('a.g-i-more-link')
      console.log(counter);

      let html = await page.evaluate(async () => {
        let page = []

        try {

          let divs = await document.querySelectorAll('div.g-i-tile-i-box')
          console.log(divs);
          divs.forEach(div => {
            let a = div.querySelector('div.g-i-tile-i-title > a')

            let obj = {
              title: a !== null
                ? a.innerText
                : 'NO-LINK',
                link: a.href,

              // code: div.querySelector('div.oneProd-kod') !== null
              //     ? div.querySelector('div.oneProd-kod').innerText
              //     :'NO-CODE', 
              
              price: div.querySelector('span.g-price-uah') !== null
                ? div.querySelector('span.g-price-uah').innerText
                : 'NO-PRICE',
              img:div.querySelector('a.responsive-img > img') !== null
              ? div.querySelector('a.responsive-img > img').getAttribute('src')
              :'NO-IMG'  
            }

            page.push(obj)
          })

        } catch (e) {
          console.log(e);
        }

        return page
      }, {waintUntil: 'a.g-i-more-link'})
         
      
      await res.push(html)
      for(let i=0; i < html.length; i++){
        await page.goto(html[i].link, {waitUntil: 'domcontentloaded'});
  
        await page.waitForSelector('table.chars-t').catch(e => console.log(e));
        await page.waitForSelector('div.text-description-content').catch(e => console.log(e));
        await page.waitForSelector('span.detail-code-i').catch(e => console.log(e));
        // await page.waitForSelector('.oneProd-photos-picture > img ').catch(e => console.log(e));
        console.log(i);
  
        let article = await page.evaluate(async () => {
                  
          let article = null
                  
          try{
            article = document.querySelector('table.table.chars-t').innerText
                      
          }catch(e){
            article = null;
          }
          return article;
        });
        let description = await page.evaluate(async () => {
          let description = null;
          try{
            description = document.querySelector('div.text-description-content').innerText
          }catch(e){
            description = null;
          } 
          return description;
        });
        let code = await page.evaluate(async () => {
          let code = null;
          try{
             code = document.querySelector('span.detail-code-i').innerText
          }catch(e){
             code = null;
          }
          return code;
        });
        // let code = await page.evaluate(async () => {
        //   let code = null;
        //   try{
        //      code = document.querySelector('.oneProd-photos-picture > img').getAttribute('data-path')
        //   }catch(e){
        //      code = null;
        //   }
        //   return code;
        // });
        html[i]['caracteristic'] = article;
        html[i]['description'] = description;
        html[i]['code'] = code;
      }
      


      for (let i in res) {
        if (res[i].length === 0) flag = false
      }
      
      
      // if (counter === 0) flag = false
      // counter++
    }

    await browser.close()

    res = res.flat()

    fs.appendFile('source.json', JSON.stringify({res}), err => {
      if (err) throw err
      console.log('saved source.json');
      console.log('source.json length - ', res.length);
    })


  } catch (e) {
    console.log(e);
    await browser.close()
  }
})();

