# Dashboard User Manual - Sub Admin

**Version 1.0**  
**Last Updated: December 2024**  
**Role: Sub Admin - Limited Content Access**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Your Role & Access](#2-your-role--access)
3. [Dashboard Navigation](#3-dashboard-navigation)
4. [Module-Wise Functionality](#4-module-wise-functionality)
   - [4.1 Product Management](#41-product-management)
   - [4.2 Brand Pages Management](#42-brand-pages-management)
   - [4.3 Home Management](#43-home-management)
   - [4.4 About Management](#44-about-management)
   - [4.5 Form Submissions](#45-form-submissions)
   - [4.6 Privacy Policy Management](#46-privacy-policy-management)
   - [4.7 Cookies Policy Management](#47-cookies-policy-management)
5. [Product & Brand Management Logic](#5-product--brand-management-logic)
6. [Forms & Submissions](#6-forms--submissions)
7. [Global Rules & System Behavior](#7-global-rules--system-behavior)
8. [Common Errors & Troubleshooting](#8-common-errors--troubleshooting)
9. [Best Practices](#9-best-practices)

---

## 1. Overview

### Purpose of the Dashboard

As a **Sub Admin**, you have focused access to manage products, brand pages, home and about content, and handle form submissions. Your role is designed for day-to-day content management without access to system-wide settings.

### Your Access Level

**Limited Content Access** - You can:
- Manage products, brands, and categories
- Create and edit brand pages
- Edit home and about page content
- View and manage form submissions
- Manage privacy and cookies policies

**Restrictions:**
- ❌ Cannot access navigation, header, or footer management
- ❌ Cannot access contact or careers pages
- ❌ Cannot customize enquiry forms
- ❌ Cannot view audit logs
- ❌ Cannot manage users
- ❌ Cannot access data migration

### High-Level Capabilities

- Product and brand management
- Brand page creation and editing
- Home and about page content updates
- Form submission handling
- Policy page management

---

## 2. Your Role & Access

### Sub Admin Capabilities

**Product Management:**
- ✅ Product Management (Brands, Categories, Products)
- ✅ Create, edit, and delete products
- ✅ Control enabled/disabled status

**Brand Pages:**
- ✅ Brand Pages Management
- ✅ Create and edit brand pages
- ✅ Clone and import brand pages

**Content Management:**
- ✅ Home Management (edit sections)
- ✅ About Management (edit sections)

**Form Management:**
- ✅ Form Submissions (view and manage)

**Policy Management:**
- ✅ Privacy Policy Management
- ✅ Cookies Policy Management

### Restrictions

**No Access To:**
- ❌ Navigation Management
- ❌ Header Styling
- ❌ Footer Management
- ❌ Contact Management
- ❌ Careers Management
- ❌ Enquiry Form Management
- ❌ User Management
- ❌ Audit Logs
- ❌ Data Migration
- ❌ Module Visibility Control

**Permissions:**
- ✅ Can create new items
- ✅ Can edit existing items
- ✅ Can delete items (products, sections, etc.)
- ✅ Can enable/disable items

---

## 3. Dashboard Navigation

### Accessing Modules

1. Log in at `/subadmin/login`
2. You'll see the Dashboard with your available modules
3. Use the sidebar menu or Quick Actions cards
4. Only modules you can access are shown

### Available Modules

Your sidebar will show:
- Dashboard
- Product Management
- Brand Pages Management
- Home Management
- About Management
- Form Submissions
- Privacy Policy Management
- Cookies Policy Management

### Common Actions

- **Save**: Saves changes immediately
- **Delete**: Removes items (requires confirmation)
- **Enable/Disable**: Controls visibility on website
- **Preview**: See changes before publishing

---

## 4. MODULE-WISE FUNCTIONALITY

### 4.1 Product Management

**Full Access** - Single source of truth for products.

#### What You Can Do

- Create, edit, and delete brands
- Create, edit, and delete categories
- Create, edit, and delete products
- Import products from codebase
- Control enabled/disabled status
- Changes automatically reflect in navigation

#### Step-by-Step Guide

**Managing Brands:**
1. Go to Product Management
2. Click "Brands" tab
3. Click "+ Add Brand" to create new
4. Fill in:
   - Brand name
   - Brand ID (unique identifier)
   - Icon image
   - Enabled status
5. Click "Save"
6. Edit or delete existing brands as needed

**Managing Categories:**
1. Click "Categories" tab
2. Filter by brand or enabled status
3. Click "+ Add Category" to create new
4. Fill in:
   - Category name
   - Category ID
   - Associated brand
   - Icon image
   - Enabled status
5. Click "Save"

**Managing Products:**
1. Click "Products" tab
2. Click "+ Add Product" to create new
3. Fill in:
   - Product name
   - Product ID
   - Associated brand and category
   - Description
   - Images
   - Enabled status
4. Click "Save"

#### Important Notes

- Brand/Category/Product IDs must be unique
- Products must be associated with a brand and category
- Only enabled items appear on the website
- Changes automatically update navigation (if auto-generate enabled)

---

### 4.2 Brand Pages Management

**Full Access** - Create and manage brand pages.

#### What You Can Do

- Create new brand pages from templates
- Edit existing brand pages
- Clone pages from existing ones
- Import from static pages
- Delete brand pages
- Preview pages before publishing

#### Step-by-Step Guide

**Creating New Brand Pages:**
1. Go to Brand Pages Management
2. Click "+ Create New Brand Page"
3. Select brand from list
4. Choose template:
   - Blank Template (start from scratch)
   - Default Template (pre-configured)
5. Fill in content for each section
6. Customize styling
7. Click "Save"

**Editing Brand Pages:**
1. Click "Edit" on brand page card
2. Modify content and styling
3. Use preview to see changes
4. Click "Save"

**Cloning Pages:**
1. Click "Clone" on existing page
2. Select target brand
3. Content is copied to new page
4. Edit as needed

---

### 4.3 Home Management

**Edit Access** - Manage home page sections.

#### What You Can Do

- Edit existing sections
- Create new sections
- Delete sections
- Control section order and visibility
- Import sections from live website

#### Step-by-Step Guide

**Editing Sections:**
1. Go to Home Management
2. Find section card you want to edit
3. Click "Edit"
4. Modify content (text, images, videos)
5. Adjust order and alignment
6. Click "Save"

**Creating Sections:**
1. Click "+ Add New Section"
2. Select section type
3. Fill in content
4. Set order and styling
5. Click "Save"

**Managing Sections:**
- Toggle enable/disable to show/hide
- Delete sections you no longer need
- Reorder sections by editing order number

#### Available Section Types

- Hero section
- About Us section
- Why Section (feature cards)
- Brands carousel
- Categories section
- Overview section
- Testimonials
- Tell Us section

---

### 4.4 About Management

**Edit Access** - Manage About Us page sections.

#### What You Can Do

- Edit existing sections
- Create new sections
- Delete sections
- Control section order and visibility
- Import sections from live website

#### Step-by-Step Guide

**Editing Sections:**
1. Go to About Management
2. Find section card you want to edit
3. Click "Edit"
4. Modify content
5. Adjust styling and order
6. Click "Save"

**Creating Sections:**
1. Click "+ Add New Section"
2. Select section type
3. Fill in content
4. Set order
5. Click "Save"

#### Available Section Types

- Hero section
- Leaders section
- Founding Story section
- Vision section
- Mission section
- Infrastructure section
- Certification section
- Sustainability section
- Media & News section

---

### 4.5 Form Submissions

**Full Access** - Manage all form submissions.

#### What You Can Do

- View all form submissions
- Mark as read/archived
- Delete submissions
- Download file attachments
- Filter by status
- View submission details

#### Step-by-Step Guide

**Viewing Submissions:**
1. Go to Form Submissions
2. View list of all submissions
3. Filter by status (new, read, archived)
4. Click on submission to view details

**Managing Submissions:**
1. Click "View Details" on submission
2. Review all information
3. Mark as "read" when reviewed
4. Archive when no longer needed
5. Delete if necessary

**Downloading Attachments:**
1. Open submission details
2. If file attached, click "Download"
3. File downloads to your computer

#### Submission Types

- Enquiry form submissions
- Contact form submissions
- Careers application submissions

---

### 4.6 Privacy Policy Management

**Full Access** - Manage Privacy Policy page.

#### What You Can Do

- Edit privacy policy content
- Update text and formatting
- Save changes

#### Step-by-Step Guide

1. Go to Privacy Policy Management
2. Edit content in the editor
3. Format text as needed
4. Click "Save"
5. Changes appear on Privacy Policy page

---

### 4.7 Cookies Policy Management

**Full Access** - Manage Cookies Policy page.

#### What You Can Do

- Edit cookies policy content
- Update text and formatting
- Save changes

#### Step-by-Step Guide

1. Go to Cookies Policy Management
2. Edit content in the editor
3. Format text as needed
4. Click "Save"
5. Changes appear on Cookies Policy page

---

## 5. Product & Brand Management Logic

### Hierarchy

**Brands** → **Categories** → **Products**

### How It Works

1. **Create Brands First**
   - Add brand name and ID
   - Upload brand icon
   - Enable the brand

2. **Then Create Categories**
   - Associate with a brand
   - Add category name and ID
   - Upload category icon
   - Enable the category

3. **Finally Create Products**
   - Associate with brand and category
   - Add product details
   - Upload product images
   - Enable the product

### Automatic Updates

When you add/edit brands or categories:
- Navigation menu updates automatically (if auto-generate enabled by Admin)
- Home page Categories section updates
- Brand pages update
- Product pages reflect changes

### Visibility Rules

- Only enabled items appear on website
- Products require enabled brand and category
- Disabled items are hidden but not deleted
- Toggle enabled status to show/hide items

---

## 6. Forms & Submissions

### Form Submissions

**Access**: Dashboard → Form Submissions

**What You Can Do:**
- View all form submissions
- Mark as read/archived
- Delete submissions
- Download file attachments
- Filter by status

### Submission Workflow

1. User submits form on website
2. Submission appears in Form Submissions
3. You see it marked as "new"
4. Click to view details
5. Mark as "read" when reviewed
6. Archive when no longer needed
7. Delete if necessary

### Best Practices

- Check submissions regularly
- Respond to enquiries promptly
- Archive old submissions
- Delete spam or invalid submissions
- Download important attachments

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

### Permissions

- You can create, edit, and delete items in your accessible modules
- Changes are logged (visible to Admins in Audit Logs)
- Cannot undo deletions (be careful)

---

## 8. Common Errors & Troubleshooting

### Common Issues

**Items Not Appearing:**
- Check enabled status
- Verify brand/category is enabled (for products)
- Refresh page

**Cannot Save:**
- Check required fields are filled
- Verify validation rules
- Check internet connection

**Navigation Not Updating:**
- Navigation is managed by Admin/Super Admin
- Your product changes will update navigation if auto-generate is enabled
- Contact Admin if navigation needs manual changes

**Cannot Access Module:**
- Some modules are restricted to Admin/Super Admin
- Check sidebar for available modules
- Contact Admin if you need access to restricted modules

### Solutions

- Check error messages (red alerts)
- Review validation requirements
- Refresh page and try again
- Contact Admin for restricted features

---

## 9. Best Practices

### Product Management

- Create brands first, then categories, then products
- Use consistent naming conventions for IDs
- Enable items after creating them
- Keep product descriptions clear
- Use appropriate images

### Brand Pages

- Use templates for consistency
- Preview before publishing
- Keep content updated
- Ensure brand association is correct

### Content Management

- Preview changes before saving
- Save incrementally
- Test on live website
- Keep content organized
- Use import features when available

### Form Submissions

- Check submissions regularly
- Respond promptly
- Archive when done
- Delete spam
- Download important files

### Team Coordination

- Coordinate with other team members
- Communicate major changes
- Follow naming conventions
- Document custom configurations
- Ask Admin for help with restricted features

---

## Quick Reference

**Your Access:**
- ✅ Product Management
- ✅ Brand Pages Management
- ✅ Home Management
- ✅ About Management
- ✅ Form Submissions
- ✅ Privacy & Cookies Policy

**No Access To:**
- ❌ Navigation Management
- ❌ Header/Footer Management
- ❌ Contact/Careers Management
- ❌ Enquiry Form Management
- ❌ User Management
- ❌ Audit Logs

**Common Tasks:**
- Manage products: Dashboard → Product Management
- Create brand pages: Dashboard → Brand Pages Management
- Edit home/about: Dashboard → Home/About Management
- View submissions: Dashboard → Form Submissions

**Support:**
- Check error messages for guidance
- Use live preview before saving
- Contact Admin for restricted features
- Follow best practices for content management

---

*Last Updated: December 2024*  
*Version: 1.0 - Sub Admin Edition*

