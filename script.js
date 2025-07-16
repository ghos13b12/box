document.addEventListener('DOMContentLoaded', () => {
  const SHEET_ID = "1qP34VnnoJgxTX3rdont0mlpvpzApgmobklKx5soJvio";
  const GID = "0";
  const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;
  const REFRESH_INTERVAL = 10000;
  const patientGrid = document.getElementById('patient-grid');

  const getStatusClass = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';

    const hospitalDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today - hospitalDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "status-ok";
    if (diffDays <= 3) return "status-warning";
    return "status-danger";
  };

  const fetchAndDisplayData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const text = await response.text();
      const jsonStr = text.substring(47).slice(0, -2);
      const data = JSON.parse(jsonStr);
      const rows = data.table.rows;

      if (rows.length === 0) {
        patientGrid.innerHTML = '<p>Aucun patient à afficher.</p>';
        return;
      }

      let htmlContent = '';

      // Ajouter le titre "adultes"
      htmlContent += `<div class="section-divider">adultes</div>`;

      // Première section : Patients 1 à 15 (adultes)
      const adultGroup = rows.slice(0, 14);
      htmlContent += adultGroup.map(row => {
        const [box, nom, date] = row.c.map(cell => cell?.v || "");
        const statusClass = getStatusClass(date);
        return `
          <div class="box ${statusClass}">
            <div class="box-id">${box}</div>
            <div class="box-name">${nom}</div>
            <div class="box-date">${date}</div>
          </div>
        `;
      }).join('');

      // Ajouter le titre "enfants" et la section enfants
      const childrenGroup = rows.slice(14, 20);
      if (childrenGroup.length > 0) {
        htmlContent += `<div class="section-divider">enfants</div>`;
        htmlContent += childrenGroup.map(row => {
          const [box, nom, date] = row.c.map(cell => cell?.v || "");
          const statusClass = getStatusClass(date);
          return `
            <div class="box ${statusClass}">
              <div class="box-id">${box}</div>
              <div class="box-name">${nom}</div>
              <div class="box-date">${date}</div>
            </div>
          `;
        }).join('');
      }

      patientGrid.innerHTML = htmlContent;

    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      patientGrid.innerHTML = "<p>❌ Impossible de charger les informations des patients.</p>";
    }
  };

  fetchAndDisplayData();
  setInterval(fetchAndDisplayData, REFRESH_INTERVAL);
});
