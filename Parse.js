import axios from "axios";
import * as cheerio from "cheerio";

const user_agents = [];
user_agents[0] = // fatto da firefox, n
  "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0";
user_agents[1] = // fatto da chrome
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.9999.0 Safari/537.36";
// secondo me chrome contiene safari, firefox e chrome, da ritestare

export default async function Parse(topic) {
  let res = [];
  try {
    const val = await axios.get(
      `https://scholar.google.com/scholar?hl=it&as_sdt=0%2C5&q=${topic}&btnG=`,
      {
        Headers: {
          "user-agent": user_agents[Math.random() * 1],
        },
      }
    );
    const $ = cheerio.load(val.data);
    const $$ = cheerio.load(val.data);
    let x, y;
    let i = 0;
    do {
      x = $("div.gs_or_ggsm:first");
      y = $$("div.gs_ri:first");
      if (x.html() != null && y.html() != null) {
        res[i] = {
          url: x.find("a").attr("href"),
          title: y.find("h3.gs_rt").text(),
          authors: y.find("div.gs_a").text(),
        };
      }
      $("div.gs_ggsd:first").remove();
      $$("div.gs_ri:first").remove();
      i++;
    } while (x.html() != null);
  } catch (err) {}
  return res;
}
