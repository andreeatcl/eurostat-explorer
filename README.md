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
- store extracted data in local storage + (check if extracted today. if not => api call) + import button
- afișare bubble chart pentru un an selectat de utilizator folosind un element de tip canvas (grafică raster)
- animație bubble chart (afișare bubble chart succesiv pentru toți anii)
- added JSDoc comments
- review code and refactor where needed (kinda)

## To do:

- remove malta 2012 for bubble chart
