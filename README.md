# Cloud Services Cost Manager

A Flask web application for tracking and visualizing costs for various cloud services across different environments.

## Features

- Track costs for various cloud services across multiple environments (dev, qa, performance, sandbox, etc.)
- Categorize services by type (Compute, Database, Storage, Networking, etc.)
- Add and manage services and environments
- Record monthly cost data for each service/environment combination
- Visualize cost data with interactive charts and graphs
- Monitor cost trends over time
- Analyze costs by service category, environment, and individual services

## Tech Stack

- **Backend**: Python Flask
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Data Visualization**: Chart.js
- **Data Storage**: JSON files (can be extended to use databases)

## Setup Instructions

### Prerequisites

- Python 3.13.3 or higher
- virtualenv (for managing Python environment)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd cloud-services-cost-manager
```

2. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Run the application

```bash
python app.py
```

5. Access the application in your web browser at http://127.0.0.1:5000/

## Usage

1. **Manage Services**: Navigate to the Services page to add or delete cloud services you want to track.
2. **Manage Service Categories**: Use the Categories page to organize your services into logical groups.
3. **Manage Environments**: Go to the Environments page to add or remove your different deployment environments.
4. **Record Costs**: Use the Costs page to record and manage monthly cost data for each service/environment combination.
5. **View Dashboard**: Visit the Dashboard page to visualize your cost data through various charts and graphs.

## Project Structure

```
cloud-services-cost-manager/
├── app.py                  # Main Flask application
├── data/                   # JSON data storage
│   ├── services.json       # Services data
│   ├── costs.json          # Cost entries data
│   ├── environments.json   # Environments data
│   └── service_categories.json # Service categories data
├── static/                 # Static assets
│   ├── css/                # CSS stylesheets
│   └── js/                 # JavaScript files
├── templates/              # HTML templates
│   ├── base.html           # Base template
│   ├── index.html          # Homepage
│   ├── services.html       # Services listing with delete functionality
│   ├── add_service.html    # Add service form
│   ├── service_categories.html # Service categories listing with delete functionality
│   ├── add_service_category.html # Add service category form
│   ├── environments.html   # Environments listing with delete functionality
│   ├── add_environment.html # Add environment form
│   ├── costs.html          # Costs listing with delete functionality
│   ├── add_cost.html       # Add cost form
│   └── dashboard.html      # Dashboard with charts
└── requirements.txt        # Project dependencies
```

## Future Enhancements

- Add user authentication and role-based access control
- Implement a database backend (SQLite, PostgreSQL, etc.)
- Add export functionality (CSV, Excel, PDF)
- Include notification system for cost anomalies
- Add budget planning and forecasting features

## License

This project is licensed under the MIT License - see the LICENSE file for details.
