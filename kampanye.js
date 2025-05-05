// Fungsi untuk mendapatkan nama bulan dari angka
function getMonthName(monthNumber) {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return months[monthNumber - 1];
}

// Fungsi untuk memformat angka dalam format persen
function formatPercent(value) {
    return (value * 100).toFixed(1) + "%";
}

// Set up margins dan dimensi
const margin = { top: 30, right: 40, bottom: 70, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Membuat SVG yang responsif
const svg = d3.select("#line-chart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
        
// Membuat tooltip
const tooltip = d3.select(".tooltip");

// Memproses data dari CSV
d3.csv("final_cleaned_dataset (4).csv").then(data => {
    // Konversi kolom 'month' ke nilai numerik untuk pengurutan
    const monthMap = { 'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6, 
                      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12 };
    
    data.forEach(d => {
        d.month = monthMap[d.month.toLowerCase()];
        d.success = d.y === 'yes' ? 1 : 0; // Mengkonversi 'yes'/'no' ke 1/0 untuk keberhasilan
    });

    // Mengelompokkan data berdasarkan bulan dan menghitung rata-rata tingkat keberhasilan per bulan
    const monthlyData = d3.rollup(data, v => d3.mean(v, d => d.success), d => d.month);
    const monthlyArray = Array.from(monthlyData, ([month, success]) => ({ month, success }))
                          .sort((a, b) => a.month - b.month); // Mengurutkan berdasarkan bulan

    // Menambahkan animasi dengan transisi
    const t = d3.transition().duration(1000);

    // Membuat skala untuk sumbu X dan Y
    const x = d3.scaleBand()
        .domain(monthlyArray.map(d => d.month))
        .range([0, width])
        .padding(0.1);
            
    const y = d3.scaleLinear()
        .domain([0, Math.max(...monthlyArray.map(d => d.success)) * 1.1]) // Memberi ruang sedikit di atas
        .nice()
        .range([height, 0]);
            
    // Menambahkan gradient untuk area chart
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
        .attr("id", "area-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
            
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#4361ee")
        .attr("stop-opacity", 0.3);
            
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#4361ee")
        .attr("stop-opacity", 0.05);
            
    // Menambahkan grid latar belakang
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat("")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr("stroke", "#e2e8f0")
            .attr("stroke-dasharray", "4,4")
        );
            
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr("stroke", "#e2e8f0")
            .attr("stroke-dasharray", "4,4")
        );
            
    // Membuat fungsi path untuk garis
    const line = d3.line()
        .x(d => x(d.month) + x.bandwidth() / 2)
        .y(d => y(d.success))
        .curve(d3.curveMonotoneX); // Membuat kurva lebih halus
            
    // Membuat area di bawah garis
    const area = d3.area()
        .x(d => x(d.month) + x.bandwidth() / 2)
        .y0(height)
        .y1(d => y(d.success))
        .curve(d3.curveMonotoneX);
            
    // Menambahkan area fill dengan transisi
    svg.append("path")
        .data([monthlyArray])
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", "url(#area-gradient)")
        .attr("opacity", 0)
        .transition(t)
        .attr("opacity", 1);
            
    // Menambahkan garis ke SVG dengan transisi
    const path = svg.append("path")
        .data([monthlyArray])
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#4361ee")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); })
        .attr("stroke-dashoffset", function() { return this.getTotalLength(); });
    
    // Animasi garis
    path.transition(t)
        .attr("stroke-dashoffset", 0);
            
    // Menambahkan titik pada setiap data point dengan transisi
    svg.selectAll(".dot")
        .data(monthlyArray)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.month) + x.bandwidth() / 2)
        .attr("cy", d => y(d.success))
        .attr("r", 0) // Mulai dari ukuran 0
        .attr("fill", "#fff")
        .attr("stroke", "#4361ee")
        .attr("stroke-width", 2)
        .transition()
        .delay((d, i) => i * 150)
        .duration(500)
        .attr("r", 6)
        .on("end", function() {
            // Menambahkan event listener setelah transisi selesai
            d3.select(this)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .attr("r", 8)
                        .attr("fill", "#4361ee");
                        
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                        
                    tooltip.html(`Bulan: ${getMonthName(d.month)}<br>Keberhasilan: ${formatPercent(d.success)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr("r", 6)
                        .attr("fill", "#fff");
                        
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });
            
    // Menambahkan sumbu X dengan style yang diperbarui
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(x).tickFormat(d => getMonthName(d).substring(0, 3)))
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dy", "1em");
            
    // Menambahkan sumbu Y dengan style yang diperbarui
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickFormat(formatPercent))
        .selectAll("text")
        .attr("dx", "-0.5em");
            
    // Menambahkan label sumbu
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Bulan");
            
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Keberhasilan Kampanye");
}).catch(error => {
    console.log("Error loading the CSV data: ", error);
    // Menampilkan pesan error pada chart container
    d3.select("#chart-container")
        .append("div")
        .attr("class", "error-message")
        .style("color", "red")
        .style("margin-top", "20px")
        .text("Gagal memuat data. Silakan periksa file CSV Anda.");
});

// Membuat chart responsif saat ukuran window berubah
window.addEventListener("resize", function() {
    // Hanya diperlukan jika kita perlu mengatur ulang skala berdasarkan ukuran window
    // Karena kita menggunakan viewBox dan preserveAspectRatio, chart sudah akan menyesuaikan secara otomatis
});