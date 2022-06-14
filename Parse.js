import axios from "axios";
import * as cheerio from "cheerio";

export default async function Parse(topic){
  let res = [];
  const val = await axios.get(
    `https://scholar.google.com/scholar?hl=it&as_sdt=0%2C5&q=${topic}&btnG=`,
    {
      Headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.9999.0 Safari/537.36",
      },
    }
  );
  const $ = cheerio.load(val.data);
  const $$ = cheerio.load(val.data);
  let x,y;
  let appo,temp1,temp2;
  let i=0;
  do {
    x = $("div.gs_or_ggsm:first");
    y = $$("div.gs_ri:first");
    $("div.gs_ggsd:first").remove();
    $$("div.gs_ri:first").remove();
    if (x.html() != null && y.html() != null) {
      if (
        !x.text().includes("Full View") ||
        !x.text().includes("ACNP Full Text")
      ) {
        appo = x.find("a").attr("href");
        temp1 = y.find("h3.gs_rt").text();
        temp2 = y.find("div.gs_a").text();
        res[i] = {"url": appo,"title":temp1,"authors":temp2 };
      }
    }
    i++;
  } while (x.html() != null);
  return res;
};
