# Proiect Multimedia (under construction)

## Done:

- Fetch Eurostat data on load (v1 - have to press fetch button. modify this later)
- Format data similar to eurostat.json
- Built the UI
- afișare sub formă de tabel a datelor disponibile pentru un an selectat de către utilizator (tarile pe linii și cei trei indicatori pe coloană); fiecare celulă va primi o culoare (de la roșu la verde) în funcție de distanța față de media uniunii
- implemented a "Loading data..." popup
- sped up the data loading process
- afișare grafică evoluție pentru un indicator (PIB/SV/Pop) și o țară selectată de către utilizator - se va folosi un element de tip SVG (grafică vectorială); BAR chart
- pentru graficul de la punctul anterior să se afișeze un tooltip care să afișeze anul și valorile pentru PIB/SV/Pop pentru perioada corespunzătoare poziției mouse-ului

## To do:

- store extracted data in local storage + (check if extracted today. if not => api call) !important
- afișare bubble chart pentru un an selectat de utilizator folosind un element de tip canvas (grafică raster)
- animație bubble chart (afișare bubble chart succesiv pentru toți anii)
- review code and refactor where needed
- polish the UI

### Notes:

- there are no SV values for the year of 2024 => adjusted to 2009-2023 data
- Malta SV for 2012 is a missing value => only 1214 values fetched from Eurostat compared to expected 1215 (27\*15\*3)
