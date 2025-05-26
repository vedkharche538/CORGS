// Dashboard JavaScript functions

// Global variables for charts
let costsByCategoryChart;
let costsByEnvironmentChart;
let costsByServiceChart;
let costTrendChart;
let environmentBreakdownChart;

// Function to update all dashboard charts based on filters
function updateDashboard() {
    const selectedMonth = document.getElementById('month-select').value;
    const selectedYear = document.getElementById('year-select').value;
    const selectedEnvironment = document.getElementById('environment-select').value;

    // Show loading states
    showLoading();

    // Update all charts with new filter values
    loadCostsByCategoryChart(selectedMonth, selectedYear, selectedEnvironment);
    loadCostsByEnvironmentChart(selectedMonth, selectedYear, selectedEnvironment);
    loadCostsByServiceChart(selectedMonth, selectedYear, selectedEnvironment);
    loadCostTrendChart(selectedMonth, selectedYear, 'monthly', selectedEnvironment);

    // Reset environment breakdown chart (it will be updated on selection)
    resetEnvironmentBreakdownChart();

    // Update summary metrics
    loadSummaryData(selectedMonth, selectedYear, selectedEnvironment);

    // Refresh environment selectors with new filters
    setupEnvironmentSelectors(selectedEnvironment);
}

// Function to show loading indicators
function showLoading() {
    document.getElementById('envChartLoading').classList.remove('d-none');
    document.getElementById('serviceChartLoading').classList.remove('d-none');
    document.getElementById('categoryChartLoading').classList.remove('d-none');
    document.getElementById('trendChartLoading').classList.remove('d-none');
    document.getElementById('envBreakdownLoading').classList.remove('d-none');

    document.getElementById('envChartNoData').classList.add('d-none');
    document.getElementById('serviceChartNoData').classList.add('d-none');
    document.getElementById('categoryChartNoData').classList.add('d-none');
    document.getElementById('trendChartNoData').classList.add('d-none');
    document.getElementById('noDataMessage').classList.add('d-none');
}

// Function to reset environment breakdown chart
function resetEnvironmentBreakdownChart() {
    if (environmentBreakdownChart) {
        environmentBreakdownChart.destroy();
        environmentBreakdownChart = null;
    }
    document.getElementById('noDataMessage').classList.add('d-none');
}

// Function to load summary data
function loadSummaryData(month = 'all', year = 'all', environment = 'all') {
    // Call your API to get summary metrics
    fetch(`/api/dashboard_summary?month=${month}&year=${year}&environment=${environment}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalCost').textContent = '$' + data.total_cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById('serviceCount').textContent = data.service_count;
            document.getElementById('envCount').textContent = data.environment_count;
            document.getElementById('categoryCount').textContent = data.category_count;
        })
        .catch(error => {
            console.error('Error loading summary data:', error);
            // Set default values on error
            document.getElementById('totalCost').textContent = '$0.00';
            document.getElementById('serviceCount').textContent = '0';
            document.getElementById('envCount').textContent = '0';
            document.getElementById('categoryCount').textContent = '0';
        });
}

// Function to change trend chart view mode
function changeViewMode(mode) {
    // Highlight the active button
    document.getElementById('monthlyViewBtn').classList.remove('btn-warning');
    document.getElementById('monthlyViewBtn').classList.add('btn-light');
    document.getElementById('quarterlyViewBtn').classList.remove('btn-warning');
    document.getElementById('quarterlyViewBtn').classList.add('btn-light');
    document.getElementById('yearlyViewBtn').classList.remove('btn-warning');
    document.getElementById('yearlyViewBtn').classList.add('btn-light');

    // Highlight selected button
    document.getElementById(`${mode}ViewBtn`).classList.remove('btn-light');
    document.getElementById(`${mode}ViewBtn`).classList.add('btn-warning');

    // Update chart with the selected view mode
    const selectedMonth = document.getElementById('month-select').value;
    const selectedYear = document.getElementById('year-select').value;
    const selectedEnvironment = document.getElementById('environment-select').value;
    loadCostTrendChart(selectedMonth, selectedYear, mode, selectedEnvironment);
}

// Load Costs by Environment Chart
function loadCostsByEnvironmentChart(month = 'all', year = 'all', environment = 'all') {
    fetch(`/api/costs_by_environment?month=${month}&year=${year}&environment=${environment}`)
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            document.getElementById('envChartLoading').classList.add('d-none');

            // Check if there's data to display
            if (data.length === 0) {
                document.getElementById('envChartNoData').classList.remove('d-none');
                if (costsByEnvironmentChart) {
                    costsByEnvironmentChart.destroy();
                    costsByEnvironmentChart = null;
                }
                return;
            }

            // Destroy previous chart if it exists
            if (costsByEnvironmentChart) {
                costsByEnvironmentChart.destroy();
            }

            const ctx = document.getElementById('costsByEnvironmentChart').getContext('2d');
            costsByEnvironmentChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.environment),
                    datasets: [{
                        label: 'Cost ($)',
                        data: data.map(item => item.cost),
                        backgroundColor: [
                            'rgba(0, 123, 255, 0.8)', 'rgba(40, 167, 69, 0.8)',
                            'rgba(255, 193, 7, 0.8)', 'rgba(108, 117, 125, 0.8)',
                            'rgba(220, 53, 69, 0.8)', 'rgba(23, 162, 184, 0.8)',
                            'rgba(102, 16, 242, 0.8)', 'rgba(253, 126, 20, 0.8)'
                        ],
                        borderColor: [
                            'rgb(0, 123, 255)', 'rgb(40, 167, 69)',
                            'rgb(255, 193, 7)', 'rgb(108, 117, 125)',
                            'rgb(220, 53, 69)', 'rgb(23, 162, 184)',
                            'rgb(102, 16, 242)', 'rgb(253, 126, 20)'
                        ],
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 12
                                },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round(value / total * 100) : 0;
                                    return `${label}: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${percentage}%)`;
                                }
                            },
                            titleFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 13
                            },
                            padding: 10,
                            boxPadding: 5
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1000
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading environment chart:', error);
            document.getElementById('envChartLoading').classList.add('d-none');
            document.getElementById('envChartNoData').classList.remove('d-none');
        });
}

// Load Costs by Service Chart
function loadCostsByServiceChart(month = 'all', year = 'all', environment = 'all') {
    fetch(`/api/costs_by_service?month=${month}&year=${year}&environment=${environment}`)
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            document.getElementById('serviceChartLoading').classList.add('d-none');

            // Check if there's data to display
            if (data.length === 0) {
                document.getElementById('serviceChartNoData').classList.remove('d-none');
                if (costsByServiceChart) {
                    costsByServiceChart.destroy();
                    costsByServiceChart = null;
                }
                return;
            }

            // Destroy previous chart if it exists
            if (costsByServiceChart) {
                costsByServiceChart.destroy();
            }

            const ctx = document.getElementById('costsByServiceChart').getContext('2d');
            costsByServiceChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.service),
                    datasets: [{
                        label: 'Cost ($)',
                        data: data.map(item => item.cost),
                        backgroundColor: [
                            'rgba(32, 201, 151, 0.8)', 'rgba(102, 16, 242, 0.8)',
                            'rgba(253, 126, 20, 0.8)', 'rgba(23, 162, 184, 0.8)',
                            'rgba(0, 123, 255, 0.8)', 'rgba(40, 167, 69, 0.8)',
                            'rgba(255, 193, 7, 0.8)', 'rgba(220, 53, 69, 0.8)',
                            'rgba(108, 117, 125, 0.8)', 'rgba(52, 58, 64, 0.8)'
                        ],
                        borderColor: [
                            'rgb(32, 201, 151)', 'rgb(102, 16, 242)',
                            'rgb(253, 126, 20)', 'rgb(23, 162, 184)',
                            'rgb(0, 123, 255)', 'rgb(40, 167, 69)',
                            'rgb(255, 193, 7)', 'rgb(220, 53, 69)',
                            'rgb(108, 117, 125)', 'rgb(52, 58, 64)'
                        ],
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 12
                                },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round(value / total * 100) : 0;
                                    return `${label}: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${percentage}%)`;
                                }
                            },
                            titleFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 13
                            },
                            padding: 10,
                            boxPadding: 5
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1000
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading service chart:', error);
            document.getElementById('serviceChartLoading').classList.add('d-none');
            document.getElementById('serviceChartNoData').classList.remove('d-none');
        });
}

// Load Costs by Category Chart
function loadCostsByCategoryChart(month = 'all', year = 'all', environment = 'all') {
    fetch(`/api/costs_by_category?month=${month}&year=${year}&environment=${environment}`)
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            document.getElementById('categoryChartLoading').classList.add('d-none');

            // Check if there's data to display
            if (data.length === 0) {
                document.getElementById('categoryChartNoData').classList.remove('d-none');
                if (costsByCategoryChart) {
                    costsByCategoryChart.destroy();
                    costsByCategoryChart = null;
                }
                return;
            }

            // Destroy previous chart if it exists
            if (costsByCategoryChart) {
                costsByCategoryChart.destroy();
            }

            const ctx = document.getElementById('costsByCategoryChart').getContext('2d');
            costsByCategoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.category),
                    datasets: [{
                        label: 'Cost ($)',
                        data: data.map(item => item.cost),
                        backgroundColor: [
                            'rgba(23, 162, 184, 0.8)', 'rgba(32, 201, 151, 0.8)',
                            'rgba(0, 123, 255, 0.8)', 'rgba(255, 193, 7, 0.8)',
                            'rgba(220, 53, 69, 0.8)', 'rgba(102, 16, 242, 0.8)',
                            'rgba(253, 126, 20, 0.8)', 'rgba(108, 117, 125, 0.8)'
                        ],
                        borderColor: [
                            'rgb(23, 162, 184)', 'rgb(32, 201, 151)', 
                            'rgb(0, 123, 255)', 'rgb(255, 193, 7)',
                            'rgb(220, 53, 69)', 'rgb(102, 16, 242)',
                            'rgb(253, 126, 20)', 'rgb(108, 117, 125)'
                        ],
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 12
                                },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round(value / total * 100) : 0;
                                    return `${label}: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${percentage}%)`;
                                }
                            },
                            titleFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 13
                            },
                            padding: 10,
                            boxPadding: 5
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1000
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading category chart:', error);
            document.getElementById('categoryChartLoading').classList.add('d-none');
            document.getElementById('categoryChartNoData').classList.remove('d-none');
        });
}

// Load Cost Trend Chart
    function loadCostTrendChart(month = 'all', year = 'all', viewMode = 'monthly', environment = 'all') {
    fetch(`/api/costs_trend?month=${month}&year=${year}&environment=${environment}&viewMode=${viewMode}`)
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            document.getElementById('trendChartLoading').classList.add('d-none');

            // Check if there's data to display
            if (data.length === 0) {
                document.getElementById('trendChartNoData').classList.remove('d-none');
                if (costTrendChart) {
                    costTrendChart.destroy();
                    costTrendChart = null;
                }
                return;
            }

            // Destroy previous chart if it exists
            if (costTrendChart) {
                costTrendChart.destroy();
            }

            const ctx = document.getElementById('costTrendChart').getContext('2d');
            costTrendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(item => item.period),
                    datasets: [{
                        label: 'Cost ($)',
                        data: data.map(item => item.cost),
                        backgroundColor: 'rgba(255, 193, 7, 0.2)',
                        borderColor: 'rgba(255, 193, 7, 1)',
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true,
                        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointHoverBackgroundColor: 'rgba(255, 193, 7, 1)',
                        pointHoverBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Cost ($)',
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString('en-US');
                                },
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 12
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: viewMode === 'monthly' ? 'Month' : (viewMode === 'quarterly' ? 'Quarter' : 'Year'),
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw || 0;
                                    return `Cost: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                                }
                            },
                            titleFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 13
                            },
                            padding: 10,
                            boxPadding: 5
                        }
                    },
                    animation: {
                        duration: 1000
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading trend chart:', error);
            document.getElementById('trendChartLoading').classList.add('d-none');
            document.getElementById('trendChartNoData').classList.remove('d-none');
        });
}

// Function to handle environment selection
function setupEnvironmentSelectors() {
    const environmentSelectors = document.querySelectorAll('.environment-selector');
    environmentSelectors.forEach(selector => {
        selector.addEventListener('click', function(e) {
            e.preventDefault();

            // Set active class
            environmentSelectors.forEach(s => s.classList.remove('active'));
            this.classList.add('active');

            const environment = this.getAttribute('data-environment');
            const selectedMonth = document.getElementById('month-select').value;
            const selectedYear = document.getElementById('year-select').value;

            // Show loading indicator
            document.getElementById('envBreakdownLoading').classList.remove('d-none');
            document.getElementById('noDataMessage').classList.add('d-none');

            // Fetch data for the selected environment with filters
            fetch(`/api/costs_by_environment_and_service?month=${selectedMonth}&year=${selectedYear}`)
                .then(response => response.json())
                .then(data => {
                    // Hide loading indicator
                    document.getElementById('envBreakdownLoading').classList.add('d-none');

                    // Destroy existing chart if it exists
                    if (environmentBreakdownChart) {
                        environmentBreakdownChart.destroy();
                        environmentBreakdownChart = null;
                    }

                    // Check if data exists for the selected environment
                    if (data[environment] && Object.keys(data[environment]).length > 0) {
                        // Hide no data message
                        document.getElementById('noDataMessage').classList.add('d-none');

                        const services = Object.keys(data[environment]);
                        const costs = services.map(service => data[environment][service]);

                        const ctx = document.getElementById('environmentBreakdownChart').getContext('2d');
                        environmentBreakdownChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: services,
                                datasets: [{
                                    label: `${environment} Environment Costs ($)`,
                                    data: costs,
                                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                                    borderColor: 'rgba(220, 53, 69, 1)',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    hoverBackgroundColor: 'rgba(220, 53, 69, 0.9)'
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Cost ($)',
                                            font: {
                                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                                size: 14,
                                                weight: 'bold'
                                            }
                                        },
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.05)'
                                        },
                                        ticks: {
                                            callback: function(value) {
                                                return '$' + value.toLocaleString('en-US');
                                            },
                                            font: {
                                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                                size: 12
                                            }
                                        }
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Service',
                                            font: {
                                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                                size: 14,
                                                weight: 'bold'
                                            }
                                        },
                                        grid: {
                                            display: false
                                        },
                                        ticks: {
                                            font: {
                                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                                size: 11
                                            },
                                            maxRotation: 45,
                                            minRotation: 45,
                                            padding: 5
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    title: {
                                        display: true,
                                        text: `Service Costs for ${environment} Environment`,
                                        font: {
                                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                            size: 16,
                                            weight: 'bold'
                                        },
                                        padding: {
                                            top: 10,
                                            bottom: 20
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const value = context.raw || 0;
                                                return `Cost: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                                            }
                                        },
                                        titleFont: {
                                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                            size: 14,
                                            weight: 'bold'
                                        },
                                        bodyFont: {
                                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                            size: 13
                                        },
                                        padding: 10,
                                        boxPadding: 5
                                    }
                                },
                                animation: {
                                    duration: 1000
                                }
                            }
                        });
                    } else {
                        // Show no data message
                        document.getElementById('noDataMessage').classList.remove('d-none');
                    }
                })
                .catch(error => {
                    console.error('Error loading environment breakdown chart:', error);
                    document.getElementById('envBreakdownLoading').classList.add('d-none');
                    document.getElementById('noDataMessage').classList.remove('d-none');
                });
        });
    });

    // Select the first environment by default
    if (environmentSelectors.length > 0) {
        environmentSelectors[0].click();
    }
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filter values
    const currentDate = new Date();
    document.getElementById('year-select').value = currentDate.getFullYear().toString();

    // Set up filter change listeners
    document.getElementById('month-select').addEventListener('change', updateDashboard);
    document.getElementById('year-select').addEventListener('change', updateDashboard);
        document.getElementById('environment-select').addEventListener('change', updateDashboard);

    // Set up view buttons for trend chart
    document.getElementById('monthlyViewBtn').addEventListener('click', () => changeViewMode('monthly'));
    document.getElementById('quarterlyViewBtn').addEventListener('click', () => changeViewMode('quarterly'));
    document.getElementById('yearlyViewBtn').addEventListener('click', () => changeViewMode('yearly'));

    // Load summary metrics
    loadSummaryData();

    // Initial dashboard load
    updateDashboard();

    // Initialize environment selectors
    setupEnvironmentSelectors();
});
