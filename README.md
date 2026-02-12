# Cayco Business Operating System - Frontend
owner@demo.com / password123
A comprehensive Business Operating System built with React and Tailwind CSS.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Component Structure](#component-structure)
- [User Roles & Permissions](#user-roles--permissions)

## Overview

Cayco is a full-stack business operating system designed to help businesses manage their operations, track costs, manage customers, get paid, and make data-driven decisions—all in one integrated platform.

## Features

### Core Products
- **Scheduling**: Manage and schedule jobs with team assignments
- **Reporting**: Comprehensive reports and analytics
- **Job Costing**: Track labor, materials, equipment, and other costs
- **Estimating**: Create and manage estimates for customers
- **CRM**: Customer relationship management
- **Invoicing**: Generate and manage invoices with print functionality

### Key Features
- Multi-tenant architecture with complete data isolation
- Role-based access control (RBAC)
- Real-time updates via Socket.io
- Responsive design (mobile-first)
- Professional UI with Tailwind CSS
- Email notifications for invites
- Analytics and statistics dashboard

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional, defaults work for development):
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

3. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Development Workflow

### Project Structure
```
src/
├── components/       # Reusable UI components
│   ├── Layout.js    # Main layout with navbar and sidebar
│   └── ProtectedRoute.js  # Route protection with permissions
├── context/          # React Context providers
│   ├── AuthContext.js     # Authentication and user management
│   └── SocketContext.js   # Socket.io real-time updates
├── pages/            # Page components
│   ├── auth/        # Authentication pages
│   ├── Dashboard.js # Main dashboard
│   ├── jobs/        # Job management pages
│   ├── customers/   # CRM pages
│   ├── estimates/   # Estimate pages
│   ├── invoices/    # Invoice pages
│   ├── schedules/   # Scheduling pages
│   └── reports/     # Reports pages
├── config/          # Configuration files
│   └── api.js       # Axios API configuration
└── App.js           # Main app component with routing
```

### Authentication Flow

1. **Registration**: Company Owner signs up → Creates company → Gets JWT token
2. **Login**: User logs in → Gets JWT token → Redirected to dashboard
3. **Invite Flow**: Admin invites user → Email sent → User clicks link → Sets password → Logs in

### Socket.io Integration

Real-time updates are automatically pushed when:
- New jobs are created/updated
- Schedules change
- Notifications are sent

Connect to company room: `company-{companyId}`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

All requests require authentication via Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

### Authentication APIs

#### POST `/auth/register`
Register a new company owner.

**Request Body:**
```json
{
  "email": "owner@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "My Company",
  "phone": "555-0100"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "owner@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Company Owner",
    "companyId": "company_id"
  }
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### POST `/auth/invite`
Invite a new user to the company.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "Estimator"
}
```

**Roles:** `Company Owner`, `Operations Manager`, `Estimator`, `Accountant`, `Staff`, `Client`

#### GET `/auth/invite/:token`
Verify invite token and get invite details.

#### POST `/auth/accept-invite`
Accept invitation and set password.

**Request Body:**
```json
{
  "token": "invite_token",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### GET `/auth/me`
Get current authenticated user.

### Jobs APIs

#### GET `/jobs`
Get all jobs for the company.

**Query Parameters:**
- `status`: Filter by status (Quote, Scheduled, In Progress, Completed, Cancelled, On Hold)
- `customerId`: Filter by customer
- `assignedTo`: Filter by assigned user
- `search`: Search in job number, title, description

#### GET `/jobs/:id`
Get single job details.

#### POST `/jobs`
Create a new job.

**Request Body:**
```json
{
  "customerId": "customer_id",
  "title": "Job Title",
  "description": "Job description",
  "status": "Scheduled",
  "priority": "High",
  "startDate": "2024-01-01",
  "endDate": "2024-01-10",
  "assignedTo": ["user_id1", "user_id2"],
  "costs": {
    "labor": { "estimated": 1000, "actual": 0 },
    "materials": { "estimated": 2000, "actual": 0 },
    "equipment": { "estimated": 500, "actual": 0 },
    "subcontractors": { "estimated": 0, "actual": 0 },
    "overhead": { "estimated": 350, "actual": 0 }
  },
  "revenue": 5000
}
```

#### PUT `/jobs/:id`
Update a job.

#### DELETE `/jobs/:id`
Delete a job.

### Customers APIs

#### GET `/customers`
Get all customers.

**Query Parameters:**
- `status`: Filter by status (Active, Inactive, Lead)
- `type`: Filter by type (Residential, Commercial)
- `search`: Search in name, email, company

#### GET `/customers/:id`
Get single customer details.

#### POST `/customers`
Create a new customer.

**Request Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Anderson",
  "email": "alice@example.com",
  "phone": "555-0100",
  "company": "Company Name",
  "type": "Commercial",
  "status": "Active",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

#### PUT `/customers/:id`
Update a customer.

#### DELETE `/customers/:id`
Delete a customer.

### Estimates APIs

#### GET `/estimates`
Get all estimates.

**Query Parameters:**
- `status`: Filter by status (Draft, Sent, Accepted, Rejected, Expired)
- `customerId`: Filter by customer
- `search`: Search in estimate number, title

#### GET `/estimates/:id`
Get single estimate details.

#### POST `/estimates`
Create a new estimate.

**Request Body:**
```json
{
  "customerId": "customer_id",
  "title": "Project Estimate",
  "description": "Estimate description",
  "status": "Draft",
  "lineItems": [
    {
      "description": "Labor - Installation",
      "quantity": 8,
      "unit": "hours",
      "unitPrice": 50,
      "markup": 25,
      "category": "Labor"
    },
    {
      "description": "Materials",
      "quantity": 100,
      "unit": "sqft",
      "unitPrice": 15,
      "markup": 30,
      "category": "Materials"
    }
  ],
  "taxRate": 8,
  "discount": 0,
  "validUntil": "2024-02-01"
}
```

#### PUT `/estimates/:id`
Update an estimate.

#### POST `/estimates/:id/accept`
Accept an estimate and create a job from it.

#### DELETE `/estimates/:id`
Delete an estimate.

### Invoices APIs

#### GET `/invoices`
Get all invoices.

**Query Parameters:**
- `status`: Filter by status (Draft, Sent, Paid, Partial, Overdue, Cancelled)
- `customerId`: Filter by customer
- `search`: Search in invoice number

#### GET `/invoices/:id`
Get single invoice details.

#### POST `/invoices`
Create a new invoice.

**Request Body:**
```json
{
  "customerId": "customer_id",
  "jobId": "job_id",
  "status": "Draft",
  "issueDate": "2024-01-01",
  "dueDate": "2024-01-31",
  "lineItems": [
    {
      "description": "Invoice for Job #123",
      "quantity": 1,
      "unit": "job",
      "unitPrice": 5000,
      "total": 5000
    }
  ],
  "taxRate": 8,
  "discount": 0,
  "paymentTerms": "Net 30"
}
```

#### PUT `/invoices/:id`
Update an invoice (including payment tracking).

**Request Body (for payment):**
```json
{
  "paidAmount": 2500,
  "status": "Partial"
}
```

#### DELETE `/invoices/:id`
Delete an invoice.

### Schedules APIs

#### GET `/schedules`
Get all schedules.

**Query Parameters:**
- `startDate`: Filter from date
- `endDate`: Filter to date
- `assignedTo`: Filter by assigned user
- `status`: Filter by status

#### GET `/schedules/:id`
Get single schedule details.

#### POST `/schedules`
Create a new schedule.

**Request Body:**
```json
{
  "jobId": "job_id",
  "customerId": "customer_id",
  "title": "Installation Schedule",
  "description": "Schedule description",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T17:00:00Z",
  "assignedTo": ["user_id1"],
  "location": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "status": "Scheduled"
}
```

#### PUT `/schedules/:id`
Update a schedule.

#### DELETE `/schedules/:id`
Delete a schedule.

### Reports APIs

#### GET `/reports/jobs`
Get job reports with statistics.

**Query Parameters:**
- `startDate`: Start date filter
- `endDate`: End date filter
- `status`: Filter by status

**Response includes:**
- Jobs data
- Statistics: total, byStatus, totalRevenue, totalCosts, totalProfit, profitMargin

#### GET `/reports/invoices`
Get invoice reports with statistics.

**Response includes:**
- Invoices data
- Statistics: total, byStatus, totalAmount, paidAmount, outstandingAmount

#### GET `/reports/customers`
Get customer reports with statistics.

#### GET `/reports/profit-loss`
Get profit & loss report.

**Response includes:**
- Revenue
- Costs breakdown (labor, materials, equipment, subcontractors, overhead)
- Total costs
- Profit
- Profit margin

### Analytics APIs

#### GET `/analytics/dashboard`
Get dashboard analytics data.

**Response includes:**
- Overview: totalJobs, activeJobs, totalCustomers, totalInvoices, pendingInvoices, totalEstimates, scheduledJobs
- Financial: totalRevenue, outstandingAmount, totalCosts, totalProfit, profitMargin
- Recent activity: jobs, invoices
- Charts data: jobsByStatus, revenueTrend

### Users APIs

#### GET `/users`
Get all users in the company.

#### GET `/users/:id`
Get single user details.

#### PUT `/users/:id`
Update a user (admin only for isActive).

#### PUT `/users/profile/update`
Update own profile.

#### PUT `/users/profile/password`
Update own password.

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Companies APIs

#### GET `/companies/me`
Get own company details.

#### PUT `/companies/me`
Update company settings.

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "industry": "Construction",
  "phone": "555-0100",
  "email": "contact@company.com",
  "pricingRules": {
    "defaultMarkup": 0.25,
    "laborRate": 50
  },
  "settings": {
    "currency": "USD",
    "timezone": "America/New_York"
  }
}
```

#### PUT `/companies/onboarding-complete`
Mark onboarding as complete.

### Notifications APIs

#### GET `/notifications`
Get all notifications for the user.

**Query Parameters:**
- `isRead`: Filter by read status (true/false)
- `limit`: Limit results (default: 50)

#### GET `/notifications/:id`
Get single notification.

#### PUT `/notifications/:id/read`
Mark notification as read.

#### PUT `/notifications/read-all`
Mark all notifications as read.

#### DELETE `/notifications/:id`
Delete a notification.

## User Roles & Permissions

### Role Hierarchy

1. **Super Admin**: Full system access (platform operator)
2. **Company Owner**: Full company access
3. **Operations Manager**: Operations management
4. **Estimator**: Estimates and customer management
5. **Accountant**: Financial management
6. **Staff**: Field work execution
7. **Client**: View own data only

### Permission Matrix

| Permission | Super Admin | Company Owner | Ops Manager | Estimator | Accountant | Staff | Client |
|------------|-------------|---------------|-------------|-----------|------------|-------|--------|
| `*` (All) | ✓ | ✓ | - | - | - | - | - |
| `jobs.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓* |
| `jobs.create` | ✓ | ✓ | ✓ | - | - | - | - |
| `jobs.edit` | ✓ | ✓ | ✓ | - | - | ✓ | - |
| `jobs.delete` | ✓ | ✓ | ✓ | - | - | - | - |
| `schedules.view` | ✓ | ✓ | ✓ | - | - | ✓ | ✓* |
| `schedules.create` | ✓ | ✓ | ✓ | - | - | - | - |
| `customers.view` | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓* |
| `customers.create` | ✓ | ✓ | ✓ | ✓ | - | - | - |
| `estimates.view` | ✓ | ✓ | ✓ | ✓ | - | - | - |
| `estimates.create` | ✓ | ✓ | ✓ | ✓ | - | - | - |
| `invoices.view` | ✓ | ✓ | ✓ | - | ✓ | - | ✓* |
| `invoices.create` | ✓ | ✓ | - | - | ✓ | - | - |
| `reports.view` | ✓ | ✓ | ✓ | - | ✓ | - | - |
| `users.view` | ✓ | ✓ | ✓ | - | - | - | - |
| `users.invite` | ✓ | ✓ | ✓ | - | - | - | - |

\* Clients can only view their own data

## Socket.io Events

### Client → Server
- `join-company`: Join company room for real-time updates
  ```javascript
  socket.emit('join-company', companyId);
  ```

### Server → Client
- `job:created`: New job created
- `job:updated`: Job updated
- `schedule:created`: New schedule created
- `schedule:updated`: Schedule updated

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Testing

Default test accounts (after seeding data):
- Super Admin: `admin@cayco.com` / `admin123`
- Company Owner: `owner@demo.com` / `password123`
- Operations Manager: `ops@demo.com` / `password123`
- Estimator: `estimator@demo.com` / `password123`
- Accountant: `accountant@demo.com` / `password123`
- Staff: `staff1@demo.com` / `password123`

## Support

For issues or questions, please refer to the backend API documentation or contact support.
