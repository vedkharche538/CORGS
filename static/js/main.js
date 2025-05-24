// Main JavaScript file for Cloud Services Cost Manager

document.addEventListener('DOMContentLoaded', function() {
    // Enable Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Enable Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })

    // Add fade-out effect to alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.classList.add('fade');
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 5000);
    });

    // Format currency inputs
    const currencyInputs = document.querySelectorAll('input[type="number"][step="0.01"]');
    currencyInputs.forEach(input => {
        input.addEventListener('blur', function(e) {
            const value = parseFloat(this.value);
            if (!isNaN(value)) {
                this.value = value.toFixed(2);
            }
        });

        // Add dollar sign prefix to the input field
        const inputWrapper = document.createElement('div');
        inputWrapper.classList.add('input-group');
        const prefixSpan = document.createElement('span');
        prefixSpan.classList.add('input-group-text');
        prefixSpan.innerHTML = '$';

        // Replace the input with the input group
        input.parentNode.insertBefore(inputWrapper, input);
        inputWrapper.appendChild(prefixSpan);
        inputWrapper.appendChild(input);
    });

    // Set the current month and year in the add cost form
    const monthSelect = document.querySelector('#month');
    const yearInput = document.querySelector('#year');

    if (monthSelect && yearInput) {
        const now = new Date();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        monthSelect.value = months[now.getMonth()];
        yearInput.value = now.getFullYear();
    }

    // Populate year selector on dashboard with dynamic years
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        // Get current year
        const currentYear = new Date().getFullYear();

        // Clear default options
        yearSelect.innerHTML = '<option value="all">All Years</option>';

        // Add 5 years (3 past, current, 1 future)
        for (let year = currentYear - 3; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            // Select current year by default
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }

    // Set current month in dashboard filter
    const monthSelectDashboard = document.getElementById('month-select');
    if (monthSelectDashboard) {
        const currentMonth = new Date().getMonth();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthSelectDashboard.value = months[currentMonth];
    }

    // Add active class to current nav item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Enhance all tables with responsive features
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
        if (!table.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-responsive');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });

    // Add animation to cards when they enter viewport
    const cards = document.querySelectorAll('.card');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        observer.observe(card);
    });
});

// Format currency values
function formatCurrency(value) {
    return '$' + parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format percentage values
function formatPercentage(value) {
    return parseFloat(value).toFixed(1) + '%';
}
