import puppeteer from 'puppeteer';
import logger from "./modules/logger.js";
import styles from './helpoers/colors.js';
import fs from 'fs';




const url = 'https://www.diffordsguide.com/cocktails/search?include%5Bdg%5D=1&gentle_to_boozy%5B%5D=0&gentle_to_boozy%5B%5D=10&sweet_to_sour%5B%5D=0&sweet_to_sour%5B%5D=10&calories%5B%5D=0&calories%5B%5D=9';


/**
 * 
 * @param {*} keys An array of keys components
 * @param {*} values Array of values (OZ)
 * @returns Reuturns coctail object
 */

function concatKeysWithValues(keys, values) {
    let coctail = {};

    keys.forEach((key, index) => {
        coctail = { ...coctail, [values[index]]: key };
    })
    return coctail;
}

// COCKTAIL NAME AND METHOD SELECTOR
let name = '.strip__heading';
// let method = '';

// Launch the browser and open a new blank page
const browser = await puppeteer.launch();
const page = await browser.newPage();
page.setDefaultNavigationTimeout(0);
// Navigate the page to a URL
await page.goto(url);

// Set screen size
await page.setViewport({ width: 1080, height: 1024 });

const hrefs = await page.$$eval('a', as => as.map(a => a.href));
let cocktailIDs = [];
hrefs.forEach((el) => {
    if (el.includes('/cocktails/recipe/')) {
        const str = el.split('pe/')[1].split('/')[0];
        cocktailIDs.push(str);
    }
});

let cocktails = [];


class Parser {
    page = null;
    browser = null;
    viewPort = null;
    coctailIds = [];
    // Base url yoy need to substitute offset value INT
    URL = `https://diffordsguide.com/cocktails/search?include%5Bdg%5D=1&limit=24&sort=rating&offset=`

    maxOffset = 5885;

    writeFile(text, url) {

        fs.appendFileSync(url, text, function (err) {
            if (err) {
                return console.log(err);
            }

        });

    };


    async getCoctailIds() {
        let arrows = ">";
        for (let i = 0; i < this.maxOffset; i += 24) {
            await page.goto(this.URL + i);
            const hrefs = await page.$$eval('a', as => as.map(a => a.href));
            hrefs.forEach((link) => {
                if (link.includes('/cocktails/recipe/')) {
                    const str = link.split('pe/')[1].split('/')[0];
                    this.coctailIds.push(str);
                    this.writeFile(str + '\n', "./output/IDs.txt");
                }
            });

            // Print console output
            let loader = `\t[${Math.trunc(100 / this.maxOffset * i)}%] : `;
            const separator = '-------------------------------------------------------';
            console.clear();
            console.log("\n\t \x1b[35m-------------------------------------------------------\x1b[0m\n");
            console.log("\tGrab yourself some coffee, it'll take a while\tc\\_/");
            console.log("\n\t \x1b[35m-------------------------------------------------------\x1b[0m");

            console.log(`\tGET COCTAIL ID's :\n\tEllement : ${i} of ${this.maxOffset}\t[DONE]\n`);
            console.log(`\tFetch : www.diffordsguide.com/`);
            console.log(loader + `\x1b[36m${arrows}\x1b[0m`);
            console.log("\n\t \x1b[35m-------------------------------------------------------\x1b[0m");

            // Increment the loader
            arrows = new Array(Math.trunc(((separator.length - 5) / this.maxOffset * i))).fill('>').join("");
        };
    };
};


const parser = new Parser();

await parser.getCoctailIds();



console.log(parser.coctailIds);






async function parseCoctail() {
    let arrows = ">";

    for (let i = 0; i < cocktailIDs.length; i++) {


        let loader = `\t[${Math.trunc(100 / cocktailIDs.length * i)}%] : `;
        let keys = [];
        let values = [];
        const separator = '-------------------------------------------------------';
        console.clear();

        console.log("\n\t \x1b[35m-------------------------------------------------------\x1b[0m\n")
        console.log("\tGrab yourself some coffee, it'll take a while\tc\\_/");
        console.log("\n\t \x1b[35m-------------------------------------------------------\x1b[0m")

        console.log(`\tPARSE DATA :\n\tEllement : ${i} of ${cocktailIDs.length}\t[DONE]\n`);
        console.log(`\tFetch : www.diffordsguide.com/`)
        console.log(loader + `\x1b[36m${arrows}\x1b[0m`);
        console.log("\n\t \x1b[35m-------------------------------------------------------\x1b[0m")

        arrows = arrows + new Array(Math.trunc(((separator.length - 5) / cocktailIDs.length))).fill('>').join("");


        await page.goto(`https://www.diffordsguide.com/cocktails/recipe/${cocktailIDs[i]}/`);

        const table = await page.$$eval('.td-align-top', as => as.map(el => el.innerText));
        const header = await page.$$eval(name, (el) => el.map(el => el.innerText));
        const method = await page.$$eval('div > .cell p', as => as.map(el => el.innerText));

        table.forEach((el, index) => {

            if (index % 2 === 0) {
                keys.push(el);
            }
            else {
                values.push(el);
            }
        });
        cocktails.push(
            {
                name: header[0],
                method: method[2],
                garnish: method[1],
                glass: method[0],
                ingridients: { ...concatKeysWithValues(keys, values) }

            });

    }

}

// await parseCoctail();

logger.printSeparator(styles.FgMagenta);

console.log("\tDONE : \n");
logger.printSeparator(styles.FgMagenta);

console.log(cocktails);

// logger.printProgressBar(20);


await browser.close();
