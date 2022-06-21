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
  let val = null;

  // FETCH
  try {
    val = await axios.get(
      pageNumber
        ? `https://scholar.google.com/scholar?start=${pageNumber * 10
        }&q=${topic}&hl=en&as_sdt=0,5`
        : `https://scholar.google.com/scholar?hl=it&as_sdt=0%2C5&q=${topic}&btnG=`,
      {
        Headers: {
          "user-agent": user_agents[Math.random() * 1],
        },
      }
    );

    if (!val.data) console.log("Errori nella richiesta")
  } catch {
    console.log("Errore nella richiesta, riprovare.");
  }


  const $ = cheerio.load(val.data);
  const $$ = cheerio.load(val.data);
  let URL_selector, TITLE_selector;
  let res_index = 0;
  let date = "0";
  do {

    const dateValue = [];

    URL_selector = $("div.gs_or_ggsm:first");
    TITLE_selector = $$("div.gs_ri:first");

    const title_result = TITLE_selector.find("div.gs_a").text().split("-");

    // Gestione prima parte del titolo
    // Si crea un unica stringa con tutti i valori al loro interno
    // Tutti i diversi autori sono divisi da ','
    const pattern = /[A-z ]|‐/g;
    const regx = new RegExp(pattern);
    const matchArray = [...title_result[0].matchAll(regx)]
    let author_str = "";
    matchArray.forEach((e) => {
      author_str += e[0]
    })

    const author_list = author_str.split(" ");

    // Pulisce l'array dagli elementi ''
    for (let index = 0; index < author_list.length; index++) {
      if (author_list[index] === '') author_list.splice(index, 1);
    }

    // Gestione seconda parte del titolo
    date = title_result[1].split(",");

    // Prende la data, controlla che tra i risultati prenda solo quella che è un numero e ritorna come
    // tipo Number
    // infine pusha su dateValue[]
    date.forEach((e) => {
      if (!isNaN(parseInt(e.trim(), 10))) {
        dateValue.push(parseInt(e))
      }
    })

    res[res_index] = {
      url: URL_selector.find("a").attr("href"),
      title: TITLE_selector.find("h3.gs_rt").text(),
      authors: author_list,
      date: [...dateValue],
      index: res_index,
    };
    res_index++;

    $("div.gs_ggsd:first").remove();
    $$("div.gs_ri:first").remove();

  } while (res_index < 10);

  res.sort((a, b) => a.date - b.date);
  // Manca ancora il primo risultato, prende l'ultimo della paginazione precedente non so come
  return { res: res };
}
