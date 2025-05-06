# DPP Integration Guide

This guide provides instructions for setting up and using the Digital Product Passport (DPP) system with various platforms, with a focus on small and medium-sized enterprises (SMEs).

## WordPress / WooCommerce Integration

WordPress powers 43.5% of all websites, making it an essential platform for DPP integration to reach SMEs. The DPP Connector plugin provides a seamless way to integrate your WooCommerce store with the DPP API.

### Installation

1. Download the `dpp-connector` plugin from the GitHub repository
2. Upload the plugin folder to your WordPress installation's `/wp-content/plugins/` directory
3. Activate the plugin through the WordPress admin interface

### Configuration

#### API Setup

1. In your WordPress admin dashboard, navigate to the **DPP Connector** menu
2. Enter your DPP API key in the "API Key" field
   - You can obtain an API key by registering at the [DPP Portal](http://localhost:8000/admin/)
3. Enter the API URL in the "API URL" field (e.g., `http://localhost:8000/api`)
4. Click "Save Settings"

#### Product Configuration

1. Go to **Products → All Products** in your WooCommerce menu
2. Edit a product you want to add a Digital Product Passport to
3. Navigate to the "Digital Passport" tab in the product data section
4. Check the "Enable DPP Sync" checkbox
5. Fill in the sustainability data:
   - Carbon Footprint: Enter the carbon footprint in kg CO2 equivalent
   - Recyclable: Check if the product is recyclable
   - Materials: Enter a comma-separated list of materials used in the product
6. Save the product

After saving, the plugin will automatically create a Digital Product Passport for the product and generate a unique QR code.

### Bulk Operations

To sync multiple products at once:

1. Go to **Products → All Products**
2. Select the checkboxes next to the products you want to sync
3. From the "Bulk Actions" dropdown, select "Sync with DPP"
4. Click "Apply"

### Troubleshooting

If you encounter issues with the plugin:

1. Check that your API key is correct and has the necessary permissions
2. Verify that the API URL is accessible from your server
3. Check your PHP error logs for any specific error messages
4. Ensure your server can make outbound HTTP requests

## Custom API Integration

For businesses not using WordPress, you can integrate directly with the DPP API.

### API Endpoints

The following endpoints are available:

- `GET /api/passports/` - List all passports
- `GET /api/passports/{id}/` - Retrieve a specific passport
- `POST /api/passports/` - Create a new passport
- `PUT /api/passports/{id}/` - Update an existing passport
- `DELETE /api/passports/{id}/` - Delete a passport
- `DELETE /api/passports/delete_all/` - Delete all passports (GDPR compliance)

### Authentication

All API requests require authentication using a bearer token:

```
Authorization: Bearer YOUR_API_KEY
```

### Creating a Passport

To create a new passport, make a POST request to `/api/passports/` with the following data:

```json
{
  "name": "Product Name",
  "qr_code": "UNIQUE_QR_CODE",
  "sustainability_data": {
    "carbon_footprint": 10.5,
    "recyclable": true,
    "materials": ["wood", "metal"],
    "compliance": {
      "eu_ecodesign": true,
      "regulation_ref": "EU Regulation 2022/1369"
    }
  }
}
```

### Displaying a Passport

To display a passport in your application, you can use our React component or build your own integration using the API.

#### Using the React Component

```jsx
import PassportViewer from 'dpp-components';

function ProductPage({ passportId }) {
  return (
    <div>
      <h1>Product Details</h1>
      <PassportViewer passportId={passportId} />
    </div>
  );
}
```

#### Building Your Own Integration

1. Fetch the passport data from the API
2. Store the data in localStorage for offline access
3. Display the data in your application
4. Show an offline notice when the user is offline

## QR Code Integration

Digital Product Passports use QR codes for easy access. The system generates unique QR codes for each product.

### QR Code Format

The QR code format is:

```
DPP-{SITE}-{PRODUCT_ID}-{UNIQUE_ID}
```

### Scanning QR Codes

When a customer scans the QR code, they should be directed to:

```
https://your-dpp-frontend.com/passports/{PASSPORT_ID}
```

This page will display the product passport information, even if the user is offline (using localStorage).

## GDPR Compliance

The DPP system is designed to be GDPR compliant:

1. All personal data is encrypted using industry-standard encryption
2. Products can be deleted individually or in bulk
3. The API provides endpoints for data deletion
4. Data is only stored for the minimum time necessary 