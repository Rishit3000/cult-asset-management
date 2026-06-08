# Cultural Council Asset Management System

An end-to-end full-stack web application designed to streamline shared resource allocation, track equipment inventory levels, and manage booking pipelines.

## 🛠️ Tech Stack & Architecture
- **Frontend:** React.js, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT) for authentication
- **Database:** PostgreSQL (Relational Storage with procedural triggers)

---

## 🚀 Key Functional Capabilities

### A. Authentication & Authorization
- **Role-Based Access Control (RBAC):** Separate user experiences for `admin` and `consumer` roles.
- **Secure Sessions:** Route protection enforced using JWT authentication headers.

### B. Asset Inventory Management
- **Live Search & Filter:** Dynamic catalog browsing with query params processing.
- **Admin Control Matrix:** Full CRUD capabilities for adding, updating, and removing inventory gear.

### C. Booking & Approval Workflow
- **Validation Constraints:** Requests cannot exceed maximum available stock limits.
- **PostgreSQL Automation Triggers:** Real-time asset inventory subtraction executing directly at the database layer immediately upon administrator approval.

### D. Personal Workspace
- **Borrowing History Log:** Dedicated user dashboard tracking ongoing allocation cycles and historical states (`pending`, `approved`, `rejected`).

---

## 📋 System Setup Instructions

### 1. Database Initialization
Create a PostgreSQL database named `asset_management` and execute the structural commands provided in the `schema.sql` file.

### 2. Backend Server Installation
```bash
cd backend
npm install
node server.js