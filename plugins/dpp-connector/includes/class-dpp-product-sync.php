<?php
/**
 * DPP Product Sync Class
 *
 * Handles synchronization of WooCommerce products with the DPP API.
 *
 * @package DPP_Connector
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DPP_Product_Sync class
 */
class DPP_Product_Sync {
    /**
     * API instance
     *
     * @var DPP_API
     */
    private $api;

    /**
     * Constructor
     */
    public function __construct() {
        $this->api = new DPP_API();
    }

    /**
     * Sync product with DPP API
     *
     * @param WC_Product $product
     * @return bool
     */
    public function sync_product($product) {
        if (!$product) {
            return false;
        }
        
        // Get product data
        $product_id = $product->get_id();
        $passport_id = get_post_meta($product_id, '_dpp_passport_id', true);
        
        // Prepare passport data
        $passport_data = $this->prepare_passport_data($product);
        
        // If we have a passport ID, update it, otherwise create a new one
        if ($passport_id) {
            $result = $this->api->update_passport($passport_id, $passport_data);
        } else {
            $result = $this->api->create_passport($passport_data);
            
            // Store the passport ID in the product meta
            if (!is_wp_error($result) && isset($result['id'])) {
                update_post_meta($product_id, '_dpp_passport_id', $result['id']);
            }
        }
        
        // Check if the request was successful
        if (is_wp_error($result)) {
            // Log the error
            error_log('DPP Sync Error: ' . $result->get_error_message());
            return false;
        }
        
        // Update last sync time
        update_post_meta($product_id, '_dpp_last_sync', time());
        
        return true;
    }

    /**
     * Prepare passport data from product
     *
     * @param WC_Product $product
     * @return array
     */
    private function prepare_passport_data($product) {
        $product_id = $product->get_id();
        
        // Generate a unique QR code if not already set
        $qr_code = get_post_meta($product_id, '_dpp_qr_code', true);
        
        if (empty($qr_code)) {
            $qr_code = $this->generate_qr_code($product);
            update_post_meta($product_id, '_dpp_qr_code', $qr_code);
        }
        
        // Get sustainability data
        $carbon_footprint = floatval(get_post_meta($product_id, '_dpp_carbon_footprint', true));
        $recyclable = get_post_meta($product_id, '_dpp_recyclable', true) === 'yes';
        $materials_raw = get_post_meta($product_id, '_dpp_materials', true);
        $materials = array_map('trim', explode(',', $materials_raw));
        
        // Prepare the sustainability data
        $sustainability_data = array(
            'carbon_footprint' => $carbon_footprint,
            'recyclable' => $recyclable,
            'materials' => $materials,
            'product_attributes' => $this->get_product_attributes($product),
            'compliance' => array(
                'eu_ecodesign' => true, // Default to compliant for the MVP
                'regulation_ref' => 'EU Regulation 2022/1369',
            ),
        );
        
        // Prepare the passport data
        $passport_data = array(
            'name' => $product->get_name(),
            'qr_code' => $qr_code,
            'sustainability_data' => $sustainability_data,
        );
        
        return $passport_data;
    }

    /**
     * Generate a QR code for a product
     *
     * @param WC_Product $product
     * @return string
     */
    private function generate_qr_code($product) {
        $prefix = 'DPP';
        $product_id = $product->get_id();
        $site_url = parse_url(site_url(), PHP_URL_HOST);
        $timestamp = time();
        
        // Generate a unique code
        $unique_id = md5($product_id . $site_url . $timestamp);
        
        // Format: DPP-{first 8 chars of site}-{product ID}-{first 8 chars of unique ID}
        $site_part = substr(preg_replace('/[^a-z0-9]/i', '', $site_url), 0, 8);
        $unique_part = substr($unique_id, 0, 8);
        
        $qr_code = sprintf('%s-%s-%s-%s', $prefix, $site_part, $product_id, $unique_part);
        
        return strtoupper($qr_code);
    }

    /**
     * Get product attributes
     *
     * @param WC_Product $product
     * @return array
     */
    private function get_product_attributes($product) {
        $attributes = array();
        
        // Get standard product attributes
        $attributes['weight'] = $product->get_weight();
        $attributes['dimensions'] = array(
            'length' => $product->get_length(),
            'width' => $product->get_width(),
            'height' => $product->get_height(),
        );
        
        // Get custom product attributes
        $product_attributes = $product->get_attributes();
        
        if (!empty($product_attributes)) {
            foreach ($product_attributes as $attribute_name => $attribute) {
                $name = wc_attribute_label($attribute_name, $product);
                
                if ($attribute->is_taxonomy()) {
                    $terms = wp_get_post_terms($product->get_id(), $attribute_name, array('fields' => 'names'));
                    if (!is_wp_error($terms)) {
                        $attributes['attributes'][$name] = implode(', ', $terms);
                    }
                } else {
                    $attributes['attributes'][$name] = $attribute->get_options();
                }
            }
        }
        
        return $attributes;
    }
} 