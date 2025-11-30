// ==================================== BEGIN INIT ====================================

let allData = [];

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

// ==================================== END INIT ====================================

// ==================================== BEGIN RENDER UI ====================================

const barCountrySelect = document.getElementById("bar-country-select");
countries.forEach((country) => {
  if (country === "RO") {
    barCountrySelect.innerHTML += `<option value=${country} selected="selected">${country}</option>`;
  } else
    barCountrySelect.innerHTML += `<option value=${country}>${country}</option>`;
});

const barIndSelect = document.getElementById("bar-ind-select");
["PIB", "SV", "POP"].forEach((ind) => {
  if (ind === "PIB") {
    barIndSelect.innerHTML += `<option value=${ind} selected="selected">${ind}</option>`;
  } else barIndSelect.innerHTML += `<option value=${ind}>${ind}</option>`;
});

const tableSelect = document.getElementById("table-select");
for (let year = 2009; year < 2025; year++) {
  if (year === 2023) {
    tableSelect.innerHTML += `<option value=${year} selected="selected">${year}</option>`;
  } else tableSelect.innerHTML += `<option value=${year}>${year}</option>`;
}

// ==================================== END RENDER UI ====================================

// ==================================== BEGIN BAR CHART CLASS ====================================

export class BarChart {
  #svgns = "http://www.w3.org/2000/svg";
  #svg;
  #tooltip;

  constructor(domElement) {
    this.#createSVG();
    domElement.appendChild(this.#svg);
    this.#createTooltip(domElement);
  }

  draw(data) {
    this.#svg.replaceChildren();

    const width = this.#svg.clientWidth;
    const height = this.#svg.clientHeight;

    const padding = 70;

    const actualWidth = width - padding * 2;
    const actualHeight = height - padding * 2;

    const barSlotWidth = actualWidth / data.length;
    const maxValue = Math.max(...data.map((d) => d[1]));
    const scale = actualHeight / maxValue;

    // X AXIS
    const xAxis = document.createElementNS(this.#svgns, "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    this.#svg.appendChild(xAxis);

    // Y AXIS
    const yAxis = document.createElementNS(this.#svgns, "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    this.#svg.appendChild(yAxis);

    // ticks and labels (y axis)
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const value = (maxValue / tickCount) * i;
      const y = height - padding - value * scale;

      const tick = document.createElementNS(this.#svgns, "line");
      tick.setAttribute("x1", padding - 5);
      tick.setAttribute("y1", y);
      tick.setAttribute("x2", padding);
      tick.setAttribute("y2", y);
      this.#svg.appendChild(tick);

      const label = document.createElementNS(this.#svgns, "text");
      label.textContent = Math.round(value);
      label.setAttribute("x", padding - 10);
      label.setAttribute("y", y + 4);
      label.setAttribute("text-anchor", "end");
      label.classList.add("label-text");
      this.#svg.appendChild(label);
    }

    // bars
    for (let i = 0; i < data.length; i++) {
      const label = data[i][0];
      const value = data[i][1];

      // valoare -> px
      const barHeight = value * scale;

      const actualBarWidth = barSlotWidth * 0.5;

      // flip
      const x =
        padding + i * barSlotWidth + (barSlotWidth - actualBarWidth) / 2;
      const y = height - padding - barHeight;

      const bar = document.createElementNS(this.#svgns, "rect");
      bar.classList.add("bar");

      bar.setAttribute("x", x);
      bar.setAttribute("y", y);
      bar.setAttribute("width", actualBarWidth);
      bar.setAttribute("height", barHeight);

      // tooltip
      bar.addEventListener("mousemove", (e) => {
        this.#tooltip.style.display = "block";
        this.#tooltip.textContent = `${label}: ${value}`;
        this.#tooltip.style.left = e.clientX + 10 + "px";
        this.#tooltip.style.top = e.clientY + 10 + "px";
      });

      bar.addEventListener("mouseleave", () => {
        this.#tooltip.style.display = "none";
      });

      this.#svg.appendChild(bar);

      // labels - x axis
      const text = document.createElementNS(this.#svgns, "text");
      text.textContent = label;
      text.setAttribute("x", x + actualBarWidth / 2);
      text.setAttribute("y", height - padding + 20);
      text.setAttribute("text-anchor", "middle");
      text.style.fontSize = "12px";
      this.#svg.appendChild(text);
    }
  }

  #createSVG() {
    this.#svg = document.createElementNS(this.#svgns, "svg");
    this.#svg.style.backgroundColor = "var(--tinted-white)";
    this.#svg.setAttribute("width", "100%");
    this.#svg.setAttribute("height", "100%");
  }

  #createTooltip(container) {
    this.#tooltip = document.createElement("div");
    this.#tooltip.classList.add("tooltip");

    container.appendChild(this.#tooltip);
  }
}

// ==================================== END BAR CHART CLASS ====================================

// ==================================== BEGIN BAR CHART APP ====================================

const barChart = new BarChart(document.getElementById("bar-chart"));

const updateBarChart = async (country, indicator) => {
  const jsonBarData = await getData(country, 0, indicator);
  const barData = jsonBarData.map((obj) => [obj.an.toString(), obj.valoare]);
  barChart.draw(barData);

  const barTitle = document.getElementById("bar-chart-title");
  barTitle.textContent = `Evolutia ${indicator} in ${country}, ${
    barData[0][0]
  }-${barData[barData.length - 1][0]}`;
};

// ==================================== END BAR CHART APP ====================================

// ==================================== BEGIN TOAST ====================================

const toast = document.getElementById("loading-toast");
const toastText = document.getElementById("toast-text");

const showToast = () => {
  toastText.textContent = "Getting data from Eurostat...";
  toast.classList.remove("success");
  toast.classList.add("visible");
};

const updateToastSuccess = () => {
  toastText.textContent = "Data loaded successfully!";
  toast.classList.add("success");
};

const hideToast = () => {
  toast.classList.remove("visible");
};

// ==================================== END TOAST ====================================

// ==================================== BEGIN DATA HANDLING ====================================

const fetchData = async (dataset, country) => {
  // get last 15 years data (2010-2024*)
  // for SV, there is NO data available for 2024 so we must adjust the time period i guess
  let url = "";
  if (dataset === "demo_mlexpec?sex=T&age=Y1") {
    url = `${eurostatURL}${dataset}&geo=${country}&sinceTimePeriod=2009&untilTimePeriod=2025`;
  } else {
    url = `${eurostatURL}${dataset}&geo=${country}&sinceTimePeriod=2010&untilTimePeriod=2025`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching from ${url}: ${err}`);
  }
};

const fetchAll = async () => {
  showToast();

  const tasks = [];
  try {
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
  } catch (err) {
    console.error("Error fetching data: ", err);
  }

  const responses = await Promise.all(tasks);
  updateToastSuccess();

  setTimeout(() => {
    hideToast();
  }, 2000);

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

// ==================================== END DATA HANDLING ====================================

// ==================================== BEGIN TABLE ====================================

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

// ==================================== END TABLE ====================================

// ==================================== BEGIN EVENT LISTENERS ====================================

window.addEventListener("DOMContentLoaded", async () => {
  allData = await fetchAll();
  updateBarChart(barCountrySelect.value, barIndSelect.value);
  addDataToTable(parseInt(tableSelect.value));
});

window.addEventListener("resize", () => {
  updateBarChart(barCountrySelect.value, barIndSelect.value);
});

tableSelect.addEventListener("change", (e) => {
  addDataToTable(parseInt(e.target.value));
});

barCountrySelect.addEventListener("change", (e) => {
  updateBarChart(barCountrySelect.value, barIndSelect.value);
});

barIndSelect.addEventListener("change", (e) => {
  updateBarChart(barCountrySelect.value, barIndSelect.value);
});

// ==================================== END EVENT LISTENERS ====================================
