# Proiect Multimedia - Eurostat Explorer

## About

Eurostat Explorer is a web-based data visualization tool built using plain HTML, CSS, and JavaScript. It was developed as a project for Multimedia class with the specific constraint of implementing graphics without the use of any external charting libraries.

## Overview

The application fetches real-time data from Eurostat regarding GDP, Life Expectancy, and Population for EU countries. It processes this data to create interactive visualizations, allowing users to analyze trends and compare metrics across all EU nations and years (2010-2024).

Live Demo available at: https://andreeatcl.github.io/eurostat-explorer/

## Features

The application supports the following core functionalities:

- **Data Integration & Caching:** Fetches data directly from the Eurostat API on load and formats it for internal use. Stores extracted data in Local Storage to minimize API calls.
- **SVG Bar Chart:** Visualizes the evolution of a specific indicator (GDP/Life Exp/Pop) for a selected country using vector graphics.
- **Canvas Bubble Chart Animation:** Animated sequence showing the bubble chart evolution for all countries in the analyzed period.
- **Table Visualization:** Displays data for a user-selected year in a table format. Features heatmap styling (Red to Green), based on deviation from the EU average.
- **Documentation:** Code includes comprehensive JSDoc comments.

## Technologies Used

- **Languages:** HTML, CSS, JavaScript
- **APIs:** Eurostat API
- **Graphics:** SVG (Vector), HTML5 Canvas (Raster)
- **Storage:** Local Storage

## How to Run

1.  Clone this repository.
2.  Open index.html or (recommended) run the project using the VSCode extension Live Server.
