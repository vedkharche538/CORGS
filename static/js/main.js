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
// Main JavaScript functions

// Function to handle active state in navbar based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Get current path
    const path = window.location.pathname;

    // Find nav links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // Add active class to current page link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (path === href) {
            link.classList.add('active');
        }
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            boundary: document.body
        });
    });

    // Form validation styles
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Add animation to cards
    const cards = document.querySelectorAll('.animated-card');
    if (cards.length > 0) {
        const animateCards = () => {
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('card-visible');
                }, 100 * index);
            });
        };
        animateCards();
    }
});

// Function to format currency
function formatCurrency(value) {
    return '$' + parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Function to create a confirmation modal
function confirmAction(message, callback) {
    // Check if modal already exists
    let modal = document.getElementById('confirmationModal');

    // If not, create it
    if (!modal) {
        const modalHTML = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmationModalLabel">Confirm Action</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="confirmationMessage">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmBtn">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHTML;
        document.body.appendChild(div.firstChild);

        modal = document.getElementById('confirmationModal');
    } else {
        // Update message if modal exists
        document.getElementById('confirmationMessage').textContent = message;
    }

    // Get the modal instance
    const modalInstance = new bootstrap.Modal(modal);

    // Set up confirmation button
    const confirmBtn = document.getElementById('confirmBtn');

    // Remove any existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new event listener
    newConfirmBtn.addEventListener('click', function() {
        modalInstance.hide();
        callback();
    });

    // Show the modal
    modalInstance.show();
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
