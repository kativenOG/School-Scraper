import axios from "axios";
import * as cheerio from "cheerio";

const user_agents = [];
user_agents[0] = // fatto da firefox, n
  "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0";
user_agents[1] = // fatto da chrome
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.9999.0 Safari/537.36";
// secondo me chrome contiene safari, firefox e chrome, da ritestare

export default async function Parse(topic, { pageNumber, blockedUser }) {
  pageNumber = pageNumber ?? 1;
  pageNumber--;
  blockedUser = blockedUser ?? "None";
  let res = [];
  try {
    const val = await axios.get(
      pageNumber
        ? `https://scholar.google.com/scholar?start=${
            pageNumber * 10
          }&q=${topic}&hl=en&as_sdt=0,5`
        : `https://scholar.google.com/scholar?hl=it&as_sdt=0%2C5&q=${topic}&btnG=`,
      {
        Headers: {
          "user-agent": user_agents[Math.random() * 1],
        },
      }
    );
    const $ = cheerio.load(val.data);
    const $$ = cheerio.load(val.data);
    let x, y;
    let i = 0,
      j = 0;
    let date = "0";
    do {
      x = $("div.gs_or_ggsm:first");
      y = $$("div.gs_ri:first");
      const appo = y.find("div.gs_a").text().split("-"); // togli
      date = appo[1].split(",");
      if (date[0].includes("1") || date[0].includes("2")) date = date.pop();
      else date.shift();
      const list = appo[0].split(" ");
      i = 0;
      do { // non entra proprio lolz
        if (list[i].includes("...,")) {
          let z = list[i].split("...");
          if (z[0].includes(",") ) {
            list[i] = z[1];
          } else {
            list[i] = z[0];
          }
        }else if (list[i].includes("...")){
          if(z[0]=="") list[i]=z[1]; 
          else list[i]=z[1];
        }
        i++;
      } while (i < list.length);
      res[j] = {
        url: x.find("a").attr("href"),
        title: y.find("h3.gs_rt").text(),
        authors: list,
        date: date[0],
        index: j,
      };
      j++;
      $("div.gs_ggsd:first").remove();
      $$("div.gs_ri:first").remove();
    } while (j < 10);
  } catch (err) {
    // Per ora non ha senso perchè non sto facendo
    // una chiamata asincrona di cheerio che mi dice
    // se torno effettivamente un valore,
    // fai una funzione che wrappa cheerio in una promise
  }
  res.sort((a, b) => a.date - b.date);
  // Manca ancora il primo risultato, prende l'ultimo della paginazione precedente non so come
  return { res: res };
}
