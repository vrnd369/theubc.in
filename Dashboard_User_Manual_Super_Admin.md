# Dashboard User Manual - Super Admin

**Version 1.0**  
**Last Updated: December 2024**  
**Role: Super Admin - Full Access**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Your Role & Access](#2-your-role--access)
3. [Dashboard Navigation](#3-dashboard-navigation)
4. [Module-Wise Functionality](#4-module-wise-functionality)
   - [4.1 Navigation Management](#41-navigation-management)
   - [4.2 Header Styling](#42-header-styling)
   - [4.3 Home Management](#43-home-management)
   - [4.4 About Management](#44-about-management)
   - [4.5 Contact Management](#45-contact-management)
   - [4.6 Careers Management](#46-careers-management)
   - [4.7 Product Management](#47-product-management)
   - [4.8 Brand Pages Management](#48-brand-pages-management)
   - [4.9 Footer Management](#49-footer-management)
   - [4.10 Enquiry Form Management](#410-enquiry-form-management)
   - [4.11 User Management](#411-user-management)
   - [4.12 Audit Logs](#412-audit-logs)
   - [4.13 Data Migration](#413-data-migration)
   - [4.14 Module Visibility Control](#414-module-visibility-control)
5. [Product & Brand Management Logic](#5-product--brand-management-logic)
6. [Forms & Enquiries](#6-forms--enquiries)
7. [User Management Guide](#7-user-management-guide)
8. [Audit Logs & Monitoring](#8-audit-logs--monitoring)
9. [Global Rules & System Behavior](#9-global-rules--system-behavior)
10. [Common Errors & Troubleshooting](#10-common-errors--troubleshooting)
11. [Best Practices](#11-best-practices)
12. [Advanced Features](#12-advanced-features)

---

## 1. Overview

### Purpose of the Dashboard

As a **Super Admin**, you have complete control over the Content Management System (CMS). You can manage all aspects of the website including content, users, system settings, and access controls.

### Your Access Level

**Full Access** - You can:
- Manage all content modules (navigation, header, footer, pages)
- Create, edit, and delete Admin and Sub Admin users
- View audit logs for all users
- Control which modules appear in the sidebar
- Access data migration tools
- Manage system-wide settings

### High-Level Capabilities

- Complete website content management
- User account management and permissions
- System configuration and module visibility
- Data import/export and migration
- Full audit trail access
- Advanced system controls

---

## 2. Your Role & Access

### Super Admin Capabilities

**Content Management:**
- ✅ All content modules (Navigation, Header, Footer, Home, About, Contact, Careers)
- ✅ Product Management (Brands, Categories, Products)
- ✅ Brand Pages Management
- ✅ Form Submissions
- ✅ Enquiry Form customization

**User Management:**
- ✅ Create, edit, and delete Admin and Sub Admin accounts
- ✅ Assign roles and permissions
- ✅ Activate/deactivate user accounts
- ✅ View all user activity logs

**System Administration:**
- ✅ Control module visibility (show/hide modules in sidebar)
- ✅ Access data migration tools
- ✅ View audit logs for all users
- ✅ Manage system-wide settings

**Restrictions:**
- ❌ Cannot delete your own account
- ❌ Cannot deactivate your own account

---

## 3. Dashboard Navigation

### Accessing Modules

1. Log in at `/superadmin/login`
2. You'll see the Dashboard with all available modules
3. Use the sidebar menu or Quick Actions cards
4. All modules are visible to you by default

### Module Visibility Control

As Super Admin, you can control which modules appear in the sidebar:
1. Go to Dashboard
2. Scroll to "Module Visibility Management"
3. Toggle modules ON/OFF
4. Hidden modules are removed from sidebar and dashboard
5. Changes apply to all users

### Common Actions

- **Save**: Saves changes immediately
- **Delete**: Removes items (requires confirmation)
- **Enable/Disable**: Controls visibility on website
- **Import**: Imports data from live website or codebase
- **Export**: Exports data for backup

---

## 4. MODULE-WISE FUNCTIONALITY

### 4.1 Navigation Management

**Full Access** - You can manage all navigation settings.

#### What You Can Do

- Create, edit, and delete navigation items
- Configure auto-generate mode
- Customize enquiry button text and colors
- Set hover effect colors
- Import default navigation structure
- Control dropdown menus and submenus

#### Key Features

**Auto-Generate Mode:**
- Enable/disable automatic navigation sync with Product Management
- When enabled, brands and categories automatically appear in navigation
- You can still manually edit item properties

**Enquiry Button Customization:**
- Set button text (e.g., "Enquiry Form")
- Choose button color
- Configure hover effects

**Navigation Preview:**
- Live preview shows how navigation appears on website
- Updates automatically when you save changes

---

### 4.2 Header Styling

**Full Access** - Complete control over header appearance.

#### What You Can Do

- Upload and configure logo
- Customize all colors (background, borders, shadows)
- Set font family, size, and weight
- Configure mobile menu styling
- Import styles from live website
- Reset to default settings

#### Special Privileges

- **Font Family Selection**: Only Super Admin can change the font family
- **Complete Styling Control**: Access to all header styling options
- **Import/Reset**: Can import from live site or reset to defaults

---

### 4.3 Home Management

**Full Access** - Manage all home page sections.

#### What You Can Do

- Create, edit, and delete sections
- Import sections from live website
- Fix document size issues (migrate base64 images)
- Manage duplicate sections
- Control section order and visibility

#### Advanced Features

**Document Size Fix:**
- Migrate base64 images to Firebase Storage
- Prevents "document size exceeds 1MB" errors
- Available only to Super Admin

**Duplicate Management:**
- Detect and remove duplicate sections
- Keep one section per type automatically

---

### 4.4 About Management

**Full Access** - Manage all About Us page sections.

#### What You Can Do

- Create, edit, and delete sections
- Import sections from live website
- Manage duplicate sections
- Control section order and visibility
- Customize all content and styling

---

### 4.5 Contact Management

**Full Access** - Complete control over Contact page.

#### What You Can Do

- Manage page title and banner
- Configure info panel and contact items
- Add/edit locations with maps
- Customize "Tell Us" form section
- Manage form fields and validation
- Import from live website

---

### 4.6 Careers Management

**Full Access** - Manage Careers page completely.

#### What You Can Do

- Edit hero section
- Manage "Why Join Us" feature cards
- Add/edit job openings
- Configure application form settings
- Import from live website

---

### 4.7 Product Management

**Full Access** - Single source of truth for products.

#### What You Can Do

- Create, edit, and delete brands
- Create, edit, and delete categories
- Create, edit, and delete products
- Import products from codebase
- Control enabled/disabled status
- Changes automatically reflect in navigation

---

### 4.8 Brand Pages Management

**Full Access** - Create and manage brand pages.

#### What You Can Do

- Create new brand pages from templates
- Edit existing brand pages
- Clone pages from existing ones
- Import from static pages
- Delete brand pages
- Preview pages before publishing

---

### 4.9 Footer Management

**Full Access** - Complete footer control.

#### What You Can Do

- Configure logo, colors, and styling
- Manage contact information
- Customize slogan text and fonts
- Add/edit social media links
- Manage office addresses
- Configure bottom bar (copyright, legal links)
- Import from live website

---

### 4.10 Enquiry Form Management

**Full Access** - Customize enquiry form completely.

#### What You Can Do

- Edit form title and subtitle
- Add, edit, delete, and reorder form fields
- Configure field types and validation
- Set success and error messages
- Reset to default configuration

---

### 4.11 User Management

**Super Admin Only** - Exclusive access to user management.

#### What You Can Do

- Create new Admin and Sub Admin accounts
- Edit existing user accounts
- Delete user accounts (except your own)
- Assign roles (Admin or Sub Admin)
- Activate/deactivate accounts
- Set and reset passwords

#### User Creation Process

1. Click "+ Create New User"
2. Fill in:
   - Name (optional)
   - Email (required, must be unique)
   - Password (must meet security requirements)
   - Role (Admin or Sub Admin)
   - Active status
3. Click "Save"

#### Password Requirements

- Minimum 8 characters (12+ recommended)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### Security Rules

- Cannot delete your own account
- Cannot deactivate your own account
- Only Super Admin can create/edit Super Admin accounts
- User actions are logged in Audit Logs

---

### 4.12 Audit Logs

**Full Access** - View all user activity.

#### What You Can View

- Login/logout events for all users
- Create, update, delete operations
- Filter by event type, role, and date range
- View statistics (total logins, logins by role)
- Track all system changes

#### Filtering Options

- **Event Type**: Login, Logout, Create, Update, Delete, or All
- **Role**: Super Admin, Admin, Sub Admin, or All
- **Date Range**: Start and end dates
- **Statistics**: Total logins and logins by role

#### Monitoring Best Practices

- Regularly review login logs for security
- Monitor Sub Admin activity
- Track content changes
- Use date filters for specific periods
- Export logs for compliance

---

### 4.13 Data Migration

**Super Admin Only** - Advanced data management.

#### What You Can Do

- Import data from codebase
- Export data for backup
- Migrate data between systems
- Bulk update operations

#### Access

- Available in Dashboard → Data Migration
- Use with caution - affects entire system
- Always backup before migration

---

### 4.14 Module Visibility Control

**Super Admin Only** - Control which modules appear.

#### What You Can Do

- Show/hide modules in sidebar
- Control module visibility for all users
- Hide modules from dashboard
- Changes apply system-wide

#### How It Works

1. Go to Dashboard
2. Find "Module Visibility Management" section
3. Toggle modules ON/OFF
4. Hidden modules disappear from:
   - Sidebar menu
   - Dashboard Quick Actions
   - Navigation (if applicable)

#### Use Cases

- Hide modules during maintenance
- Restrict access to specific features
- Customize dashboard for organization needs

---

## 5. Product & Brand Management Logic

### Hierarchy

**Brands** → **Categories** → **Products**

### Automatic Updates

When you add/edit brands or categories:
- Navigation menu updates automatically (if auto-generate enabled)
- Home page Categories section updates
- Brand pages update
- Product pages reflect changes

### Visibility Rules

- Only enabled items appear on website
- Products require enabled brand and category
- Disabled items are hidden but not deleted

---

## 6. Forms & Enquiries

### Form Submissions

**Access**: Dashboard → Form Submissions

**What You Can Do:**
- View all form submissions
- Mark as read/archived
- Delete submissions
- Download file attachments
- Filter by status

### Enquiry Form

**Access**: Dashboard → Enquiry Form Management

**What You Can Do:**
- Customize form fields
- Set validation rules
- Configure messages
- Reset to defaults

---

## 7. User Management Guide

### Creating Users

1. Go to User Management
2. Click "+ Create New User"
3. Fill in required information
4. Set appropriate role
5. Ensure password meets requirements
6. Click "Save"

### Managing Users

**Editing:**
- Click "Edit" on user card
- Modify information
- Update password if needed
- Click "Save"

**Deleting:**
- Click "Delete" on user card
- Confirm deletion
- Cannot delete your own account

**Activating/Deactivating:**
- Toggle active status
- Inactive users cannot log in
- Cannot deactivate your own account

### Best Practices

- Create users with appropriate roles
- Use strong passwords
- Regularly review user list
- Deactivate unused accounts
- Monitor user activity in Audit Logs

---

## 8. Audit Logs & Monitoring

### What's Tracked

- All login/logout events
- All create, update, delete operations
- User information and roles
- Timestamps and details

### Filtering

- **By Role**: View all roles or filter specific ones
- **By Event**: Login, logout, create, update, delete
- **By Date**: Set date ranges
- **Statistics**: View login counts

### Security Monitoring

- Review login patterns
- Identify suspicious activity
- Track content changes
- Monitor user actions
- Generate compliance reports

---

## 9. Global Rules & System Behavior

### Status Handling

- **Enabled**: Item appears on website
- **Disabled**: Item hidden but not deleted
- Toggle to show/hide without deleting

### Ordering

- Items display by order number
- Lower numbers appear first
- Can be changed by editing

### Saving

- Changes save immediately
- No draft system
- Use Cancel to discard changes

---

## 10. Common Errors & Troubleshooting

### Common Issues

**Items Not Appearing:**
- Check enabled status
- Verify in correct module
- Refresh page

**Cannot Save:**
- Check required fields
- Verify validation rules
- Check internet connection

**Navigation Not Updating:**
- Verify auto-generate is enabled
- Check brands/categories are enabled
- Refresh navigation preview

**User Creation Fails:**
- Verify email is unique
- Check password meets requirements
- Ensure all fields are filled

### Solutions

- Check error messages (red alerts)
- Review validation requirements
- Refresh page and try again
- Contact technical support if needed

---

## 11. Best Practices

### User Management

- Create users with appropriate roles
- Use strong, unique passwords
- Regularly review user list
- Deactivate unused accounts
- Monitor Audit Logs regularly

### Content Management

- Preview changes before saving
- Save incrementally
- Test on live website
- Keep backups of important data

### System Administration

- Control module visibility carefully
- Use data migration tools cautiously
- Monitor Audit Logs regularly
- Keep system documentation updated

### Security

- Use strong passwords
- Regularly review user access
- Monitor Audit Logs for suspicious activity
- Deactivate unused accounts promptly

---

## 12. Advanced Features

### Module Visibility Control

Control which modules appear in sidebar:
- Go to Dashboard
- Find "Module Visibility Management"
- Toggle modules ON/OFF
- Changes apply to all users

### Data Migration

Access advanced data tools:
- Import from codebase
- Export for backup
- Migrate between systems
- Use with caution

### Full Audit Access

View all system activity:
- All user actions
- All content changes
- All login events
- Filter by any criteria

### User Management

Complete user control:
- Create/edit/delete users
- Assign roles
- Control access
- Monitor activity

---

## Quick Reference

**Your Access:**
- ✅ All modules
- ✅ User Management
- ✅ Audit Logs (all users)
- ✅ Data Migration
- ✅ Module Visibility Control

**Common Tasks:**
- Create users: Dashboard → User Management
- View logs: Dashboard → Audit Logs
- Control modules: Dashboard → Module Visibility
- Manage content: Use any module in sidebar

**Support:**
- Check error messages for guidance
- Review Audit Logs for tracking
- Use live preview before saving
- Contact technical support if needed

---

*Last Updated: December 2024*  
*Version: 1.0 - Super Admin Edition*

