// script.js

document.addEventListener('DOMContentLoaded', function() {
    const addRecordBtn = document.getElementById('addRecord');
    const recordList = document.getElementById('recordList');
    const totalUsageElem = document.getElementById('totalUsage');
    const dailyUsageList = document.getElementById('dailyUsageList');
    const pieChartCtx = document.getElementById('pieChart').getContext('2d');
    const tabs = document.querySelectorAll('.tab');

    let records = JSON.parse(localStorage.getItem('records')) || [];
    let currentMonth = new Date().getMonth();

    const pieChart = new Chart(pieChartCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: 'Expenses by Category',
                data: [],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw} MMK`;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value) => `${value} MMK`,
                    font: {
                        weight: 'bold',
                        size: 14,
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    function updateTotalUsage() {
        const filteredRecords = records.filter(record => new Date(record.timestamp).getMonth() === currentMonth);
        const total = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
        totalUsageElem.textContent = `${total} MMK`;
    }

    function updateDailyUsage() {
        const filteredRecords = records.filter(record => new Date(record.timestamp).getMonth() === currentMonth);
        const dailyTotals = {};

        filteredRecords.forEach(record => {
            const date = new Date(record.timestamp).toLocaleDateString();
            if (dailyTotals[date]) {
                dailyTotals[date] += record.amount;
            } else {
                dailyTotals[date] = record.amount;
            }
        });

        dailyUsageList.innerHTML = '';
        Object.keys(dailyTotals).forEach(date => {
            const li = document.createElement('li');
            li.className = 'daily-usage-item';
            li.textContent = `${date}: ${dailyTotals[date]} MMK`;
            dailyUsageList.appendChild(li);
        });
    }

    function formatDateTime(dateTime) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateTime).toLocaleString('en-US', options);
    }

    function renderRecords() {
        recordList.innerHTML = '';
        const categoryTotals = {};
        const filteredRecords = records.filter(record => new Date(record.timestamp).getMonth() === currentMonth);

        filteredRecords.forEach((record, index) => {
            const dateTime = formatDateTime(record.timestamp);
            const li = document.createElement('li');
            li.innerHTML = `
                ${record.description}: ${record.amount} MMK (${record.category}) <span class="date-time">(${dateTime})</span>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            recordList.appendChild(li);

            if (categoryTotals[record.category]) {
                categoryTotals[record.category] += record.amount;
            } else {
                categoryTotals[record.category] = record.amount;
            }
        });

        updateTotalUsage();
        updateDailyUsage();

        pieChart.data.labels = Object.keys(categoryTotals);
        pieChart.data.datasets[0].data = Object.values(categoryTotals);
        pieChart.update();
    }

    function addRecord(description, amount, category) {
        const newRecord = {
            description,
            amount,
            category,
            timestamp: new Date().toISOString()
        };
        records.push(newRecord);
        localStorage.setItem('records', JSON.stringify(records));
        renderRecords();
    }

    function deleteRecord(index) {
        records.splice(index, 1);
        localStorage.setItem('records', JSON.stringify(records));
        renderRecords();
    }

    addRecordBtn.addEventListener('click', () => {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;

        if (description && !isNaN(amount)) {
            addRecord(description, amount, category);
            document.getElementById('description').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('category').value = 'Food'; // Default category after adding record
        }
    });

    recordList.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            deleteRecord(index);
        }
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentMonth = parseInt(e.target.getAttribute('data-month'), 10);
            renderRecords();
        });
    });

    renderRecords();
});
