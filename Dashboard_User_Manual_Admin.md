# Dashboard User Manual - Admin

**Version 1.0**  
**Last Updated: December 2024**  
**Role: Admin - Content Management Access**

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
   - [4.11 Form Submissions](#411-form-submissions)
   - [4.12 Audit Logs](#412-audit-logs)
5. [Product & Brand Management Logic](#5-product--brand-management-logic)
6. [Forms & Enquiries](#6-forms--enquiries)
7. [Global Rules & System Behavior](#7-global-rules--system-behavior)
8. [Common Errors & Troubleshooting](#8-common-errors--troubleshooting)
9. [Best Practices](#9-best-practices)

---

## 1. Overview

### Purpose of the Dashboard

As an **Admin**, you have comprehensive access to manage website content, products, forms, and most system features. You can update content, images, navigation, styling, and handle form submissions without any technical knowledge.

### Your Access Level

**Content Management Access** - You can:
- Manage all content modules (navigation, header, footer, pages)
- Manage products, brands, and categories
- Handle form submissions and enquiries
- View audit logs for Sub Admin users
- Customize enquiry forms
- Manage privacy and cookies policies

**Restrictions:**
- ❌ Cannot create or manage other admin users
- ❌ Cannot view Super Admin audit logs
- ❌ Cannot access data migration tools
- ❌ Cannot control module visibility

### High-Level Capabilities

- Complete website content management
- Product and brand management
- Form submission handling
- Enquiry form customization
- Limited audit log access (Sub Admin only)
- Page content editing and styling

---

## 2. Your Role & Access

### Admin Capabilities

**Content Management:**
- ✅ Navigation Management
- ✅ Header Styling
- ✅ Footer Management
- ✅ Home Management
- ✅ About Management
- ✅ Contact Management
- ✅ Careers Management

**Product Management:**
- ✅ Product Management (Brands, Categories, Products)
- ✅ Brand Pages Management
- ✅ Form Submissions

**Form Management:**
- ✅ Enquiry Form customization
- ✅ View and manage form submissions

**System Access:**
- ✅ Audit Logs (Sub Admin users only)
- ✅ Privacy Policy Management
- ✅ Cookies Policy Management

**Restrictions:**
- ❌ User Management (Super Admin only)
- ❌ Data Migration (Super Admin only)
- ❌ Module Visibility Control (Super Admin only)
- ❌ Cannot view Super Admin audit logs

---

## 3. Dashboard Navigation

### Accessing Modules

1. Log in at `/admin/login`
2. You'll see the Dashboard with available modules
3. Use the sidebar menu or Quick Actions cards
4. Modules visible to you are shown in the sidebar

### Common Actions

- **Save**: Saves changes immediately
- **Delete**: Removes items (requires confirmation)
- **Enable/Disable**: Controls visibility on website
- **Import**: Imports content from live website
- **Preview**: See changes before publishing

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

**Enquiry Button Customization:**
- Set button text and color
- Configure hover effects

**Navigation Preview:**
- Live preview shows how navigation appears
- Updates automatically when you save

---

### 4.2 Header Styling

**Limited Access** - Most styling options available.

#### What You Can Do

- Upload and configure logo
- Customize all colors
- Set font size and weight
- Configure mobile menu styling
- Import styles from live website
- Reset to default settings

#### Restrictions

- ❌ Cannot change font family (Super Admin only)
- ✅ All other styling options available

---

### 4.3 Home Management

**Full Access** - Manage all home page sections.

#### What You Can Do

- Create, edit, and delete sections
- Import sections from live website
- Manage duplicate sections
- Control section order and visibility
- Customize all content and styling

#### Note

- Document size fix feature is Super Admin only
- All other features are available to you

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

### 4.11 Form Submissions

**Full Access** - Manage all form submissions.

#### What You Can Do

- View all form submissions
- Mark as read/archived
- Delete submissions
- Download file attachments
- Filter by status (new, read, archived)
- View submission details

#### Submission Types

- Enquiry form submissions
- Contact form submissions
- Careers application submissions

---

### 4.12 Audit Logs

**Limited Access** - View Sub Admin activity only.

#### What You Can View

- Login/logout events for Sub Admin users only
- Create, update, delete operations by Sub Admins
- Filter by event type and date range
- View statistics for Sub Admin logins

#### Restrictions

- ❌ Cannot view Super Admin logs
- ❌ Cannot view other Admin logs
- ✅ Can view all Sub Admin activity

#### Filtering Options

- **Event Type**: Login, Logout, Create, Update, Delete, or All
- **Date Range**: Start and end dates
- **Statistics**: Sub Admin login counts only

#### Monitoring Sub Admins

- Track Sub Admin login activity
- Monitor content changes by Sub Admins
- Review Sub Admin operations
- Use for team management

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

### Submission Workflow

1. User submits form on website
2. Submission appears in Form Submissions
3. Mark as "read" when reviewed
4. Archive when no longer needed
5. Delete if necessary

---

## 7. Global Rules & System Behavior

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

## 8. Common Errors & Troubleshooting

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

**Font Family Not Changing:**
- This is Super Admin only feature
- You can change font size and weight
- Contact Super Admin if font change needed

### Solutions

- Check error messages (red alerts)
- Review validation requirements
- Refresh page and try again
- Contact Super Admin for restricted features

---

## 9. Best Practices

### Content Management

- Preview changes before saving
- Save incrementally
- Test on live website
- Keep backups of important data
- Use import features when available

### Product Management

- Create brands first, then categories, then products
- Enable items after creating them
- Use consistent naming conventions
- Keep descriptions clear and concise

### Form Management

- Regularly check form submissions
- Mark submissions as read when reviewed
- Archive old submissions
- Respond to enquiries promptly

### Team Coordination

- Coordinate with other Admins
- Use Audit Logs to track Sub Admin activity
- Communicate major changes
- Document custom configurations

---

## Quick Reference

**Your Access:**
- ✅ All content modules
- ✅ Product Management
- ✅ Form Submissions
- ✅ Enquiry Form customization
- ✅ Audit Logs (Sub Admin only)

**Restrictions:**
- ❌ User Management
- ❌ Data Migration
- ❌ Module Visibility Control
- ❌ Super Admin audit logs

**Common Tasks:**
- Manage content: Use any module in sidebar
- View submissions: Dashboard → Form Submissions
- Monitor Sub Admins: Dashboard → Audit Logs
- Customize forms: Dashboard → Enquiry Form Management

**Support:**
- Check error messages for guidance
- Review Audit Logs for Sub Admin tracking
- Use live preview before saving
- Contact Super Admin for restricted features

---

*Last Updated: December 2024*  
*Version: 1.0 - Admin Edition*

