//Packages
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const url =
  "https://www.amazon.com/2021-Apple-24-inch-8%E2%80%91core-256GB/dp/B09LPTWSLW/ref=sr_1_2?keywords=2021+apple+imac+24-inch%2C+apple+m1+chip+8+core&qid=1664908720&qu=eyJxc2MiOiIyLjEzIiwicXNhIjoiMi4xOCIsInFzcCI6IjIuMDQifQ%3D%3D&sprefix=2021+apple+iMac%2Caps%2C432&sr=8-2";

const product = { name: "", price: "", link: "" };

const handle = setInterval(scrape, 20000);

async function scrape() {
  //Fetch the data
  const { data } = await axios.get(url);
  //Load up the html
  const $ = cheerio.load(data);
  const item = $("div#dp-container");
  //Extract the data that we need
  product.name = $(item).find("h1 span#productTitle").text();
  product.link = url;
  const price = $(item)
    .find("span .a-offscreen")
    .first()
    .text()
    .replace(/[$,]/g, "")
    .split(".")[0];

  const priceNum = parseInt(price);
  product.price = priceNum;
  console.log(product);

  //Send an SMS
  if (priceNum < 1600) {
    client.messages
      .create({
        body: `The price of ${product.name} went below ${price}. Purchase it at ${product.link}`,
        from: "+19894736929",
        to: "+543400666416",
      })
      .then((message) => {
        console.log(message);
        clearInterval(handle);
      });
  }
}

scrape();
