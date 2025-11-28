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
// const allData = await fetchAll();
// console.log(allData);
console.log("All data fetched.");

// return filtered data based on params (country, year, indicator)
// if country or indicator = "ALL" then pass and return data for all
// if year = 0 then pass and return data for all
const getData = async (country, year, indicator) => {
  let filteredData = allData;
  console.log("Filtering data...");

  if (country !== "ALL" && countries.includes(country)) {
    filteredData = filteredData.filter((obj) => obj.tara === country);
    console.log("Filtered data for country...");
  }

  if (year !== 0) {
    filteredData = filteredData.filter((obj) => obj.an === year);
    console.log("Filtered data for year...");
  }

  if (indicator !== "ALL" && ["SV", "POP", "PIB"].includes(indicator)) {
    filteredData = filteredData.filter((obj) => obj.indicator === indicator);
    console.log("Filtered data for indicator...");
  }
  console.log("Finished filtering data.");

  return filteredData;
};

// dynamically create select options
const select = document.getElementById("table-select");
for (let i = 2009; i < 2025; i++) {
  if (i === 2023) {
    select.innerHTML += `<option value=${i} selected="selected">${i}</option>`;
  } else select.innerHTML += `<option value=${i}>${i}</option>`;
}

// render table data
const addDataToTable = async () => {
  const table = document.getElementById("table");
};

btnFetch.addEventListener("click", async () => {
  const result = await getData("RO", 0, "SV");
  console.log(result);
});
