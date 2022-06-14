import axios from "axios";
import * as cheerio from "cheerio";

const Parse = async (topic) => {
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
  let x;
  let y;
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
        let appo = x.find("a").attr("href");
        console.log(appo);
        let temp1 = y.find("h3.gs_rt").text();
        console.log(temp1);
        let temp2 = y.find("div.gs_a").text();
        console.log(temp2+ "\n");
      }
    }
  } while (x.html() != null);
};
Parse("ciao");
// export default Parse