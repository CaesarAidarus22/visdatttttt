document.getElementById('csvFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const data = results.data;
        renderScatterPlot(data);
      }
    });
  });
  
  function renderScatterPlot(data) {
    const xValues = [];
    const yValues = [];
  
    data.forEach(row => {
      const campaignCount = parseInt(row.campaign);
      const response = row.y;
  
      if (!campaignCount || !response) return;
  
      // Mengubah 'yes' menjadi 1 dan 'no' menjadi 0 untuk sumbu Y
      const success = response.toLowerCase() === 'yes' ? 1 : 0;
  
      xValues.push(campaignCount);
      yValues.push(success);
    });
  
    // Pastikan data valid untuk scatter plot
    if (xValues.length === 0 || yValues.length === 0) {
      alert("Data tidak valid atau kosong.");
      return;
    }
  
    const ctx = document.getElementById('scatterChart').getContext('2d');
    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Jumlah Kampanye vs Keberhasilan',
          data: xValues.map((x, i) => ({ x: x, y: yValues[i] })),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          pointRadius: 5 // Ukuran titik agar lebih jelas terlihat
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Jumlah Kampanye'
            },
            min: Math.min(...xValues) - 1,
            max: Math.max(...xValues) + 1
          },
          y: {
            title: {
              display: true,
              text: 'Keberhasilan Kampanye (1 = Yes, 0 = No)'
            },
            min: -0.1, // Memberikan sedikit ruang di bawah angka 0
            max: 1.1,  // Memberikan sedikit ruang di atas angka 1
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value === 1 || value === 0 ? value : ''; // Menampilkan hanya 1 dan 0
              },
              align: 'center', // Menyusun angka 1 dan 0 di tengah
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              drawOnChartArea: true,
              color: '#ddd'
            }
          }
        }
      }
    });
  }
  