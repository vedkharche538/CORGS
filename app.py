from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import json
from datetime import datetime

app = Flask(__name__)

# Data storage file paths
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
SERVICES_FILE = os.path.join(DATA_DIR, 'services.json')
COSTS_FILE = os.path.join(DATA_DIR, 'costs.json')
ENVIRONMENTS_FILE = os.path.join(DATA_DIR, 'environments.json')
SERVICE_CATEGORIES_FILE = os.path.join(DATA_DIR, 'service_categories.json')

# Initialize data files if they don't exist
def initialize_data_files():
    if not os.path.exists(SERVICES_FILE):
        with open(SERVICES_FILE, 'w') as f:
            json.dump([], f)

    if not os.path.exists(COSTS_FILE):
        with open(COSTS_FILE, 'w') as f:
            json.dump([], f)

    if not os.path.exists(ENVIRONMENTS_FILE):
        with open(ENVIRONMENTS_FILE, 'w') as f:
            json.dump(['dev', 'qa', 'performance', 'sandbox', 'production'], f)

    if not os.path.exists(SERVICE_CATEGORIES_FILE):
        with open(SERVICE_CATEGORIES_FILE, 'w') as f:
            json.dump([
                'Compute (EC2, Lambda)', 
                'Database (RDS, Redshift, DynamoDB)', 
                'Storage (S3, EBS, EFS)', 
                'Networking (VPC, CloudFront, Route53)', 
                'Analytics (EMR, Athena, QuickSight)', 
                'Machine Learning (SageMaker, Comprehend)', 
                'Containers (ECS, EKS, Fargate)', 
                'Other'
            ], f)

# Load data from JSON files
def load_data(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except:
        return []

# Save data to JSON files
def save_data(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/services')
def services():
    services_data = load_data(SERVICES_FILE)
    categories = load_data(SERVICE_CATEGORIES_FILE)
    return render_template('services.html', services=services_data, categories=categories)

@app.route('/services/add', methods=['GET', 'POST'])
def add_service():
    if request.method == 'POST':
        service_name = request.form.get('service_name')
        service_description = request.form.get('service_description')
        service_category = request.form.get('service_category')

        services_data = load_data(SERVICES_FILE)

        # Check if service already exists
        for service in services_data:
            if service['name'] == service_name:
                categories = load_data(SERVICE_CATEGORIES_FILE)
                return render_template('add_service.html', error='Service already exists', categories=categories)

        services_data.append({
            'id': len(services_data) + 1,
            'name': service_name,
            'description': service_description,
            'category': service_category
        })

        save_data(services_data, SERVICES_FILE)
        return redirect(url_for('services'))

    categories = load_data(SERVICE_CATEGORIES_FILE)
    return render_template('add_service.html', categories=categories)

@app.route('/services/delete/<int:service_id>', methods=['POST'])
def delete_service(service_id):
    services_data = load_data(SERVICES_FILE)
    costs_data = load_data(COSTS_FILE)

    # Find service with the given ID
    service_index = None
    for i, service in enumerate(services_data):
        if service['id'] == service_id:
            service_index = i
            break

    if service_index is not None:
        # Remove service
        removed_service = services_data.pop(service_index)

        # Remove all costs associated with this service
        updated_costs = [cost for cost in costs_data if cost['service_id'] != service_id]

        # Update service IDs for consistency
        for i, service in enumerate(services_data):
            service['id'] = i + 1

        save_data(services_data, SERVICES_FILE)
        save_data(updated_costs, COSTS_FILE)

    return redirect(url_for('services'))

@app.route('/environments')
def environments():
    environments_data = load_data(ENVIRONMENTS_FILE)
    return render_template('environments.html', environments=environments_data)

@app.route('/environments/add', methods=['GET', 'POST'])
def add_environment():
    if request.method == 'POST':
        environment_name = request.form.get('environment_name')

        environments_data = load_data(ENVIRONMENTS_FILE)

        # Check if environment already exists
        if environment_name in environments_data:
            return render_template('add_environment.html', error='Environment already exists')

        environments_data.append(environment_name)
        save_data(environments_data, ENVIRONMENTS_FILE)
        return redirect(url_for('environments'))

    return render_template('add_environment.html')

@app.route('/environments/delete/<string:environment_name>', methods=['POST'])
def delete_environment(environment_name):
    environments_data = load_data(ENVIRONMENTS_FILE)
    costs_data = load_data(COSTS_FILE)

    # Remove environment if it exists
    if environment_name in environments_data:
        environments_data.remove(environment_name)

        # Remove all costs associated with this environment
        updated_costs = [cost for cost in costs_data if cost['environment'] != environment_name]

        save_data(environments_data, ENVIRONMENTS_FILE)
        save_data(updated_costs, COSTS_FILE)

    return redirect(url_for('environments'))

@app.route('/service-categories')
def service_categories():
    categories = load_data(SERVICE_CATEGORIES_FILE)
    return render_template('service_categories.html', categories=categories)

@app.route('/service-categories/add', methods=['GET', 'POST'])
def add_service_category():
    if request.method == 'POST':
        category_name = request.form.get('category_name')

        categories = load_data(SERVICE_CATEGORIES_FILE)

        # Check if category already exists
        if category_name in categories:
            return render_template('add_service_category.html', error='Category already exists')

        categories.append(category_name)
        save_data(categories, SERVICE_CATEGORIES_FILE)
        return redirect(url_for('service_categories'))

    return render_template('add_service_category.html')

@app.route('/service-categories/delete/<string:category_name>', methods=['POST'])
def delete_service_category(category_name):
    categories = load_data(SERVICE_CATEGORIES_FILE)
    services_data = load_data(SERVICES_FILE)

    # Check if there are services using this category
    services_using_category = [service for service in services_data if service.get('category') == category_name]

    if services_using_category:
        # Don't delete categories that are in use
        return redirect(url_for('service_categories'))

    # Remove category if it exists and is not in use
    if category_name in categories:
        categories.remove(category_name)
        save_data(categories, SERVICE_CATEGORIES_FILE)

    return redirect(url_for('service_categories'))

@app.route('/costs')
def costs():
    costs_data = load_data(COSTS_FILE)
    services_data = load_data(SERVICES_FILE)
    environments_data = load_data(ENVIRONMENTS_FILE)

    return render_template('costs.html', 
                           costs=costs_data, 
                           services=services_data, 
                           environments=environments_data)

@app.route('/costs/add', methods=['GET', 'POST'])
def add_cost():
    if request.method == 'POST':
        service_id = int(request.form.get('service_id'))
        environment = request.form.get('environment')
        cost_amount = float(request.form.get('cost_amount'))
        month = request.form.get('month')
        year = int(request.form.get('year'))

        costs_data = load_data(COSTS_FILE)

        costs_data.append({
            'id': len(costs_data) + 1,
            'service_id': service_id,
            'environment': environment,
            'cost': cost_amount,
            'month': month,
            'year': year,
            'date_added': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })

        save_data(costs_data, COSTS_FILE)
        return redirect(url_for('costs'))

    services_data = load_data(SERVICES_FILE)
    environments_data = load_data(ENVIRONMENTS_FILE)

    return render_template('add_cost.html', 
                           services=services_data, 
                           environments=environments_data)

@app.route('/costs/delete/<int:cost_id>', methods=['POST'])
def delete_cost(cost_id):
    costs_data = load_data(COSTS_FILE)

    # Find cost with the given ID
    cost_index = None
    for i, cost in enumerate(costs_data):
        if cost['id'] == cost_id:
            cost_index = i
            break

    if cost_index is not None:
        # Remove cost
        costs_data.pop(cost_index)

        # Update cost IDs for consistency
        for i, cost in enumerate(costs_data):
            cost['id'] = i + 1

        save_data(costs_data, COSTS_FILE)

    return redirect(url_for('costs'))

@app.route('/dashboard')
def dashboard():
    environments_data = load_data(ENVIRONMENTS_FILE)
    return render_template('dashboard.html', environments=environments_data)

@app.route('/api/costs_by_environment')
def api_costs_by_environment():
    month = request.args.get('month', 'all')
    year = request.args.get('year', 'all')

    costs_data = load_data(COSTS_FILE)
    services_data = {s['id']: s['name'] for s in load_data(SERVICES_FILE)}

    # Filter by month and year if specified
    if month != 'all':
        costs_data = [cost for cost in costs_data if cost['month'] == month]

    if year != 'all':
        try:
            year_int = int(year)
            costs_data = [cost for cost in costs_data if cost['year'] == year_int]
        except ValueError:
            pass  # Invalid year format, don't filter

    result = {}
    for cost in costs_data:
        env = cost['environment']
        if env not in result:
            result[env] = 0
        result[env] += cost['cost']

    # Convert to list format for charts
    chart_data = [{'environment': env, 'cost': cost} for env, cost in result.items()]

    return jsonify(chart_data)

@app.route('/api/costs_by_service')
def api_costs_by_service():
    month = request.args.get('month', 'all')
    year = request.args.get('year', 'all')

    costs_data = load_data(COSTS_FILE)
    services_data = {s['id']: s['name'] for s in load_data(SERVICES_FILE)}

    # Filter by month and year if specified
    if month != 'all':
        costs_data = [cost for cost in costs_data if cost['month'] == month]

    if year != 'all':
        try:
            year_int = int(year)
            costs_data = [cost for cost in costs_data if cost['year'] == year_int]
        except ValueError:
            pass  # Invalid year format, don't filter

    result = {}
    for cost in costs_data:
        service_id = cost['service_id']
        service_name = services_data.get(service_id, f'Unknown ({service_id})')
        if service_name not in result:
            result[service_name] = 0
        result[service_name] += cost['cost']

    # Convert to list format for charts
    chart_data = [{'service': service, 'cost': cost} for service, cost in result.items()]

    return jsonify(chart_data)

# This function has been moved below with filter support

# This function has been moved below with filter support

@app.route('/api/costs_by_category')
def api_costs_by_category():
    month = request.args.get('month', 'all')
    year = request.args.get('year', 'all')

    costs_data = load_data(COSTS_FILE)
    services_data = load_data(SERVICES_FILE)

    # Filter by month and year if specified
    if month != 'all':
        costs_data = [cost for cost in costs_data if cost['month'] == month]

    if year != 'all':
        try:
            year_int = int(year)
            costs_data = [cost for cost in costs_data if cost['year'] == year_int]
        except ValueError:
            pass  # Invalid year format, don't filter

    # Create a lookup dictionary for service categories
    service_categories = {}
    for service in services_data:
        service_categories[service['id']] = service.get('category', 'Other')

    # Group costs by category
    result = {}
    for cost in costs_data:
        service_id = cost['service_id']
        category = service_categories.get(service_id, 'Other')

        if category not in result:
            result[category] = 0

        result[category] += cost['cost']

    # Convert to list format for charts
    chart_data = [{'category': category, 'cost': cost} for category, cost in result.items()]

    return jsonify(chart_data)

@app.route('/api/costs_by_month/<int:year>')
def api_costs_by_month(year):
    costs_data = load_data(COSTS_FILE)

    # Filter costs by year and group by month
    result = {}
    for cost in costs_data:
        if cost['year'] == year:
            month = cost['month']
            if month not in result:
                result[month] = 0
            result[month] += cost['cost']

    # Sort by month
    months_order = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
        'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    }

    sorted_data = [(month, cost) for month, cost in result.items()]
    sorted_data.sort(key=lambda x: months_order[x[0]])

    chart_data = [{'month': month, 'cost': cost} for month, cost in sorted_data]

    return jsonify(chart_data)

# This function has been defined again below - removing this duplicate

# API endpoint for costs by environment and service with filtering
@app.route('/api/costs_by_environment_and_service')
def api_costs_by_environment_and_service():
    month = request.args.get('month', 'all')
    year = request.args.get('year', 'all')

    costs_data = load_data(COSTS_FILE)
    services_data = {s['id']: s['name'] for s in load_data(SERVICES_FILE)}

    # Filter by month and year if specified
    if month != 'all':
        costs_data = [cost for cost in costs_data if cost['month'] == month]

    if year != 'all':
        try:
            year_int = int(year)
            costs_data = [cost for cost in costs_data if cost['year'] == year_int]
        except ValueError:
            pass  # Invalid year format, don't filter

    result = {}
    for cost in costs_data:
        env = cost['environment']
        service_id = cost['service_id']
        service_name = services_data.get(service_id, f'Unknown ({service_id})')

        if env not in result:
            result[env] = {}

        if service_name not in result[env]:
            result[env][service_name] = 0

        result[env][service_name] += cost['cost']

    return jsonify(result)

# API endpoint for costs trend with filtering
@app.route('/api/costs_trend')
def api_costs_trend():
    month = request.args.get('month', 'all')
    year = request.args.get('year', 'all')

    costs_data = load_data(COSTS_FILE)

    # Filter by year if specified
    if year != 'all':
        try:
            year_int = int(year)
            costs_data = [cost for cost in costs_data if cost['year'] == year_int]
        except ValueError:
            pass  # Invalid year format, don't filter

    # Group costs by month and year
    result = {}
    for cost in costs_data:
        period = f"{cost['month']} {cost['year']}"

        # If month filter is applied, only include data for that month
        if month != 'all' and cost['month'] != month:
            continue

        if period not in result:
            result[period] = 0
        result[period] += cost['cost']

    # Sort by year and month
    months_order = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
        'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    }

    sorted_data = []
    for period, cost in result.items():
        month, year = period.split(' ')
        sorted_data.append({
            'period': period,
            'cost': cost,
            'sort_key': (int(year), months_order[month])
        })

    sorted_data.sort(key=lambda x: x['sort_key'])
    chart_data = [{'period': item['period'], 'cost': item['cost']} for item in sorted_data]

    return jsonify(chart_data)

# Dashboard summary endpoint for key metrics
@app.route('/api/dashboard_summary')
def api_dashboard_summary():
    month = request.args.get('month', 'all')
    year = request.args.get('year', 'all')

    costs_data = load_data(COSTS_FILE)
    services_data = load_data(SERVICES_FILE)
    environments_data = load_data(ENVIRONMENTS_FILE)
    categories_data = load_data(SERVICE_CATEGORIES_FILE)

    # Filter costs by month and year if specified
    if month != 'all':
        costs_data = [cost for cost in costs_data if cost['month'] == month]

    if year != 'all':
        try:
            year_int = int(year)
            costs_data = [cost for cost in costs_data if cost['year'] == year_int]
        except ValueError:
            pass  # Invalid year format, don't filter

    # Calculate total cost
    total_cost = sum(cost['cost'] for cost in costs_data)

    # Get unique service IDs from costs
    service_ids = set(cost['service_id'] for cost in costs_data)

    # Get service count (either filtered or total)
    if month == 'all' and year == 'all':
        service_count = len(services_data)
    else:
        service_count = len(service_ids)

    # Get environment count (either total or used in filtered costs)
    if month == 'all' and year == 'all':
        environment_count = len(environments_data)
    else:
        environment_count = len(set(cost['environment'] for cost in costs_data))

    # Always return total category count
    category_count = len(categories_data)

    return jsonify({
        'total_cost': total_cost,
        'service_count': service_count,
        'environment_count': environment_count,
        'category_count': category_count
    })

# Initialize data files when app starts
initialize_data_files()

if __name__ == '__main__':
    app.run(debug=True)
