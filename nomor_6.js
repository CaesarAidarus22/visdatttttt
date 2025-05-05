document.getElementById('csvFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const data = results.data;
        renderBarChart(data);
      }
    });
  });
  
  function renderBarChart(data) {
    const maritalStatus = {};
    
    data.forEach(row => {
      const status = row.marital;
      const response = row.y;
  
      if (!status || !response) return;
  
      if (!maritalStatus[status]) {
        maritalStatus[status] = { yes: 0, no: 0 };
      }
  
      if (response.toLowerCase() === 'yes') {
        maritalStatus[status].yes += 1;
      } else if (response.toLowerCase() === 'no') {
        maritalStatus[status].no += 1;
      }
    });
  
    const labels = Object.keys(maritalStatus);
    const yesCounts = labels.map(status => maritalStatus[status].yes);
    const noCounts = labels.map(status => maritalStatus[status].no);
  
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ya (Menerima Tawaran)',
            data: yesCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          },
          {
            label: 'Tidak (Menolak)',
            data: noCounts,
            backgroundColor: 'rgba(255, 99, 132, 0.7)'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }