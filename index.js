
  const puppeteer = require('puppeteer');
  const  fs = require('fs');

// let link = 'https://www.dns-shop.ru/catalog/17a9c6ec16404e77/shurupoverty/?p=';

//


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
      await page.goto(`https://darwin.md/ru/gadgets/power-bank?page=${counter}`)
      // await page.waitForSelector('a.ty-pagination__right-arrow')
      console.log(counter);

      let html = await page.evaluate(async () => {
        let page = []

        try {

          let divs = await document.querySelectorAll('figure.card.card-product.border-0 ')

          divs.forEach(div => {
            let a = div.querySelector('h3.title > a')

            let obj = {
              title: a !== null
                ? a.innerText
                : 'NO-LINK',
              // code: div.querySelector('span.ty-control-group__item') !== null
              //     ? div.querySelector('span.ty-control-group__item').innerText
              //     :'NO-CODE', 
              link: a.href,
              price: div.querySelector('span.price-new') !== null
                ? div.querySelector('span.price-new').innerText
                : 'NO-PRICE',
              img:div.querySelector('.card-image') !== null
              ? div.querySelector('.card-image').getAttribute('data-img')
              :'NO-IMG'  
            }

            page.push(obj)
          })

        } catch (e) {
          console.log(e);
        }

        return page
      }, {
        // waintUntil: 'a.ty-pagination__right-arrow'
      })
      await res.push(html)
      for(let i=0; i < html.length; i++){
        await page.goto(html[i].link, {waitUntil: 'domcontentloaded'});
        // await page.waitForSelector('.article-id > strong').catch(e => console.log(e));
        await page.waitForSelector('ul.features.mt-1').catch(e => console.log(e));
        await page.waitForSelector('table.table.table-striped').catch(e => console.log(e));
        console.log(i);
        // let id = await page.evaluate(async () => {
                  
        //   let id = null
                  
        //   try{
        //     id = document.querySelector('.article-id > strong').innerText
                      
        //   }catch(e){
        //     id = null;
        //   }
        //   return id;
        // });
        let article = await page.evaluate(async () => {
                  
          let article = null
                  
          try{
            article = document.querySelector('ul.features.mt-1').innerText
                      
          }catch(e){
            article = null;
          }
          return article;
        });
        let description = await page.evaluate(async () => {
          let description = null;
          try{
            description = document.querySelector('table.table.table-striped').innerText
          }catch(e){
            description = null;
          } 
          return description;
        });
        let keywords = await page.evaluate(async () => {
                  
          let keywords = null
                  
          try{
            keywords = document.querySelector('meta[name="keywords"]').getAttribute('content')
                      
          }catch(e){
            keywords = null;
          }
          return keywords;
        });
        let metaDescription = await page.evaluate(async () => {
                  
          let metaDescription = null
                  
          try{
            metaDescription = document.querySelector('meta[name="description"]').getAttribute('content')
                      
          }catch(e){
            metaDescription = null;
          }
          return metaDescription;
        });
        
        // html[i]['id'] = id;
        html[i]['caracteristic'] = article;
        html[i]['description'] = description; 
        html[i]['keywords'] = keywords;
        html[i]['metaDescription'] = metaDescription;
      }
      


      for (let i in res) {
        if (res[i].length === 0) flag = false
      }

      

      counter++
    }

    await browser.close()

    res = res.flat()

    fs.appendFile('power-bank-ru.json', JSON.stringify({res}), err => {
      if (err) throw err
      console.log('saved power-bank-ru.json');
      console.log('power-bank-ru.json length - ', res.length);
    })


  } catch (e) {
    console.log(e);
    await browser.close()
  }
})();

