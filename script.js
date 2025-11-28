const btnFetch = document.getElementById("btn-fetch");

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

// dynamically create select options
const select = document.getElementById("table-select");
for (let i = 2009; i < 2025; i++) {
  if (i === 2023) {
    select.innerHTML += `<option value=${i} selected="selected">${i}</option>`;
  } else select.innerHTML += `<option value=${i}>${i}</option>`;
}

// https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlexpec?sex=T&age=Y1&geo=BE&sinceTimePeriod=2009&untilTimePeriod=2025
const fetchData = async (dataset, country) => {
  // get last 15 years data (2010-2024*)
  // for SV, there is NO data available for 2024 so we must adjust the time period i guess
  let url = "";
  if (dataset === "demo_mlexpec?sex=T&age=Y1") {
    url = `${eurostatURL}${dataset}&geo=${country}&sinceTimePeriod=2009&untilTimePeriod=2025`;
  } else {
    url = `${eurostatURL}${dataset}&geo=${country}&sinceTimePeriod=2010&untilTimePeriod=2025`;
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
      let year = 2010 + parseInt(index);
      if (indicator === "SV") {
        year -= 1;
      }

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

console.log("Fetching data from Eurostat...");
const allData = await fetchAll();
// console.log(allData);
console.log("All data fetched.");

// return filtered data based on params (country, year, indicator)
// if country or indicator = "ALL" then pass and return data for all
// if year = 0 then pass and return data for all
const getData = async (country, year, indicator) => {
  let filteredData = allData;

  if (country !== "ALL" && countries.includes(country)) {
    filteredData = filteredData.filter((obj) => obj.tara === country);
  }

  if (year !== 0) {
    filteredData = filteredData.filter((obj) => obj.an === year);
  }

  if (indicator !== "ALL" && ["SV", "POP", "PIB"].includes(indicator)) {
    filteredData = filteredData.filter((obj) => obj.indicator === indicator);
  }

  return filteredData;
};

// calculam valorile rgb pentru fiecare celula
const getCellColor = (value, min, max, avg) => {
  let r, g, b;

  // daca valoarea este sub medie => mix intre rosu si alb
  // daca valoarea este sub medie => mix intre alb si verde
  if (value <= avg) {
    const ratio = (value - min) / (avg - min || 1);
    r = 255;
    g = Math.round(255 * ratio);
    b = Math.round(255 * ratio);
  } else {
    const ratio = (value - avg) / (max - avg || 1);
    r = Math.round(255 * (1 - ratio));
    g = 255;
    b = Math.round(255 * (1 - ratio));
  }

  return `rgb(${r}, ${g}, ${b})`;
};

// render table data
const addDataToTable = async (year) => {
  const tbody = document.querySelector("#table tbody");

  tbody.innerHTML = "";

  const filteredData = await getData("ALL", year, "ALL");

  // get the min, max, avg for each column
  const stats = {};
  ["PIB", "SV", "POP"].forEach((ind) => {
    const values = filteredData
      .filter((obj) => obj.indicator === ind)
      .map((obj) => obj.valoare);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;

    stats[ind] = { min, max, avg };
  });

  for (const country of countries) {
    const newRow = document.createElement("tr");

    const tara = document.createElement("td");
    tara.textContent = country;
    newRow.appendChild(tara);

    for (const ind of ["PIB", "SV", "POP"]) {
      const object = filteredData.find(
        (obj) => obj.tara === country && obj.indicator === ind
      );
      const td = document.createElement("td");
      td.textContent = object ? object.valoare : "N/A";

      if (object && stats[ind]) {
        const { min, max, avg } = stats[ind];
        td.style.backgroundColor = getCellColor(object.valoare, min, max, avg);
      }

      newRow.appendChild(td);
    }

    tbody.appendChild(newRow);
  }
};

addDataToTable(parseInt(select.value));

btnFetch.addEventListener("click", async () => {
  const result = await getData("RO", 0, "SV");
  console.log(result);
});

select.addEventListener("change", (e) => {
  addDataToTable(parseInt(e.target.value));
});
