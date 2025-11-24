const btn = document.getElementById("btn");

const years = [
  2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012,
  2013, 2014, 2015, 2016, 2017, 2018,
];

// prettier-ignore
const countries = [
  "BE", "BG", "CZ", "DK", "DE", "EE", "IE", "EL", "ES", "FR", "HR", "IT",
  "CY", "LV", "LT", "LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO", "SI",
  "SK", "FI", "SE"
];

const datasets = {
  SV: "demo_mlexpec?sex=T&age=Y1",
  POP: "demo_pjan?sex=T&age=TOTAL",
  PIB: "sdg_08_10?na_item=B1GQ&unit=CLV20_EUR_HAB",
};

const eurostatURL =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/";

const fetchData = async (dataset, country) => {
  let url = `${eurostatURL}${dataset}&geo=${country}`;
  for (const year of years) {
    url += `&time=${year}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  return data;
};

const fetchAll = async () => {
  const tasks = [];

  for (const [indicator, dataset] of Object.entries(datasets)) {
    for (const country of countries) {
      tasks.push(
        fetchData(dataset, country).then((data) => ({
          indicator,
          country,
          data,
        }))
      );
    }
  }

  const responses = await Promise.all(tasks);
  const result = [];

  for (const { indicator, country, data } of responses) {
    const rawValues = data.value;

    for (const [index, value] of Object.entries(rawValues)) {
      const year = 2000 + parseInt(index);

      result.push({
        tara: country,
        an: year,
        indicator: indicator,
        valoare: value,
      });
    }
  }

  return result;
};

btn.addEventListener("click", async () => {
  console.log("Fetching data from Eurostat...");
  const result = await fetchAll();
  console.log(result);
  console.log("All data fetched.");
});
