# DPP Connector

Digital Product Passport connector for WooCommerce, allowing SMEs to generate and manage product passports to comply with EU regulations.

## Description

The DPP Connector plugin enables WooCommerce store owners to create and manage Digital Product Passports for their products. This allows for easy compliance with EU regulations such as the Ecodesign for Sustainable Products Regulation, which requires products to have digital passports containing sustainability information.

Key features:

- Integration with the Digital Product Passport API
- Product sustainability data management
- Automatic QR code generation for each product
- Support for offline access to passport data
- GDPR-compliant data handling

## Installation

1. Upload the `dpp-connector` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to the DPP Connector settings page
4. Enter your DPP API key and API URL

## Requirements

- WordPress 5.6 or higher
- WooCommerce 5.0 or higher
- PHP 7.4 or higher

## Configuration

### API Setup

1. Go to **DPP Connector** in the WordPress admin menu
2. Enter your API key and API URL
3. Save changes

### Product Setup

1. Edit a product in WooCommerce
2. Go to the "Digital Passport" tab
3. Check "Enable DPP Sync"
4. Enter sustainability data (carbon footprint, recyclability, materials)
5. Save the product

The plugin will automatically create a Digital Product Passport for the product and generate a QR code.

## Bulk Operations

You can sync multiple products at once using the bulk actions on the Products page:

1. Go to **Products** in the WooCommerce menu
2. Select the products you want to sync
3. Choose "Sync with DPP" from the Bulk Actions dropdown
4. Click "Apply"

## How It Works

The plugin connects your WooCommerce store with a Digital Product Passport API, enabling:

1. **Product Data Synchronization**: When you save a product with DPP sync enabled, the plugin sends the product data to the DPP API
2. **Passport Generation**: The API creates a digital passport with a unique QR code
3. **Data Management**: You can update sustainability data through the product edit screen
4. **Compliance**: The generated passports comply with EU regulations for product sustainability information

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for more details.

## Support

For support, please visit our [GitHub repository](https://github.com/example/dpp-connector) or contact us at example@example.com. 