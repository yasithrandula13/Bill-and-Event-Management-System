# Web-Based Bill and Event Reminder System

A secure, unified, and user-friendly web platform designed to help individuals consolidate their financial obligations and personal schedules into a single digital space. This system proactively reduces late utility payments and prevents forgotten commitments through automated reminder engines.

---

## 🚀 Key Features

### 1. User Management & Authentication
* **Secure Access:** Robust user registration and login system with passwords encrypted using `BCryptPasswordEncoder`.
* **Profile Control:** Complete user lifecycle management including profile updates, password changes, and account deletion.
* **Role-Based Access Control (RBAC):** Separate workflows and permissions for End Users and System Administrators.

### 2. Centralized Dashboard
* **Overview Metrics:** A personalized landing page showing active reminders, items due today, and an upcoming schedule breakdown for the week.
* **Quick Actions:** Easy-access shortcuts to add new entries instantly without navigating deep into menus.
* **Analytical Insights:** Dynamic charts tracking monthly billing trends and categorization distribution.

### 3. Comprehensive Bill Management
* **Full CRUD Operations:** Add, edit, view, and delete financial records including parameters for amount, due date, billing provider, and category.
* **Status Tracking:** Explicit classification of records as Paid or Unpaid.
* **Proactive Notifications:** Integrated reminder mechanisms that dispatch alerts at customizable intervals (e.g., 1, 3, or 7 days in advance).

### 4. Event & Schedule Management
* **Calendar Integration:** An interactive calendar view to plot and monitor time-sensitive personal or professional events.
* **Coordination:** Capabilities to add location, time, descriptions, and seamlessly share events with contacts and communities.

### 5. Contact & Community Management
* **Contact Directory:** Store stakeholder profiles (landlords, friends, colleagues) with phone numbers and emails.
* **Smart Linking:** Bind contacts directly to related bills (e.g., assigning a landlord to a rent bill entry).

### 6. Admin Panel & Support Infrastructure
* **Feedback Management:** Dedicated workspace for admins to gather user feedback and review system ratings.
* **Help Desk (Q&A):** Interactive module allowing users to search frequently asked questions or raise support tickets for technical resolution.

---

## 🛠️ Tech Stack

* **Backend Framework:** Java 17 / Spring Boot 3.5.6
* **Frontend Engine:** Thymeleaf, HTML5, CSS3, JavaScript (Bootstrap)
* **Database:** Microsoft SQL Server (MSSQL) via JDBC
* **Build Tool:** Maven
* **Application Server:** Embedded Tomcat 10.1
* **Testing Ecosystem:** Postman & Browser Integration Testing

---

## ⚙️ Setup and Installation

1. **Prerequisites:** Ensure you have **Java 17 JDK** and **Maven** installed locally.
2. **Database Setup:** 
   * Create an instance in **MSSQL Server**.
   * Update your database configurations (URL, Username, Password) inside the `src/main/resources/application.properties` file.
3. **Build the Application:**
```bash
   mvn clean install
