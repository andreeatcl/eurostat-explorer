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

const btnImport = document.getElementById("btn-import");
const btnPlay = document.getElementById("btn-play");
const bubbleYear = document.getElementById("bubble-chart-year");

/**
 * functie ajutatoare pentru animatia bubble chart-ului
 * @param {number} amount - cu cat intarziem programul (in ms)
 * @returns
 */
const delay = async (amount) => {
  return new Promise((res) => setTimeout(res, amount));
};

// ==================================== END INIT ====================================

// ==================================== BEGIN RENDER UI ====================================

/**
 * RENDER (static) UI
 * functii pentru popularea select-urilor cu optiuni
 */

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

/**
 * clasa pentru randarea unui bar chart in SVG
 */
class BarChart {
  #svgns = "http://www.w3.org/2000/svg";
  #svg;
  #tooltip;

  /**
   * initializare grafic: creeaza SVG + tooltip
   * @param {HTMLElement} domElement - containerul in care punem graficul
   */
  constructor(domElement) {
    this.#createSVG();
    domElement.appendChild(this.#svg);
    this.#createTooltip(domElement);
  }

  /**
   * @param {Array<[string, number]>} data - perechi de tip (label X, valoare Y)
   */
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

    /**
     * adauga X axis
     */
    const xAxis = document.createElementNS(this.#svgns, "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    this.#svg.appendChild(xAxis);

    /**
     * adauga Y axis
     */
    const yAxis = document.createElementNS(this.#svgns, "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    this.#svg.appendChild(yAxis);

    /**
     * adauga labels + ticks pe axa Y
     */
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

    /**
     * deseneaza barele
     */
    for (let i = 0; i < data.length; i++) {
      const label = data[i][0];
      const value = data[i][1];

      const barHeight = value * scale;

      const actualBarWidth = barSlotWidth * 0.5;

      /**
       * flip
       */
      const x =
        padding + i * barSlotWidth + (barSlotWidth - actualBarWidth) / 2;
      const y = height - padding - barHeight;

      const bar = document.createElementNS(this.#svgns, "rect");
      bar.classList.add("bar");

      bar.setAttribute("x", x);
      bar.setAttribute("y", y);
      bar.setAttribute("width", actualBarWidth);
      bar.setAttribute("height", barHeight);

      /**
       * tooltip care afiseaza valori on hover
       */
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

      /**
       * labels pentru bare
       */
      const text = document.createElementNS(this.#svgns, "text");
      text.textContent = label;
      text.setAttribute("x", x + actualBarWidth / 2);
      text.setAttribute("y", height - padding + 20);
      text.setAttribute("text-anchor", "middle");
      text.style.fontSize = "12px";
      this.#svg.appendChild(text);
    }
  }

  /**
   * creeaza elementul svg
   */
  #createSVG() {
    this.#svg = document.createElementNS(this.#svgns, "svg");
    this.#svg.style.backgroundColor = "var(--tinted-white)";
    this.#svg.setAttribute("width", "100%");
    this.#svg.setAttribute("height", "100%");
  }

  /**
   * creeaza elementul tooltip
   * @param {HTMLElement} container - containerul parinte
   */
  #createTooltip(container) {
    this.#tooltip = document.createElement("div");
    this.#tooltip.classList.add("tooltip");

    container.appendChild(this.#tooltip);
  }
}

// ==================================== END BAR CHART CLASS ====================================

// ==================================== BEGIN BAR CHART APP ====================================

const barChart = new BarChart(document.getElementById("bar-chart"));

/**
 * actualizeaza bar chart
 * @param {string} country - tara ("RO")
 * @param {"PIB"|"SV"|"POP"} indicator - tipul indicatorului
 */
const updateBarChart = async (country, indicator) => {
  const jsonBarData = getData(country, 0, indicator);
  const barData = jsonBarData.map((obj) => [obj.an.toString(), obj.valoare]);
  barChart.draw(barData);

  const barTitle = document.getElementById("bar-chart-title");
  barTitle.textContent = `Evolutia ${indicator} in ${country}, ${
    barData[0][0]
  }-${barData[barData.length - 1][0]}`;
};

// ==================================== END BAR CHART APP ====================================

// ==================================== BEGIN BUBBLE CHART CLASS ====================================

/**
 * clasa pentru randarea unui bubble chart in canvas
 */
class BubbleChart {
  #canvas;

  /**
   * initializeaza (referinta la) canvas
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.#canvas = canvas;
  }

  /**
   * deseneaza bubble chart
   * @param {Array<[string, number, number, number]>} data - [label, xVal, yVal, rVal]
   * label - tara ("RO")
   * xVal - speranta de viata
   * yVal - PIB per capita
   * rVal - (radius/raza) - populatie
   */
  draw(data) {
    const ctx = this.#canvas.getContext("2d");
    const width = this.#canvas.width;
    const height = this.#canvas.height;

    const padding = 60;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8faff";
    ctx.fillRect(0, 0, width, height);

    const graphW = width - padding * 2;
    const graphH = Math.min(height - padding * 2, graphW * 0.6);

    const topOffset = (height - graphH) / 2;

    const xVals = data.map((d) => d[1]);
    const yVals = data.map((d) => d[2]);
    const rVals = data.map((d) => d[3]);

    const maxX = Math.max(...xVals);
    const minX = Math.min(...xVals);
    const maxY = Math.max(...yVals);
    const maxR = Math.max(...rVals);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    /**
     * axa Y
     */
    ctx.beginPath();
    ctx.moveTo(padding, topOffset);
    ctx.lineTo(padding, topOffset + graphH);
    ctx.stroke();

    /**
     * axa X
     */
    ctx.beginPath();
    ctx.moveTo(padding, topOffset + graphH);
    ctx.lineTo(padding + graphW, topOffset + graphH);
    ctx.stroke();

    ctx.font = "13px Arial";
    ctx.fillStyle = "#000";

    /**
     * labels & ticks pentru axa Y
     */
    for (let i = 0; i <= 8; i++) {
      const yVal = Math.round((maxY / 8) * i);
      const y = topOffset + graphH - (i * graphH) / 8;

      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.stroke();

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(yVal, padding - 10, y);
    }

    /**
     * labels & ticks pentru axa X
     */
    for (let i = 0; i <= 5; i++) {
      const xVal = Math.round(minX + ((maxX - minX) / 5) * i);
      const x = padding + (i * graphW) / 5;

      ctx.beginPath();
      ctx.moveTo(x, topOffset + graphH);
      ctx.lineTo(x, topOffset + graphH + 5);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(xVal, x, topOffset + graphH + 8);
    }

    /**
     *  functia care deseneaza bubbles
     */
    for (const [label, xVal, yVal, rVal] of data) {
      const px = padding + ((xVal - minX) / (maxX - minX)) * graphW;
      const py = topOffset + graphH - (yVal / maxY) * graphH;

      const pr = (rVal / maxR) * 40;

      // bubble
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(100, 149, 237, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "#3b4e80";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // bubble labels
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      /**
       * bubble prea mic? => label se va afisa deasupra bulei
       * altfel, label in centru
       */
      if (pr >= 10) {
        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText(label, px, py);
      } else {
        ctx.fillStyle = "#000";
        ctx.font = "13px Arial";
        ctx.textBaseline = "bottom";
        ctx.fillText(label, px, py - pr - 2);
      }
    }
  }
}

// ==================================== END BUBBLE CHART CLASS ====================================

// ==================================== BEGIN BUBBLE CHART APP ====================================

/**
 * grupam datele pentru bubble chart in functie de tara
 * @param {Array<{tara:string, indicator:string, valoare:number}>} arrayData - date pt anul selectat
 * @returns {Array<[string, number, number, number]>} - [tara, SV, PIB, POP] - adica [label, xVal, yVal, rVal]
 */
const getBubbleData = (arrayData) => {
  const groupedData = new Map();

  for (const item of arrayData) {
    const key = item.tara;
    const indicator = item.indicator;
    const valoare = item.valoare;

    if (!groupedData.has(key)) {
      groupedData.set(key, {
        tara: key,
        sv: null,
        pib: null,
        pop: null,
      });
    }

    const group = groupedData.get(key);

    if (indicator === "SV") {
      group.sv = valoare;
    } else if (indicator === "PIB") {
      group.pib = valoare;
    } else if (indicator === "POP") {
      group.pop = valoare;
    }
    groupedData.set(key, group);
  }

  /**
   * remove Malta 2012 object
   */
  const output = Array.from(groupedData.values())
    .filter((group) => {
      if (group.tara === "MT" && group.sv === null) {
        return false;
      }
      return true;
    })
    .map((group) => {
      return [group.tara, group.sv, group.pib, group.pop];
    });
  return output;
};

/**
 * actualizeaza bar chart
 * @param {number} year - anul pt care trebuie sa afisam
 * fata de bar chart (care se actualizeaza cand avem window resize), bubble chart se actualizeaza pt animatie
 */
const updateBubbleChart = (year) => {
  const arrayData = getData("ALL", year, "ALL");
  const actualBubbleData = getBubbleData(arrayData);
  bubbleYear.textContent = `Date pentru: ${year}`;

  const canvas = document.getElementById("bubble-chart");
  const bubbleChart = new BubbleChart(canvas);
  bubbleChart.draw(actualBubbleData);
};

// ==================================== END BUBBLE CHART APP ====================================

// ==================================== BEGIN TOAST ====================================

/**
 * TOAST
 * afisarea unui mesaj menit sa semnaleze apelarea api-ului eurostat, respectiv succesul apelului
 */

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

/**
 * preluarea datelor din baza de date Eurostat in functie de dataset + tara
 * @param {string} dataset - cod dataset (informatii in cerinta proiectului)
 * @param {string} country - cod tara
 * @returns {Promise<any>} - raspunsul JSON
 * NOTA: NU exista date pentru speranta de viata din anul 2024 la momentul realizarii proiectului.
 * (cont.) asadar, pentru a respecta cerinta, am ales sa modific perioada la 2009-2023 pentru SV
 * CONSECINTE: bar chart modificat pentru SV (2009-2023)
 * CONSECINTE: bubble chart afiseaza doar datele din perioada 2010-2023
 * CONSECINTE: tabelul are 2 coloane fara date pentru anul 2009, respectiv 1 coloana pentru 2024
 */
const fetchData = async (dataset, country) => {
  let url = "";
  if (dataset === "demo_mlexpec?sex=T&age=Y1") {
    url = `${eurostatURL}${dataset}&geo=${country}&sinceTimePeriod=2009&untilTimePeriod=2023`;
  } else {
    url = `${eurostatURL}${dataset}&geo=${country}&sinceTimePeriod=2010&untilTimePeriod=2024`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching from ${url}: ${err}`);
  }
};

/**
 * verifica daca sunt stocate date in localStorage
 * reincarca datele daca lipsesc sau sunt mai vechi de 24h
 * @returns {Promise<Array<{tara:string, an:number, indicator:string, valoare:number}>>}
 */
const checkLocalStorage = async () => {
  const data = JSON.parse(localStorage.getItem("EUROSTAT_DATA"));
  const lastUpdated = localStorage.getItem("LAST_UPDATED");

  const now = new Date();

  if (!data || !lastUpdated) {
    const allData = await fetchAll();
    localStorage.setItem("EUROSTAT_DATA", JSON.stringify(allData));
    localStorage.setItem("LAST_UPDATED", now.toISOString());
    return allData;
  }

  const lastDate = new Date(lastUpdated);
  const diffMs = now - lastDate;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diffMs > oneDay) {
    const allData = await fetchAll();
    localStorage.setItem("EUROSTAT_DATA", JSON.stringify(allData));
    localStorage.setItem("LAST_UPDATED", now.toISOString());
    return allData;
  }

  return data;
};

/**
 * apeleaza pe rand fetchData pentru fiecare indicator -> fiecare tara. apoi strange toate datele
 * @returns {Promise<Array<{tara:string, an:number, indicator:string, valoare:number}>>}
 */
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

/**
 * filtreaza datele dupa tara/an/indicator.
 * @param {string} country - cod tara / "ALL" pentru toate tarile
 * @param {number} year - anul / 0 pentru toti anii
 * @param {"SV"|"POP"|"PIB"|"ALL"} indicator - indicator / "ALL" pentru toti indicatorii
 * @returns {Promise<Array<{tara:string, an:number, indicator:string, valoare:number}>>}
 */
const getData = (country, year, indicator) => {
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

/**
 * calculeaza valorile RGB pentru fiecare celula
 * @param {number} val - valoarea curenta
 * @param {number} min - minim pe coloana
 * @param {number} max - maxim pe coloana
 * @param {number} avg - media pe coloana
 * @returns {string} - culoarea in format `rgb(r, g, b)`
 */
const getCellColor = (val, min, max, avg) => {
  let r, g, b;

  // daca valoarea este sub medie => mix intre rosu si alb
  if (val <= avg) {
    const ratio = (val - min) / (avg - min || 1);
    r = 255;
    g = Math.round(255 * ratio);
    b = Math.round(255 * ratio);
  }
  // daca valoarea este peste medie => mix intre alb si verde
  else {
    const ratio = (val - avg) / (max - avg || 1);
    r = Math.round(255 * (1 - ratio));
    g = 255;
    b = Math.round(255 * (1 - ratio));
  }

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * populeaza table body cu date pentru anul selectat
 * @param {number} year - anul pentru afisare
 */
const addDataToTable = async (year) => {
  const tbody = document.querySelector("#table tbody");

  tbody.innerHTML = "";

  const filteredData = getData("ALL", year, "ALL");

  // get min, max, avg for each column
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

/**
 * init app la incarcarea DOM-ului: preluare date, draw charts + render table
 */
window.addEventListener("DOMContentLoaded", async () => {
  allData = await checkLocalStorage();
  updateBarChart(barCountrySelect.value, barIndSelect.value);
  updateBubbleChart(2023);
  addDataToTable(parseInt(tableSelect.value));
});

/**
 * redesenam bar chart-ul daca fereastra se redimensioneaza
 */
window.addEventListener("resize", () => {
  updateBarChart(barCountrySelect.value, barIndSelect.value);
});

/**
 * la schimbarea anului de afisare a tabelului, se actualizeaza tabelul
 */
tableSelect.addEventListener("change", (e) => {
  addDataToTable(parseInt(e.target.value));
});

/**
 * la schimbarea tarii de afisare a bar chart-ului, se actualizeaza graficul
 */
barCountrySelect.addEventListener("change", () => {
  updateBarChart(barCountrySelect.value, barIndSelect.value);
});

/**
 * la schimbarea indicatorului de afisare a bar chart-ului, se actualizeaza graficul
 */
barIndSelect.addEventListener("change", () => {
  updateBarChart(barCountrySelect.value, barIndSelect.value);
});

/**
 * fortam reincarcarea datelor de la eurostat la apasarea butonului de import (DB icon)
 */
btnImport.addEventListener("click", async () => {
  localStorage.clear();
  allData = await checkLocalStorage();
});

/**
 * se ruleaza animatia bubble chart pentru anii 2010-2023
 */
btnPlay.addEventListener("click", async () => {
  for (let year = 2010; year < 2024; year++) {
    updateBubbleChart(year);
    await delay(1000);
  }
});

// ==================================== END EVENT LISTENERS ====================================
