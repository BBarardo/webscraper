const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const { exit } = require('process');

const films = [
  'A New Hope',
  'The Empire Strikes Back',
  'Return of the Jedi',
  'The Phantom Menace',
  'Attack of the Clones',
  'Revenge of the Sith',
];

const URL = 'https://starwars.fandom.com/wiki/Special:Search';

const scrapeImages = async name => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
  });
  const page = await browser.newPage();

  await page.goto(URL);

  await page.screenshot({ path: 'images/1.png' });
  await page.waitFor(1300);
  await page.screenshot({ path: 'images/10.png' });

  try {
    await page.click(
      'div[class="NN0_TB_DIsNmMHgJWgT7U XHcr6qf5Sub2F2zBJ53S_"]'
    );
    await page.screenshot({ path: 'images/2.png' });
  } catch (error) {
    // console.log('first: ', error);
  }

  await page.type('[name="query"]', name);
  await page.screenshot({ path: 'images/3.png' });

  await page.keyboard.press('Enter');
  await page.screenshot({ path: 'images/4.png' });

  await page.waitForSelector('ul.unified-search__results');
  await page.screenshot({ path: 'images/5.png' });

  await page.click('a.unified-search__result__title');
  await page.screenshot({ path: 'images/6.png' });
  await page.waitFor(2000);

  await page.waitForSelector('img.pi-image-thumbnail');
  await page.click('img.pi-image-thumbnail');
  await page.screenshot({ path: 'images/7.png' });

  await page.waitFor(2000);

  await page.screenshot({ path: 'images/8.png' });
  // const data = await page.evaluate(() => document.querySelector('*').outerHTML);

  // console.log(data);

  // const imgs = await page.$$eval('img[src]', imgs =>
  //   imgs.map(img => img.getAttribute('src'))
  // );

  const imgs = await page.$$eval('div.media > img[src]', imgs =>
    imgs.map(img => img.getAttribute('src'))
  );
  console.log(imgs);

  await page.goto(imgs[0]);
  await page.screenshot({ path: 'images/9.png' });

  download(imgs[0], `downloads4/films/${name.replace('/', '_')}.png`);
  await page.close();
};

const download = (url, destination) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https
      .get(url, response => {
        response.pipe(file);

        file.on('finish', () => {
          file.close(resolve(true));
        });
      })
      .on('error', error => {
        fs.unlink(destination);

        reject(error.message);
      });
  });

const start = async () => {
  for (let i = 0; i < films.length; i++) {
    console.log('Getting:', films[i]);
    await scrapeImages(films[i]);
  }
  console.log('finnish');
};

start();
