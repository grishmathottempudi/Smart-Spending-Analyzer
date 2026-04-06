let barChart, pieChart;
let allData = [];

// READ CSV
function analyzeData() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Upload CSV");

    const reader = new FileReader();

    reader.onload = function(e) {
        const rows = e.target.result.trim().split("\n");
        allData = [];

        for (let i = 1; i < rows.length; i++) {
            const c = rows[i].split(",");
            if (c.length < 4) continue;

            allData.push({
                date: c[0],
                category: c[1],
                account: c[2],
                amount: parseFloat(c[3])
            });
        }

        localStorage.setItem("allData", JSON.stringify(allData));
        window.location.href = "result.html";
    };

    reader.readAsText(file);
}

// PAGE LOAD
window.onload = function() {

    // RESULT PAGE
    if (location.pathname.includes("result.html")) {

        allData = JSON.parse(localStorage.getItem("allData")) || [];

        const accounts = [...new Set(allData.map(d => d.account))];

        const dd = document.getElementById("accountFilter");
        dd.innerHTML = `<option value="All">All</option>`;
        accounts.forEach(a => dd.innerHTML += `<option>${a}</option>`);

        applyFilter();
    }

    // TREND PAGE
    if (location.pathname.includes("trend.html")) {
        const data = JSON.parse(localStorage.getItem("allData")) || [];
        let monthly = {};

        data.forEach(d => {
            let m = d.date.substring(0,7);
            monthly[m] = (monthly[m]||0)+d.amount;
        });

        new Chart(document.getElementById("lineChart"), {
            type:"line",
            data:{
                labels:Object.keys(monthly),
                datasets:[{
                    data:Object.values(monthly),
                    borderColor:"#6c5ce7",
                    fill:true
                }]
            }
        });
    }

    // TOP 3 PAGE
    if (location.pathname.includes("top3.html")) {
        const data = JSON.parse(localStorage.getItem("allData")) || [];
        let cat = {};

        data.forEach(d => cat[d.category]=(cat[d.category]||0)+d.amount);

        let sorted = Object.entries(cat).sort((a,b)=>b[1]-a[1]).slice(0,3);

        let emojis = ["⭐","🔥","💡"];
        let html = "";

        sorted.forEach((item,i)=>{
            html += `<p>${emojis[i]} <b>${item[0]}</b> - ₹${item[1]}</p>`;
        });

        document.getElementById("top3Output").innerHTML = html;
    }

    // ⭐ PERCENTAGE PAGE
    if (location.pathname.includes("percentage.html")) {
        const data = JSON.parse(localStorage.getItem("allData")) || [];

        let total = 0, cat = {};

        data.forEach(d=>{
            total += d.amount;
            cat[d.category]=(cat[d.category]||0)+d.amount;
        });

        let html = "";

        for(let c in cat){
            let p = ((cat[c]/total)*100).toFixed(1);
            html += `<p><b>${c}</b> : ${p}%</p>`;
        }

        document.getElementById("percentageOutput").innerHTML = html;
    }
};

// FILTER
function applyFilter() {
    const selected = document.getElementById("accountFilter").value;

    const data = selected==="All"
        ? allData
        : allData.filter(d=>d.account===selected);

    let total=0, cat={};

    data.forEach(d=>{
        total+=d.amount;
        cat[d.category]=(cat[d.category]||0)+d.amount;
    });

    document.getElementById("output").innerHTML = `<h3>Total: ₹${total}</h3>`;

    // warnings
    let warn="";
    if(cat["Food"]>0.4*total) warn+="⚠ High Food Spending<br>";
    if(cat["Shopping"]>0.3*total) warn+="⚠ Too much Shopping<br>";
    document.getElementById("warnings").innerHTML = warn;

    let labels=Object.keys(cat);
    let values=Object.values(cat);

    if(barChart) barChart.destroy();
    if(pieChart) pieChart.destroy();

    barChart = new Chart(document.getElementById("barChart"),{
        type:"bar",
        data:{labels:labels,datasets:[{data:values,backgroundColor:"#6c5ce7"}]}
    });

    pieChart = new Chart(document.getElementById("pieChart"),{
        type:"pie",
        data:{labels:labels,datasets:[{data:values}]}
    });

    localStorage.setItem("report", JSON.stringify({total,cat}));
}

// DOWNLOAD
function downloadReport(){
    const r = JSON.parse(localStorage.getItem("report"));

    let text = "SMART SPENDING REPORT\n\n";
    text += "Total: ₹"+r.total+"\n\n";

    for(let c in r.cat){
        text += c+" : ₹"+r.cat[c]+"\n";
    }

    const blob = new Blob([text], {type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "report.txt";
    a.click();
}

// NAV
function goBack(){ window.location.href="result.html"; }
function goHome(){ window.location.href="index.html"; }
function goToTrend(){ window.location.href="trend.html"; }
function goToTop3(){ window.location.href="top3.html"; }
function goToPercentage(){ window.location.href="percentage.html"; }