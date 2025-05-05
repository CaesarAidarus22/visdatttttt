document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const data = results.data;
      renderSeparatedScatterCharts(data);
    }
  });
});

function renderSeparatedScatterCharts(data) {
  const yesPoints = [];
  const noPoints = [];

  data.forEach(row => {
    const duration = parseFloat(row.duration);
    const response = row.y?.toLowerCase();

    if (!isNaN(duration)) {
      if (response === 'yes') {
        yesPoints.push({ x: duration, y: 1 });
      } else if (response === 'no') {
        noPoints.push({ x: duration, y: 1 });
      }
    }
  });

  // Chart untuk "Yes"
  const ctxYes = document.getElementById('yesChart').getContext('2d');
  new Chart(ctxYes, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Berhasil (yes)',
        data: yesPoints,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Durasi Panggilan (detik)'
          }
        },
        y: {
          display: false
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Distribusi Durasi Panggilan untuk Kampanye Berhasil'
        }
      }
    }
  });

  // Chart untuk "No"
  const ctxNo = document.getElementById('noChart').getContext('2d');
  new Chart(ctxNo, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Gagal (no)',
        data: noPoints,
        backgroundColor: 'rgba(255, 99, 132, 0.7)'
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Durasi Panggilan (detik)'
          }
        },
        y: {
          display: false
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Distribusi Durasi Panggilan untuk Kampanye Gagal'
        }
      }
    }
  });
}