# Dashboard User Manual

**Version 1.0**  
**Last Updated: December 2024**

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles & Access](#2-user-roles--access)
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
5. [Product & Brand Management Logic](#5-product--brand-management-logic)
6. [Forms & Enquiries](#6-forms--enquiries)
7. [User Management](#7-user-management)
8. [Audit Logs](#8-audit-logs)
9. [Global Rules & System Behavior](#9-global-rules--system-behavior)
10. [Common Errors & Troubleshooting](#10-common-errors--troubleshooting)
11. [Best Practices](#11-best-practices)
12. [Hidden System Capabilities](#12-hidden-system-capabilities)

---

## 1. Overview

### Purpose of the Dashboard

The Dashboard is a comprehensive Content Management System (CMS) that allows you to manage your entire website without any technical knowledge. You can update content, images, navigation menus, forms, and settings directly from your web browser.

### Who Should Use It

- **Super Admin**: Full access to all modules and user management capabilities
- **Admin**: Access to most content management modules (excluding user management)
- **Sub Admin**: Limited access to specific modules (products, brand pages, home, about, form submissions)

### High-Level Capabilities

- Manage website navigation menus and dropdowns
- Customize header and footer styling
- Edit home, about, contact, and careers pages
- Manage products, brands, and categories
- Create and customize brand pages
- Handle form submissions and enquiries
- Manage admin users and view activity logs

---

## 2. User Roles & Access

### Super Admin

**Access Level:** Full access to all modules

**Can Do:**
- Manage all content modules (navigation, header, footer, home, about, contact, careers)
- Create, edit, and delete Admin and Sub Admin users
- View audit logs for all users
- Control module visibility (show/hide modules in sidebar)
- Access data migration tools
- Manage products, brand pages, and form submissions

**Cannot Do:**
- Delete their own account

### Admin

**Access Level:** Most content modules (excluding user management)

**Can Do:**
- Manage navigation, header, footer, home, about, contact, careers
- Manage products, brand pages, and form submissions
- Customize enquiry forms
- View audit logs for Sub Admin users only
- Manage privacy and cookies policies

**Cannot Do:**
- Create or manage other admin users
- View Super Admin audit logs
- Access data migration tools

### Sub Admin

**Access Level:** Limited to specific modules

**Can Do:**
- Manage products, brand pages, and form submissions
- Edit home and about pages
- Manage privacy and cookies policies

**Cannot Do:**
- Access navigation, header, footer, contact, or careers management
- View audit logs
- Manage users
- Access enquiry form customization

---

## 3. Dashboard Navigation

### How to Access Each Module

1. Log in with your credentials at the login page
2. You'll be redirected to the Dashboard
3. Use the sidebar menu to navigate to different modules
4. Alternatively, click on "Quick Actions" cards on the Dashboard home page

### Common Buttons

- **Save**: Saves your changes (may show "Saving..." while processing)
- **Update**: Updates existing items
- **Delete**: Removes items (requires confirmation)
- **Publish/Enable**: Makes content visible on the website
- **Disable/Hide**: Hides content from the website
- **Cancel**: Discards unsaved changes
- **Import**: Imports content from the live website

### Confirmation Popups

- Delete actions always require confirmation
- Unsaved changes prompt before leaving a page
- Import actions warn about overwriting existing data

### Success/Error Messages

- **Success messages**: Green alerts appear at the top of the page
- **Error messages**: Red alerts with specific error details
- Messages automatically dismiss after a few seconds

---

## 4. MODULE-WISE FUNCTIONALITY

### 4.1 Navigation Management

#### Purpose

This module controls your website's main navigation menu, dropdown menus, and submenus. It's the central place to manage how visitors navigate your website.

#### What Can Be Managed

- Main navigation items (Home, About, Contact, etc.)
- Dropdown menus (Our Brands, Products)
- Submenu items within dropdowns
- Navigation item order
- Enquiry button text and color
- Hover effect colors for navigation items
- Product dropdown hover colors

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Navigation Management

**Auto-Generate Mode:**
- When enabled, navigation automatically syncs with brands and categories from Product Management
- Dropdown items update automatically when you add/edit brands or categories
- You can still edit main item labels, paths, types, and order

**Manual Mode:**
- Disable auto-generate to manage items manually
- Create, edit, and delete items as needed

**Creating New Items:**
1. Click "+ Add New Item" button
2. Fill in the form:
   - **Label**: Text displayed in the menu
   - **Path**: URL path (e.g., "/about")
   - **Type**: Link, Dropdown, or Submenu
   - **Order**: Display order (lower numbers appear first)
3. For dropdowns, add items in the dropdown section
4. Click "Save"

**Editing Existing Items:**
1. Click "Edit" button on any navigation item card
2. Modify the fields as needed
3. Click "Save"

**Deleting Items:**
1. Click "Delete" button (only available for non-auto-generated items)
2. Confirm deletion in the popup

**Enquiry Button Settings:**
1. Scroll to "Enquiry Button Settings" section
2. Enter button text (e.g., "Enquiry Form")
3. Select button color using color picker
4. Click "Save Enquiry Button Settings"

**Hover Effect Colors:**
- Customize hover background colors for navigation items
- Set product dropdown hover colors separately

#### Fields Explanation

- **Label**: The text shown in the navigation menu
- **Path**: The URL path (e.g., "/contact")
- **Type**: Link (single page), Dropdown (has sub-items), Submenu (nested items)
- **Order**: Display order (1 = first item)
- **Icon**: Optional icon image for the item
- **Auto-generated**: Indicates items synced from Product Management

#### Validation Rules

- Label is required
- Path must start with "/"
- Order must be a number
- Auto-generated items cannot be deleted (only edited)

#### Impact on Website

- Changes appear immediately in the main navigation bar
- Dropdown menus update automatically
- Enquiry button styling updates immediately
- Hover effects apply to navigation items

---

### 4.2 Header Styling

#### Purpose

Customize the appearance of your website header/navbar: logo, colors, fonts, and all styling options.

#### What Can Be Managed

- Logo image and height
- Navbar background colors (normal and scrolled states)
- Navbar borders and shadows
- Navigation link colors and hover effects
- Dropdown menu styling
- Enquiry button (CTA) styling
- Font family, size, and weight
- Mobile menu styling
- Spacing and padding

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Header Styling

**Logo Settings:**
1. Upload or select logo from media library
2. Set logo height (e.g., "36px")
3. Optionally apply CSS filters
4. Click "Save Section"

**Color Customization:**
1. Navigate to "Navbar Colors" section
2. Set background, border, and shadow colors
3. Configure normal and scrolled states separately
4. Click "Save Section"

**Font Settings:**
1. Go to "Font Settings" section
2. Select font family (Super Admin only)
3. Set font size and weight
4. Click "Save Section"

**Button Styling:**
1. Go to "Enquiry Button (CTA) Settings" section
2. Customize background, text color, size, padding, border radius
3. Set hover effects
4. Click "Save Section"

**Import from Live Website:**
1. Click "Import from Live Website" button
2. Confirm to import current styles from the live site

#### Fields Explanation

- **Logo Height**: Controls the size of the logo in the navbar
- **Navbar Background**: Background color of the navigation bar
- **Link Color**: Color of navigation text
- **Font Family**: Font used for navigation text
- **CTA Background**: Background color of the enquiry button
- **Hover Effects**: Colors shown when hovering over items

#### Validation Rules

- Logo must be a valid image
- Colors must be valid hex codes or CSS color values
- Font sizes should include units (px, rem, etc.)

#### Impact on Website

- Changes appear immediately in the header/navbar
- Logo updates immediately
- Color and font changes apply across navigation
- Mobile menu styling updates accordingly

---

### 4.3 Home Management

#### Purpose

Manage all sections of your home page: text, images, videos, alignment, and layout.

#### What Can Be Managed

- Hero section (video, heading, buttons)
- About Us section
- Why Section (feature cards)
- Brands carousel
- Categories section
- Overview section
- Testimonials
- Tell Us section
- Section order and visibility
- Text, images, videos, and styling for each section

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Home Management

**Viewing Sections:**
- All sections appear as cards in a grid
- Each card shows section type, name, and status
- Enabled sections appear on the website

**Creating New Sections:**
1. Click "+ Add New Section" button
2. Select section type from dropdown
3. Fill in content (text, images, videos)
4. Set order and alignment
5. Click "Save"

**Editing Sections:**
1. Click "Edit" button on any section card
2. Modify content in the editor
3. Use live preview to see changes
4. Click "Save"

**Deleting Sections:**
1. Click "Delete" button on section card
2. Confirm deletion

**Enabling/Disabling Sections:**
- Toggle the enable/disable switch on section card
- Disabled sections are hidden on the website

**Importing from Live Website:**
1. Click "Import from Live Website" button
2. Confirm to import all sections from current home page

**Managing Duplicates:**
- If duplicate section types are detected, a warning appears
- Click "Duplicates" button to view and delete duplicates
- System keeps the first section of each type

#### Fields Explanation

- **Section Type**: Type of section (hero, about, why, etc.)
- **Name**: Internal name for the section
- **Order**: Display order (lower numbers appear first)
- **Enabled**: Whether section is visible on website
- **Content**: Text, images, videos specific to section type
- **Alignment**: Text/image alignment (left, center, right)

#### Validation Rules

- Section type is required
- Order must be a number
- Images must be valid image files
- Videos must be valid video URLs or files

#### Impact on Website

- Changes appear on home page immediately
- Sections are displayed in order
- Disabled sections are hidden
- Images and videos load from media library

---

### 4.4 About Management

#### Purpose

Manage all sections of your About Us page: text, images, icons, alignment, and dimensions.

#### What Can Be Managed

- Hero section (image)
- Leaders section (founders and current leaders)
- Founding Story section
- Vision section
- Mission section
- Infrastructure section
- Certification section
- Sustainability section
- Media & News section
- Section order and visibility
- Text, images, icons, and styling

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → About Management

**Viewing Sections:**
- All sections appear as cards in a grid
- Each card shows section type, name, and status

**Creating New Sections:**
1. Click "+ Add New Section" button
2. Select section type from dropdown
3. Fill in content
4. Set order and styling
5. Click "Save"

**Editing Sections:**
1. Click "Edit" button on section card
2. Modify content in editor
3. Use live preview to see changes
4. Click "Save"

**Deleting Sections:**
1. Click "Delete" button on section card
2. Confirm deletion

**Importing from Live Website:**
1. Click "Import from Live Website" button
2. Confirms updates existing sections and adds new ones (no duplicates)

**Managing Duplicates:**
- Similar to Home Management, duplicate detection and cleanup is available

#### Fields Explanation

- **Section Type**: Type of section (hero, leaders, vision, etc.)
- **Name**: Internal name for the section
- **Order**: Display order (lower numbers appear first)
- **Content**: Text, images, icons specific to section
- **Dimensions**: Width, height for images/icons
- **Alignment**: Content alignment

#### Validation Rules

- Section type is required
- Images must be valid
- Icons must be valid image files or icon identifiers

#### Impact on Website

- Changes appear on About Us page immediately
- Sections are displayed in order
- Images and icons load from media library

---

### 4.5 Contact Management

#### Purpose

Control every detail of your Contact page: text, fonts, images, maps, and layout.

#### What Can Be Managed

- Page title and banner
- Info panel (background color, contact items)
- Location management (addresses, map embeds, directions)
- Map container styling
- "Tell Us" form section (heading, description, form fields)
- Form field customization (labels, placeholders, types, required status)
- Button styling and colors

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Contact Management

**General Settings:**
1. Set page title and banner text
2. Customize heading text

**Info Panel:**
1. Set background color
2. Add/edit contact info items (phone, email, address)
3. Link items to locations

**Location Management:**
1. Add locations with:
   - Name
   - Address
   - Map embed code
   - Directions URL
2. Set default location
3. Edit or delete locations

**Map Container:**
1. Set background color
2. Configure border radius
3. Enable/disable grayscale filter

**Tell Us Form Section:**
1. Customize heading and description
2. Set background and button colors
3. Manage form fields:
   - Add/remove fields
   - Edit labels and placeholders
   - Set field types (text, email, select, textarea)
   - Mark fields as required/optional
   - Set default values for select fields

**Importing from Live Website:**
1. Click "Import from Live Website" button
2. Imports current Contact page settings

#### Fields Explanation

- **Page Title**: Browser tab title
- **Banner Tag**: Star symbol and text above heading
- **Info Items**: Contact information cards
- **Location Key**: Unique identifier for each location
- **Map Embed**: Google Maps embed code
- **Form Fields**: Fields in the "Tell Us" form

#### Validation Rules

- Email fields must be valid email format
- Map embed codes must be valid iframe code
- Form field names must be unique
- Required fields cannot be removed if they're the only field

#### Impact on Website

- Changes appear on Contact page immediately
- Form submissions are stored in Form Submissions
- Map displays selected location
- Form fields update immediately

---

### 4.6 Careers Management

#### Purpose

Manage Careers page: hero, Why Join Us content, job openings, and form settings.

#### What Can Be Managed

- Hero section (badge text, title, subtitle)
- Why Join Us section (title, feature cards)
- Job openings section (title, job listings)
- Form settings (requirement label, options, submit button text)
- Job details (title, date, description, enabled status)

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Careers Management

**Hero Section:**
1. Edit badge text (e.g., "★ Opportunity")
2. Set title and subtitle
3. Changes appear in live preview

**Why Join Us Section:**
1. Edit section title
2. Add/edit feature cards:
   - Title
   - Description text
   - Icon image
3. Reorder or delete cards

**Job Openings:**
1. Edit section title
2. Add new job:
   - Job title
   - Date posted
   - Short description (blurb)
   - Full description
   - Enable/disable status
3. Edit or delete existing jobs
4. Jobs are displayed in order

**Form Settings:**
1. Set requirement label
2. Add/edit requirement options (Full-time, Part-time, Contract, Internship)
3. Customize submit button text

**Importing from Live Website:**
1. Click "Import from Live Website" button
2. Imports current Careers page settings

#### Fields Explanation

- **Badge Text**: Small text above main heading
- **Title**: Main heading text
- **Subtitle**: Supporting text below title
- **Feature Cards**: Cards in "Why Join Us" section
- **Job Blurb**: Short preview text for job listings
- **Requirement Options**: Dropdown options for application form

#### Validation Rules

- Job title is required
- Date must be in valid format
- Form options cannot be empty

#### Impact on Website

- Changes appear on Careers page immediately
- Job listings show enabled jobs only
- Form submissions are stored in Form Submissions
- Feature cards display in Why Join Us section

---

### 4.7 Product Management

#### Purpose

Single source of truth for brands, categories, and products. Changes automatically reflect across the entire website.

#### What Can Be Managed

- **Brands**: Brand names, icons, enabled status
- **Categories**: Category names, icons, brand associations, enabled status
- **Products**: Product names, descriptions, images, brand/category associations, enabled status

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Product Management

**Brands Tab:**
1. View all brands in a list
2. Click "+ Add Brand" to create new brand
3. Fill in:
   - Brand name
   - Brand ID (unique identifier)
   - Icon image
   - Enabled status
4. Click "Save"
5. Edit or delete existing brands
6. Toggle enabled status to show/hide on website

**Categories Tab:**
1. View all categories in a list
2. Filter by brand or enabled status
3. Click "+ Add Category" to create new category
4. Fill in:
   - Category name
   - Category ID (unique identifier)
   - Associated brand
   - Icon image
   - Enabled status
5. Click "Save"
6. Edit or delete categories

**Products Tab:**
1. View all products in a list
2. Click "+ Add Product" to create new product
3. Fill in:
   - Product name
   - Product ID (unique identifier)
   - Associated brand and category
   - Description
   - Images
   - Enabled status
4. Click "Save"
5. Edit or delete products

**Importing Existing Data:**
1. Click "Import from Codebase" button
2. Imports brands, categories, and products from static code

#### Fields Explanation

- **Brand ID**: Unique identifier (e.g., "soil-king")
- **Category ID**: Unique identifier (e.g., "masalas")
- **Product ID**: Unique identifier (e.g., "rice-1kg")
- **Icon**: Image displayed in navigation and category sections
- **Enabled**: Whether item appears on website

#### Validation Rules

- Brand/Category/Product IDs must be unique
- Icons must be valid images
- Products must be associated with a brand and category

#### Impact on Website

- **Navigation**: When auto-generate is enabled in Navigation Management, brands and categories automatically appear in dropdown menus
- **Home Page**: Enabled categories appear in Categories section
- **Product Pages**: Products display on product listing and detail pages
- **Brand Pages**: Products appear on their associated brand pages
- **Search**: Products are searchable on website

---

### 4.8 Brand Pages Management

#### Purpose

Create and manage dedicated brand pages with customizable content and styling.

#### What Can Be Managed

- Brand page content (sections, text, images)
- Page styling (colors, fonts, dimensions)
- Section order and visibility
- Brand associations
- Page templates

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Brand Pages Management

**Creating New Brand Pages:**
1. Click "+ Create New Brand Page" button
2. Select brand from list
3. Choose template type:
   - **Blank Template**: Start from scratch
   - **Default Template**: Pre-configured sections
4. Fill in content for each section
5. Customize styling (colors, fonts, dimensions)
6. Click "Save"

**Editing Brand Pages:**
1. Click "Edit" button on brand page card
2. Modify content and styling
3. Use live preview to see changes
4. Click "Save"

**Deleting Brand Pages:**
1. Click "Delete" button on brand page card
2. Confirm deletion

**Cloning from Existing Pages:**
1. Click "Clone" button on existing brand page
2. Select target brand
3. Content is copied to new page

**Importing from Static Pages:**
1. Click "Import from Static Page" button
2. Select brand to import
3. Imports content from current static brand page

**Previewing Pages:**
1. Click "Preview" button on brand page card
2. View how page appears on website

#### Fields Explanation

- **Brand**: Associated brand
- **Page Slug**: URL identifier (e.g., "/brands/soil-king")
- **Sections**: Content sections (hero, features, products, etc.)
- **Styling**: Colors, fonts, spacing, dimensions

#### Validation Rules

- Brand must be selected
- Page slug must be unique
- Sections must have valid content

#### Impact on Website

- Brand pages accessible at "/brands/[brand-slug]"
- Changes appear immediately
- Products associated with brand appear on page
- Navigation links to brand pages update automatically

---

### 4.9 Footer Management

#### Purpose

Manage footer: logo, navigation links, contact info, social media, addresses, and styling.

#### What Can Be Managed

- Footer background color
- Logo (image, width, height)
- Navigation links (auto-synced from Navigation Management)
- Contact information (email, phone)
- Slogan text and styling
- Social media links
- Office addresses
- Bottom bar (copyright, legal links, developer credit)
- Responsive dimensions (desktop, tablet, mobile)

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Footer Management

**Logo Settings:**
1. Upload or select logo image
2. Set width and height
3. Changes appear in live preview

**Contact Information:**
1. Edit email address and link
2. Edit phone number and link
3. Changes apply immediately

**Slogan:**
1. Edit slogan text
2. Customize font family, size, weight, color
3. Set line height and letter spacing

**Social Media:**
1. Add/edit social media links
2. Set platform name, URL, and icon type
3. Add multiple platforms

**Addresses:**
1. Add/edit office addresses
2. Set heading and address text
3. Customize font styling for each address

**Bottom Bar:**
1. Edit copyright text
2. Manage legal links (Privacy Policy, Cookies)
3. Edit developer credit text and link

**Importing from Live Website:**
1. Click "Import from Live Website" button
2. Imports current footer settings

#### Fields Explanation

- **Logo**: Footer logo image
- **Navigation Links**: Auto-synced from Navigation Management
- **Slogan**: Tagline text displayed in footer
- **Social Media**: Links to social platforms
- **Addresses**: Office location information
- **Bottom Bar**: Copyright and legal information

#### Validation Rules

- Email must be valid format
- Phone numbers should include country code
- Social media URLs must be valid
- Addresses cannot be empty

#### Impact on Website

- Changes appear in footer on all pages
- Navigation links update automatically
- Social media icons link to specified URLs
- Responsive dimensions apply on different screen sizes

---

### 4.10 Enquiry Form Management

#### Purpose

Customize the enquiry form that appears in the navbar: edit fields, labels, placeholders, and messages.

#### What Can Be Managed

- Form title and subtitle
- Form fields (add, edit, delete, reorder)
- Field types (text, email, select, textarea)
- Field labels and placeholders
- Required/optional status
- Select field options
- Submit button text
- Success and error messages

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Enquiry Form Management

**General Settings:**
1. Edit form title (e.g., "Enquiry Form")
2. Edit subtitle (e.g., "Tell us what you need")
3. Customize submit button text
4. Set success and error messages

**Managing Form Fields:**
1. **Add Field**:
   - Click "+ Add Field" button
   - Select field type
   - Set label, placeholder, required status
   - For select fields, add options
2. **Edit Field**:
   - Click "Edit" button on field
   - Modify properties
   - Click "Save"
3. **Delete Field**:
   - Click "Delete" button on field
   - Confirm deletion
4. **Reorder Fields**:
   - Use up/down arrows to change order

**Field Types:**
- **Text**: Single-line text input
- **Email**: Email address input with validation
- **Select**: Dropdown with options
- **Textarea**: Multi-line text input

**Resetting to Default:**
1. Click "Reset to Default" button
2. Confirms to restore default form configuration

#### Fields Explanation

- **Field Name**: Internal identifier (e.g., "firstName")
- **Label**: Text shown to users
- **Placeholder**: Hint text in input field
- **Required**: Whether field must be filled
- **Options**: List of options for select fields
- **Order**: Display order in form

#### Validation Rules

- Field names must be unique
- Required fields cannot be removed if they're the only field
- Email fields must use email type
- Select fields must have at least one option

#### Impact on Website

- Changes appear in enquiry form popup in navbar
- Form submissions are stored in Form Submissions
- Validation rules apply to user inputs
- Success/error messages display after submission

---

### 4.11 User Management

#### Purpose

Create and manage Admin and Sub Admin accounts. Control access and permissions.

#### What Can Be Managed

- Admin user accounts (Super Admin, Admin, Sub Admin)
- User names and email addresses
- User passwords
- User roles
- Active/inactive status
- User creation and deletion

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → User Management (Super Admin only)

**Creating New Users:**
1. Click "+ Create New User" button
2. Fill in form:
   - **Name**: User's full name (optional)
   - **Email**: Login email address (required)
   - **Password**: Secure password (required for new users)
   - **Role**: Super Admin, Admin, or Sub Admin
   - **Active Status**: Enable/disable account
3. Password requirements:
   - Minimum 8 characters (12+ recommended)
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character
4. Click "Save"

**Editing Users:**
1. Click "Edit" button on user card
2. Modify name, email, role, or password
3. Password is optional when editing (only update if changing)
4. Click "Save"

**Deleting Users:**
1. Click "Delete" button on user card
2. Confirm deletion
3. Cannot delete your own account

**Activating/Deactivating Users:**
1. Toggle active status switch
2. Inactive users cannot log in
3. Cannot deactivate your own account

#### Fields Explanation

- **Name**: User's display name
- **Email**: Login email (must be unique)
- **Password**: Login password (encrypted)
- **Role**: Permission level (Super Admin, Admin, Sub Admin)
- **Active**: Whether account can log in
- **Created By**: User who created this account

#### Validation Rules

- Email must be unique and valid format
- Password must meet security requirements
- Only Super Admin can create/edit Super Admin accounts
- Cannot delete or deactivate your own account

#### Impact on Website

- New users can log in immediately (if active)
- Inactive users cannot access dashboard
- Role determines which modules are accessible
- Password changes take effect immediately

---

### 4.12 Audit Logs

#### Purpose

View login and activity logs. Track user access and system events.

#### What Can Be Managed

- View login/logout events
- View create, update, delete operations
- Filter by event type, role, and date range
- View statistics (total logins, logins by role)

#### How It Works (Step-by-Step)

**Accessing the Module:**
1. Navigate to Dashboard → Audit Logs

**Viewing Logs:**
- Logs display in a table with:
  - Timestamp
  - User email and role
  - Event type (login, logout, create, update, delete)
  - Module affected
  - Details of the action

**Filtering Logs:**
1. **Event Type**: Filter by login, logout, create, update, delete, or all
2. **Role**: Filter by Super Admin, Admin, Sub Admin, or all (Super Admin only)
3. **Date Range**: Set start and end dates
4. Click "Clear Filters" to reset

**Statistics:**
- View total logins
- View logins by role
- Statistics update based on current filters

**Understanding Log Entries:**
- **Login**: User logged into dashboard
- **Logout**: User logged out
- **Create**: New item was created (e.g., product, section)
- **Update**: Existing item was modified
- **Delete**: Item was removed

#### Fields Explanation

- **Timestamp**: Date and time of the event
- **User**: Email address of user who performed action
- **Role**: User's role at time of action
- **Event Type**: Type of action performed
- **Module**: Which module was affected
- **Details**: Description of what was changed

#### Validation Rules

- Date filters must be valid dates
- End date must be after start date
- Filters are applied automatically when changed

#### Impact on Website

- Audit logs are for monitoring only
- No direct impact on website functionality
- Helps track who made changes and when
- Useful for security and compliance

---

## 5. Product & Brand Management Logic

### Relationship Between Brands, Categories, and Products

**Hierarchy:**
- **Brands** → **Categories** → **Products**
- Each product belongs to one brand and one category
- Categories can belong to multiple brands (shared categories)

**How Changes Reflect Across the Website:**

1. **Navigation Menu:**
   - When auto-generate is enabled in Navigation Management:
     - Brands appear in "Our Brands" dropdown
     - Categories appear in "Products" dropdown organized by brand
   - Changes to brands/categories update navigation automatically

2. **Home Page:**
   - Enabled categories appear in Categories section
   - Category icons and names are pulled from Product Management

3. **Product Pages:**
   - Products display on product listing pages
   - Products are filterable by brand and category
   - Product detail pages show associated brand and category

4. **Brand Pages:**
   - Products associated with a brand appear on that brand's page
   - Brand pages are accessible at "/brands/[brand-slug]"

### Publishing and Visibility Rules

- **Enabled Status:**
  - Only enabled brands, categories, and products appear on the website
  - Disabled items are hidden but not deleted
  - Toggle enabled status to show/hide items

- **Order:**
  - Items display in the order they were created (or custom order if supported)
  - Lower order numbers appear first

- **Dependencies:**
  - Products require an enabled brand and category to display
  - If a brand is disabled, its products are hidden
  - If a category is disabled, its products are hidden

---

## 6. Forms & Enquiries

### Enquiry Form Customization

The enquiry form appears as a popup when users click the "Enquiry Form" button in the navbar.

**Customization Options:**
- Form title and subtitle
- Form fields (add, edit, delete, reorder)
- Field labels and placeholders
- Required/optional status
- Select field options
- Submit button text
- Success and error messages

### What Happens When a User Submits a Form

1. **Validation:**
   - Required fields are checked
   - Email format is validated
   - Form data is prepared

2. **Submission:**
   - Form data is saved to database
   - Submission is marked as "new"
   - Success message is shown to user

3. **Storage:**
   - Submissions are stored in Form Submissions module
   - Each submission includes:
     - Timestamp
     - User information (name, email, etc.)
     - Form data
     - Status (new, read, archived)
     - File attachments (if any)

### Where Submissions Are Stored

- **Form Submissions Module:**
  - All enquiry form submissions
  - Contact form submissions
  - Careers application submissions
  - Accessible from Dashboard → Form Submissions

### Notifications

- Currently, no email notifications are sent automatically
- Admins must check Form Submissions to see new submissions
- Submissions are marked as "new" until viewed

---

## 7. User Management

### Creating Admin and Sub-Admin Users

**Who Can Create Users:**
- Only Super Admin can create and manage users

**Creating a New User:**
1. Go to User Management
2. Click "+ Create New User"
3. Fill in required information
4. Set role (Admin or Sub Admin)
5. Set active status
6. Click "Save"

**Password Requirements:**
- Minimum 8 characters (12+ recommended for better security)
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*...)

### Assigning Permissions

**Role-Based Permissions:**
- Permissions are automatically assigned based on role
- Cannot customize permissions per user
- Roles determine module access:
  - **Super Admin**: All modules
  - **Admin**: Most modules (excluding user management)
  - **Sub Admin**: Limited modules (products, brand pages, home, about, form submissions)

### Enabling/Disabling Users

**Activating Users:**
- New users are active by default
- Active users can log in immediately

**Deactivating Users:**
- Toggle active status switch to disable
- Inactive users cannot log in
- Cannot deactivate your own account

### Password and Access Control Behavior

**Password Management:**
- Passwords are encrypted and cannot be viewed
- When editing a user, password is optional (only update if changing)
- Password changes take effect immediately

**Access Control:**
- Users can only access modules allowed by their role
- Attempting to access restricted modules shows "Unauthorized"
- Login sessions expire after inactivity

**Security Features:**
- Passwords must meet strength requirements
- User actions are logged in Audit Logs
- Only Super Admin can manage other users

---

## 8. Audit Logs

### What Actions Are Tracked

**Authentication Events:**
- Login: When a user logs into the dashboard
- Logout: When a user logs out

**Content Management Events:**
- Create: When new items are created (products, sections, users, etc.)
- Update: When existing items are modified
- Delete: When items are removed

### Who Performed the Action

**User Information:**
- Email address of the user
- Role of the user at the time of action
- Timestamp of when the action occurred

**Action Details:**
- Module affected (e.g., "products", "home", "users")
- Description of what was changed
- Item ID or name

### How Admins Should Use Logs for Monitoring

**Security Monitoring:**
- Review login logs for suspicious activity
- Track who accessed the dashboard and when
- Monitor failed login attempts (if available)

**Change Tracking:**
- See who made changes to content
- Track when products, pages, or settings were modified
- Identify accidental deletions or modifications

**Compliance:**
- Maintain records of all administrative actions
- Generate reports for auditing purposes
- Filter logs by date range for specific periods

**Best Practices:**
- Regularly review audit logs
- Filter by role to monitor Sub Admin activity
- Use date filters to focus on specific time periods
- Export logs if needed for external reporting

---

## 9. Global Rules & System Behavior

### Status Handling (Active / Inactive)

**Enabled/Disabled Status:**
- Most content items have an enabled/disabled status
- **Enabled**: Item appears on the website
- **Disabled**: Item is hidden but not deleted
- Toggle status to show/hide items without deleting

**Active/Inactive Users:**
- **Active**: User can log in and access dashboard
- **Inactive**: User cannot log in
- Cannot deactivate your own account

### Ordering and Priority Logic

**Display Order:**
- Items display in order based on their "order" field
- Lower numbers appear first (order 1 appears before order 2)
- If no order is set, items display in creation order

**Section Order:**
- Home and About sections display in order
- Order can be changed by editing the section
- Disabled sections are excluded from display order

### Draft vs Published Behavior

**No Draft System:**
- Changes are published immediately upon saving
- No draft/published workflow
- Use enabled/disabled status to control visibility

**Saving Behavior:**
- Changes are saved to database immediately
- No "Save as Draft" option
- Use "Cancel" to discard unsaved changes

---

## 10. Common Errors & Troubleshooting

### Typical Mistakes Users Make

1. **Forgetting to Enable Items:**
   - **Problem**: Created items don't appear on website
   - **Solution**: Check enabled status and toggle to "enabled"

2. **Invalid Image Uploads:**
   - **Problem**: Images don't display or cause errors
   - **Solution**: Use valid image files (JPG, PNG, GIF) and reasonable file sizes

3. **Missing Required Fields:**
   - **Problem**: Cannot save forms
   - **Solution**: Fill in all required fields (marked with asterisks)

4. **Duplicate Section Types:**
   - **Problem**: Multiple sections of same type cause conflicts
   - **Solution**: Use duplicate detection tool to remove duplicates

5. **Navigation Not Updating:**
   - **Problem**: Navigation changes don't appear
   - **Solution**: Check if auto-generate is enabled and ensure brands/categories are enabled

### How to Resolve Common Issues

**Images Not Loading:**
1. Check image file format and size
2. Re-upload image if needed
3. Verify image is enabled in media library

**Form Submissions Not Appearing:**
1. Check Form Submissions module
2. Filter by status (new, read, archived)
3. Verify form is enabled and accessible

**Navigation Items Missing:**
1. Check Navigation Management
2. Verify auto-generate is enabled (if using products)
3. Ensure brands/categories are enabled in Product Management

**Cannot Save Changes:**
1. Check for validation errors (red text)
2. Fill in all required fields
3. Check internet connection
4. Refresh page and try again

### System Limitations

**File Size Limits:**
- Large images may cause slow loading
- Recommended image size: under 2MB
- Use image optimization tools before uploading

**Character Limits:**
- Some text fields have character limits
- Check field hints for maximum lengths

**Browser Compatibility:**
- Works best in modern browsers (Chrome, Firefox, Edge, Safari)
- Some features may not work in older browsers

**Concurrent Editing:**
- If multiple users edit the same item, the last save wins
- Coordinate with team members to avoid conflicts

---

## 11. Best Practices

### Recommended Workflows

**Content Updates:**
1. Review existing content before making changes
2. Use live preview to see changes before saving
3. Save changes incrementally (don't make too many changes at once)
4. Test changes on live website after saving

**Product Management:**
1. Create brands first, then categories, then products
2. Enable items after creating them
3. Use consistent naming conventions for IDs
4. Keep product descriptions clear and concise

**Image Management:**
1. Optimize images before uploading
2. Use descriptive filenames
3. Maintain consistent image dimensions for similar items
4. Use appropriate image formats (JPG for photos, PNG for graphics)

**User Management:**
1. Create users with strong passwords
2. Assign appropriate roles (don't give Super Admin to everyone)
3. Regularly review and deactivate unused accounts
4. Keep user information up to date

### Content Management Tips

**Organization:**
- Use consistent naming conventions
- Group related content together
- Keep section orders logical
- Document custom configurations

**Backup:**
- Export important data regularly
- Keep records of major changes
- Use version control if available

**Testing:**
- Preview changes before publishing
- Test on different devices and browsers
- Verify links and images work correctly
- Check form submissions are being received

### Safety and Access Guidelines

**Password Security:**
- Use strong, unique passwords
- Change passwords regularly
- Don't share passwords with others
- Use password managers if needed

**Access Control:**
- Only grant necessary access levels
- Regularly review user permissions
- Deactivate unused accounts
- Monitor audit logs for suspicious activity

**Data Protection:**
- Don't delete important data without backup
- Use enabled/disabled status instead of deleting when possible
- Keep sensitive information secure
- Follow company data protection policies

---

## 12. Hidden System Capabilities

### Features Available in Backend but Not in UI

**Data Migration Tools:**
- Super Admin can access data migration tools
- Used for importing/exporting data in bulk
- Typically used during setup or major updates

**Module Visibility Control:**
- Super Admin can hide/show modules in sidebar
- Controlled from Dashboard → Module Visibility Management
- Hidden modules are removed from navigation and dashboard

**Image Storage:**
- Images are stored in Firebase Storage
- Base64 images are automatically migrated to storage
- Image URLs are resolved automatically

**Automatic Navigation Sync:**
- When auto-generate is enabled, navigation syncs with Product Management
- Changes to brands/categories automatically update navigation
- No manual intervention needed

---

## Conclusion

This manual covers all the essential features of the Dashboard. For specific questions or advanced configurations, contact your system administrator or refer to additional documentation.

**Quick Reference:**
- **Navigation**: Dashboard → Navigation Management
- **Content**: Dashboard → Home/About/Contact/Careers Management
- **Products**: Dashboard → Product Management
- **Users**: Dashboard → User Management (Super Admin only)
- **Logs**: Dashboard → Audit Logs

**Support:**
- Check error messages for specific guidance
- Review audit logs to track changes
- Use live preview to verify changes before saving
- Contact your administrator for access issues

---

*Last Updated: December 2024*  
*Version: 1.0*

