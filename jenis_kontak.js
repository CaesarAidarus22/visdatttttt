// Set up margins and dimensions for the chart
const margin = { top: 30, right: 40, bottom: 70, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Bar chart SVG container
const barSvg = d3.select("#bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
// Create tooltip
const tooltip = d3.select(".tooltip");

// Mock data for demonstration (since we don't have the actual CSV file)
// Comment this out when using real data
const mockData = [
    { contact: "cellular", count: 350 },
    { contact: "telephone", count: 180 },
    { contact: "unknown", count: 45 }
];

// Function to create the chart
function createChart(contactCounts) {
    // Define specific colors for each contact type
    const contactColors = {
        "cellular": "#2ecc71",   // Hijau untuk cellular
        "telephone": "#e74c3c",  // Merah untuk telephone
        "unknown": "#3498db"     // Biru untuk yang lainnya
    };
    
    // Set up X and Y scales for bar chart
    const x = d3.scaleBand()
        .domain(contactCounts.map(d => d.contact))
        .range([0, width])
        .padding(0.3);
        
    const y = d3.scaleLinear()
        .domain([0, d3.max(contactCounts, d => d.count) * 1.2])
        .nice()
        .range([height, 0]);
        
    // Add gradient background
    barSvg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f8f9fa")
        .attr("rx", 8)
        .attr("ry", 8);
        
    // Add grid lines
    barSvg.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(""));
            
    // Create bars with animation
    barSvg.selectAll(".bar")
        .data(contactCounts)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.contact))
        .attr("width", x.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .attr("fill", d => contactColors[d.contact] || "#3498db")
        .attr("rx", 4)
        .attr("ry", 4)
        .transition()
        .duration(800)
        .delay((d, i) => i * 200)
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count));
        
    // Add event listeners for tooltips
    barSvg.selectAll(".bar")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 0.8);
                
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
                
            tooltip.html(`Jenis Kontak: <b>${d.contact}</b><br>Jumlah: <b>${d.count}</b>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 1);
                
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
        
    // Add value labels on top of bars
    barSvg.selectAll(".value-label")
        .data(contactCounts)
        .enter().append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.contact) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .style("opacity", 0)
        .text(d => d.count)
        .transition()
        .duration(800)
        .delay((d, i) => i * 200 + 300)
        .style("opacity", 1);
        
    // Add X axis with styled labels
    barSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .attr("dx", "0em")
        .attr("dy", "1em");
        
    // Add Y axis with styled labels
    barSvg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px");
        
    // Add axis labels
    barSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 15)
        .attr("text-anchor", "middle")
        .style("fill", "#2c3e50")
        .text("Jenis Kontak");
        
    barSvg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("fill", "#2c3e50")
        .text("Jumlah Nasabah yang Merespons Positif");
        
    // Add chart title
    barSvg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("Distribusi Respons Positif");
}

// Load data from CSV
d3.csv("final_cleaned_dataset (4).csv").then(data => {
    // Filter data for successful responses (y == 'yes')
    const successData = data.filter(d => d.y === 'yes');
    
    // Group data by 'contact' and count the number of successful responses
    const contactData = d3.group(successData, d => d.contact);
    
    // Map the grouped data to the format required for Bar Chart
    const contactCounts = Array.from(contactData, ([key, value]) => ({
        contact: key,
        count: value.length
    }));
    
    createChart(contactCounts);
}).catch(error => {
    console.log("Error loading the CSV data: ", error);
    // Use mock data if CSV fails to load
    createChart(mockData);
});