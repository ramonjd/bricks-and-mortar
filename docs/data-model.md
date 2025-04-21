# Data Model

This document outlines the proposed data model for the Bricks & Mortar application, highlighting the key entities and their relationships.

## Core Entities

### User
- `id`: Unique identifier
- `email`: Email address (unique)
- `name`: Full name
- `phone`: Contact number
- `avatar_url`: Profile image
- `created_at`: Account creation timestamp
- `preferences`: JSON object for app preferences
- `notification_settings`: JSON object for notification configurations

### Property
- `id`: Unique identifier
- `name`: Property name/title
- `address`: Physical address
- `latitude`: Geo coords lat
- `longitude`: Geo coords long
- `property_type`: Type (e.g., single-family, apartment, condo)
- `purchase_date`: Date of purchase (nullable for renters)
- `purchase_price`: Original purchase price (nullable for renters)
- `current_value`: Latest estimated value
- `square_meters`: Size of property
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `year_built`: Construction year
- `description`: Property description
- `status`: Active/inactive
- `image_urls`: Array of property images
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp
- `created_by`: UUID (references auth.users) - The user who created the property record

### Expense
- `id`: Unique identifier
- `property_id`: Associated property
- `category`: Expense category (utilities, maintenance, etc.)
- `subcategory`: More specific classification
- `amount`: Cost amount
- `currency`: Currency code
- `date`: Date of expense
- `description`: Expense description
- `receipt_url`: Uploaded receipt image
- `payment_method`: Method used for payment
- `recurring`: Boolean indicating if expense recurs
- `recurring_frequency`: For recurring expenses (monthly, annually, etc.)
- `is_tax_deductible`: Whether expense is tax-deductible
- `created_by`: User who created the record
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### PropertyUser (for many-to-many relationships)
- `id`: Unique identifier
- `property_id`: Associated property
- `user_id`: Associated user
- `role`: Role for this property (owner, renter, manager)
- `ownership_percentage`: For joint owners (nullable)
- `start_date`: When association began
- `end_date`: When association ended (nullable)
- `created_at`: Record creation timestamp

### ExpenseShare
- `id`: Unique identifier
- `expense_id`: Associated expense
- `user_id`: Associated user
- `share_percentage`: Percentage of expense share
- `share_amount`: Calculated amount based on percentage
- `is_paid`: Payment status
- `payment_date`: When payment was made (nullable)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### PropertyValuation
- `id`: Unique identifier
- `property_id`: Associated property
- `value`: Estimated property value
- `valuation_date`: Date of valuation
- `valuation_source`: Source of valuation (Zillow, appraisal, etc.)
- `notes`: Additional information
- `created_at`: Record creation timestamp

### Lease
- `id`: Unique identifier
- `property_id`: Associated property
- `tenant_user_id`: Associated tenant user
- `start_date`: Lease start date
- `end_date`: Lease end date
- `rent_amount`: Monthly rent amount
- `security_deposit`: Security deposit amount
- `payment_due_day`: Day of month rent is due
- `lease_document_url`: Uploaded lease document
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

## Relationship Diagram

```
User
 ├── PropertyUser (many-to-many with Property)
 │    └── Property
 │         ├── Expense
 │         │    └── ExpenseShare (connects back to User)
 │         ├── PropertyValuation
 │         └── Lease (connects back to User as tenant)
 └── Direct relationships to Expense (created_by) and ExpenseShare
```

## Key Relationships

1. **User to Property**: Many-to-many through PropertyUser
   - Renters belong to one property
   - Landlords/owners belong to multiple properties
   - Joint owners belong to one or more properties

2. **Property to Expense**: One-to-many
   - Each property has many expenses
   - Each expense belongs to one property

3. **Expense to User**: Many-to-many through ExpenseShare
   - Expenses can be shared among multiple users
   - Users can have shares in multiple expenses

4. **Property to PropertyValuation**: One-to-many
   - Each property has multiple valuation records over time
   - Each valuation belongs to one property

5. **Property to Lease**: One-to-many
   - Each property can have multiple leases (historical)
   - Active leases would be current date between start_date and end_date

This data model supports the complex relationships between users, properties, and expenses while allowing for the different user profiles (renters, landlords, joint owners) described in the requirements.

## User Profiles
- `id`: UUID (references auth.users)
- `name`: User's full name
- `phone`: Contact phone number
- `avatar_url`: URL to user's avatar image
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

## Properties
- `id`: UUID (primary key)
- `name`: Property name/title
- `address`: Physical address (required)
- `latitude`: Geo coords lat
- `longitude`: Geo coords long
- `property_type`: Type (e.g., single-family, apartment, condo)
- `purchase_date`: Date of purchase (nullable for renters)
- `purchase_price`: Original purchase price (nullable for renters)
- `current_value`: Latest estimated value
- `square_meters`: Size of property
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `year_built`: Construction year
- `description`: Property description
- `status`: Active/inactive (defaults to 'active')
- `image_urls`: Array of property images
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp
- `created_by`: UUID (references auth.users) - The user who created the property record

## Property Users (Junction Table)
- `property_id`: UUID (references properties)
- `user_id`: UUID (references auth.users)
- `role`: Text ('owner' or 'shared') - Defaults to 'shared'
- `created_at`: Record creation timestamp

## Relationships
- A user can have one profile (1:1)
- A user can create multiple properties (1:N)
- A property can be associated with multiple users (N:M) through the property_users table
- The property creator is automatically added as an 'owner' in the property_users table

## Access Control
- Users can only view properties they own or are shared with
- Only the creator of a property can update or delete it
- Property owners can add, update, or remove shared users
- Property images are only accessible to property owners and shared users