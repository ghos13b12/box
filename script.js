const SHEET_ID = "1qP34VnnoJgxTX3rdont0mlpvpzApgmobklKx5soJvio";
    const GID = "0";
    const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;
    const REFRESH_INTERVAL = 30000; // 30 seconds

    /**
     * Determines the color class based on the date difference from today.
     * @param {string} dateStr - The date string in "jj/mm/aaaa" format.
     * @returns {string} The CSS class ("green", "orange", "red"), or an empty string if invalid.
     */
    function getColorClass(dateStr) {
      if (!dateStr) {
        return '';
      }

      const parts = dateStr.split('/');
      if (parts.length !== 3) {
        console.warn(`Invalid date string format: ${dateStr}. Expected "jj/mm/aaaa".`);
        return '';
      }

      // Note: Month is 0-indexed in JavaScript Date objects.
      const hospitalDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const today = new Date();

      // Set hours, minutes, seconds, and milliseconds to 0 for accurate day comparison
      hospitalDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - hospitalDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Corrected logic for color assignment
      if (diffDays === 0) { // If the date is today
        return "green";
      } else if (diffDays >= 1 && diffDays <= 3) { // If the date is 1 to 3 days ago
        return "orange";
      } else if (diffDays > 3) { // If the date is more than 3 days ago
        return "red";
      }
      return ''; // For future dates or other cases, no color class
    }

    /**
     * Fetches data from the Google Sheet and updates the DOM.
     */
    async function fetchData() {
      const boxesContainer = document.getElementById("boxes");
      if (!boxesContainer) {
        console.error("Target element with ID 'boxes' not found.");
        return;
      }

      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const textData = await response.text();
        // Extract the JSON part from the Google Visualization API response
        const jsonString = textData.substring(47).slice(0, -2);

        const jsonData = JSON.parse(jsonString);
        const rows = jsonData.table.rows;

        let html = "";
        // Limit to 15 rows as per original code, or adjust as needed
        for (let i = 0; i < Math.min(rows.length, 15); i++) {
          const row = rows[i].c;
          const boxValue = row[0]?.v || "";
          const nomValue = row[1]?.v || "";
          const dateValue = row[2]?.v || "";
          const colorClass = getColorClass(dateValue);

          html += `
            <div class="box ${colorClass}">
              <div style="font-size: 1.6em;">${boxValue}</div>
              <div class="nom">${nomValue}</div>
              <div class="date">${dateValue}</div>
            </div>
          `;
        }

        boxesContainer.innerHTML = html;
      } catch (error) {
        boxesContainer.innerHTML = "<p>❌ Erreur de chargement des données.</p>";
        console.error("Error fetching or parsing data:", error);
      }
    }

    // Initial data fetch when the script loads
    fetchData();

    // Set up interval for refreshing data
    setInterval(fetchData, REFRESH_INTERVAL);
