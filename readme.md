### Potential ERD for the project:

```mermaid
erDiagram
    USERS {
        int user_id PK
        string name
        string email
        string phone_number
        string phone_type
        string role
        datetime created_at
        datetime updated_at
    }
    
    SCHOOLS {
        int school_id PK
        string name
        boolean greenstar_status
        string funding_org_code
        string title_1_info
        string city
        string county
        string district
        string address
        string languages
        datetime created_at
        datetime updated_at
    }
    
    REQUESTS {
        int request_id PK
        int user_id FK
        int school_id FK
        string contact_name
        string contact_email
        string contact_phone_number
        string contact_phone_type
        string best_contact_time
        string grade_levels
        string status
        string communication_level
        string notes
        datetime created_at
        datetime updated_at
    }
    
    TRAININGS {
        int training_id PK
        int request_id FK
        string title
        string subject_category
        string training_kit
        string preferred_dates_times
        datetime agreed_date_time
        int number_of_classrooms
        int number_of_students
        int number_of_adults
        string facilitators
        datetime created_at
        datetime updated_at
    }

    CALENDAR {
        int calendar_id PK
        int training_id FK
        datetime event_date_time
        string color_code
        datetime created_at
        datetime updated_at
    }

    USERS ||--o{ REQUESTS: "submits"
    SCHOOLS ||--o{ REQUESTS: "associated with"
    REQUESTS ||--o{ TRAININGS: "includes"
    TRAININGS ||--o{ CALENDAR: "scheduled in"

```

<hr> 

## Wireframe for the project (First Draft & MVP - Subject to Change):

### Dashboard Page:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <style>
    .background { fill: #f0f0f0; }
    .sidebar { fill: #2c3e50; }
    .main-content { fill: #ffffff; }
    .header { fill: #3498db; }
    .card { fill: #ecf0f1; stroke: #bdc3c7; stroke-width: 2; }
    .text { font-family: Arial, sans-serif; }
    .title { font-size: 20px; fill: #2c3e50; }
    .subtitle { font-size: 16px; fill: #7f8c8d; }
    .nav-item { font-size: 14px; fill: #ffffff; cursor: pointer; } /* Normal state */
    .nav-item:hover { fill: #3498db; } /* Hover state */
    .nav-item.selected { fill: #1abc9c; font-weight: bold; } /* Selected state */
    .metric { font-size: 24px; fill: #2c3e50; font-weight: bold; }
  </style>

  <!-- Background -->
  <rect width="800" height="600" class="background" />

  <!-- Sidebar -->
  <rect width="200" height="600" class="sidebar" />

  <!-- Navigation Items -->
  <g id="nav-items">
    <text x="20" y="40" class="text nav-item selected">Dashboard</text>
    <text x="20" y="80" class="text nav-item">Requests</text>
    <text x="20" y="120" class="text nav-item">Schools</text>
    <text x="20" y="160" class="text nav-item">Users</text>
    <text x="20" y="200" class="text nav-item">Calendar</text>
    <text x="20" y="240" class="text nav-item">Reports</text>
  </g>

  <!-- Main Content Area -->
  <rect x="200" y="0" width="600" height="600" class="main-content" />

  <!-- Header -->
  <rect x="200" y="0" width="600" height="60" class="header" />
  <text x="220" y="38" class="text title">Eco-Cycle Dashboard</text>

  <!-- Metric Cards -->
  <rect x="220" y="80" width="180" height="100" rx="10" class="card" />
  <text x="310" y="120" class="text subtitle" text-anchor="middle">Total Schools</text>
  <text x="310" y="150" class="text metric" text-anchor="middle">250</text>

  <rect x="420" y="80" width="180" height="100" rx="10" class="card" />
  <text x="510" y="120" class="text subtitle" text-anchor="middle">Active Requests</text>
  <text x="510" y="150" class="text metric" text-anchor="middle">42</text>

  <rect x="620" y="80" width="180" height="100" rx="10" class="card" />
  <text x="710" y="120" class="text subtitle" text-anchor="middle">Upcoming Events</text>
  <text x="710" y="150" class="text metric" text-anchor="middle">15</text>

  <!-- Recent Activity Section -->
  <rect x="220" y="200" width="280" height="380" rx="10" class="card" />
  <text x="240" y="230" class="text subtitle">Recent Activity</text>

  <!-- Calendar Section -->
  <rect x="520" y="200" width="280" height="380" rx="10" class="card" />
  <text x="540" y="230" class="text subtitle">Upcoming Schedule</text>
</svg>

<hr>

### Request Management Page:

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">
  <style>
    .background { fill: #f0f0f0; }
    .sidebar { fill: #2c3e50; }
    .header { fill: #3498db; }
    .button { fill: #1abc9c; cursor: pointer; }
    .button:hover { fill: #16a085; }
    .text { font-family: Arial, sans-serif; }
    .title { font-size: 24px; fill: #ffffff; }
    .nav-item { font-size: 14px; fill: #ffffff; cursor: pointer; }
    .nav-item:hover { fill: #3498db; }
    .nav-item.selected { fill: #1abc9c; font-weight: bold; }
    .search-box { fill: #ffffff; stroke: #bdc3c7; stroke-width: 2; }
    .filter { fill: #ecf0f1; stroke: #bdc3c7; stroke-width: 2; }
    .request-list { fill: #ecf0f1; stroke: #bdc3c7; stroke-width: 2; }
    .filter-button { font-size: 14px; fill: #7f8c8d; cursor: pointer; }
    .filter-button:hover { fill: #3498db; }
    .add-button-text { font-size: 14px; fill: #ffffff; font-weight: bold; }
    .search-text { font-size: 14px; fill: #7f8c8d; }
  </style>

  <!-- Background -->
  <rect width="1000" height="600" class="background" />

  <!-- Sidebar -->
  <rect width="200" height="600" class="sidebar" />
  <g style="isolation: isolate;">
    <text x="20" y="40" class="text nav-item">Dashboard</text>
    <text x="20" y="80" class="text nav-item selected">Requests</text>
    <text x="20" y="120" class="text nav-item">Schools</text>
    <text x="20" y="160" class="text nav-item">Users</text>
    <text x="20" y="200" class="text nav-item">Calendar</text>
    <text x="20" y="240" class="text nav-item">Reports</text>
  </g>

  <!-- Main Content Area -->
  <rect x="200" y="0" width="800" height="600" class="main-content" />

  <!-- Header with Title and Add Button -->
  <rect x="200" y="0" width="800" height="60" class="header" />
  <text x="220" y="38" class="text title">Request Management</text>

  <!-- Add New Request Button -->
  <rect x="800" y="15" width="150" height="30" rx="5" class="button" />
  <text x="830" y="35" class="text add-button-text">+ New Request</text>

  <!-- Search Bar -->
  <rect x="220" y="80" width="450" height="30" rx="5" class="search-box" />
  <text x="230" y="100" class="text search-text">Search requests...</text>

  <!-- Filter Section -->
  <rect x="690" y="80" width="120" height="30" rx="5" class="filter" />
  <text x="700" y="100" class="text filter-button">Filter by Status</text>
  <rect x="820" y="80" width="120" height="30" rx="5" class="filter" />
  <text x="830" y="100" class="text filter-button">Filter by Date</text>

  <!-- Request List Header -->
  <rect x="220" y="130" width="720" height="40" class="request-list" />
  <text x="230" y="155" class="text search-text">Request ID</text>
  <text x="400" y="155" class="text search-text">Requester</text>
  <text x="600" y="155" class="text search-text">Status</text>
  <text x="800" y="155" class="text search-text">Date</text>

  <!-- Request List Items (example of 3 items) -->
  <rect x="220" y="180" width="720" height="40" class="request-list" />
  <text x="230" y="205" class="text search-text">REQ-001</text>
  <text x="400" y="205" class="text search-text">John Doe</text>
  <text x="600" y="205" class="text search-text">Pending</text>
  <text x="800" y="205" class="text search-text">2024-09-01</text>

  <rect x="220" y="230" width="720" height="40" class="request-list" />
  <text x="230" y="255" class="text search-text">REQ-002</text>
  <text x="400" y="255" class="text search-text">Jane Smith</text>
  <text x="600" y="255" class="text search-text">Completed</text>
  <text x="800" y="255" class="text search-text">2024-09-05</text>

  <rect x="220" y="280" width="720" height="40" class="request-list" />
  <text x="230" y="305" class="text search-text">REQ-003</text>
  <text x="400" y="305" class="text search-text">Michael Lee</text>
  <text x="600" y="305" class="text search-text">In Progress</text>
  <text x="800" y="305" class="text search-text">2024-09-06</text>
</svg>
