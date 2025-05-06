<?php
/**
 * DPP Admin Class
 *
 * @package DPP_Connector
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DPP_Admin class
 */
class DPP_Admin {
    /**
     * Constructor
     */
    public function __construct() {
        // Add product tab for DPP settings
        add_filter('woocommerce_product_data_tabs', array($this, 'add_product_data_tab'));
        
        // Add product data fields
        add_action('woocommerce_product_data_panels', array($this, 'add_product_data_fields'));
        
        // Save product meta
        add_action('woocommerce_process_product_meta', array($this, 'save_product_meta'));
        
        // Add admin styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));
        
        // Add bulk action
        add_filter('bulk_actions-edit-product', array($this, 'register_bulk_actions'));
        
        // Handle bulk action
        add_filter('handle_bulk_actions-edit-product', array($this, 'handle_bulk_actions'), 10, 3);
        
        // Admin notices
        add_action('admin_notices', array($this, 'bulk_action_admin_notice'));
    }

    /**
     * Add product data tab
     *
     * @param array $tabs
     * @return array
     */
    public function add_product_data_tab($tabs) {
        $tabs['dpp'] = array(
            'label'    => __('Digital Passport', 'dpp-connector'),
            'target'   => 'dpp_product_data',
            'class'    => array(),
            'priority' => 80,
        );
        
        return $tabs;
    }

    /**
     * Add product data fields
     */
    public function add_product_data_fields() {
        global $post;
        
        echo '<div id="dpp_product_data" class="panel woocommerce_options_panel">';
        
        // Enable/disable DPP sync
        woocommerce_wp_checkbox(array(
            'id'          => '_dpp_sync_enabled',
            'label'       => __('Enable DPP Sync', 'dpp-connector'),
            'desc_tip'    => true,
            'description' => __('Enable synchronization with Digital Product Passport API', 'dpp-connector'),
        ));
        
        // Passport ID (read-only if exists)
        $passport_id = get_post_meta($post->ID, '_dpp_passport_id', true);
        
        echo '<div class="options_group">';
        if ($passport_id) {
            echo '<p class="form-field">';
            echo '<label>' . __('Passport ID', 'dpp-connector') . '</label>';
            echo '<span>' . esc_html($passport_id) . '</span>';
            echo '</p>';
            
            // Add link to view passport if we have an ID
            $api_url = get_option('dpp_connector_api_url', 'http://localhost:8000/api');
            $view_url = str_replace('/api', '', $api_url) . '/passports/' . $passport_id;
            
            echo '<p class="form-field">';
            echo '<label></label>';
            echo '<a href="' . esc_url($view_url) . '" target="_blank" class="button">' . __('View Passport', 'dpp-connector') . '</a>';
            echo '</p>';
        }
        echo '</div>';
        
        // Add custom sustainability data fields
        echo '<div class="options_group">';
        echo '<h4 style="padding-left: 12px;">' . __('Sustainability Data', 'dpp-connector') . '</h4>';
        
        // Carbon footprint
        woocommerce_wp_text_input(array(
            'id'          => '_dpp_carbon_footprint',
            'label'       => __('Carbon Footprint (kg CO2)', 'dpp-connector'),
            'desc_tip'    => true,
            'description' => __('Carbon footprint in kg of CO2 equivalent', 'dpp-connector'),
            'type'        => 'number',
            'custom_attributes' => array(
                'step' => '0.01',
                'min'  => '0',
            ),
        ));
        
        // Recyclable
        woocommerce_wp_checkbox(array(
            'id'          => '_dpp_recyclable',
            'label'       => __('Recyclable', 'dpp-connector'),
            'desc_tip'    => true,
            'description' => __('Is this product recyclable?', 'dpp-connector'),
        ));
        
        // Materials
        woocommerce_wp_textarea_input(array(
            'id'          => '_dpp_materials',
            'label'       => __('Materials', 'dpp-connector'),
            'desc_tip'    => true,
            'description' => __('List of materials used in this product (comma separated)', 'dpp-connector'),
        ));
        
        echo '</div>';
        
        // Last sync date (if available)
        $last_sync = get_post_meta($post->ID, '_dpp_last_sync', true);
        
        if ($last_sync) {
            echo '<div class="options_group">';
            echo '<p class="form-field">';
            echo '<label>' . __('Last Synced', 'dpp-connector') . '</label>';
            echo '<span>' . esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $last_sync)) . '</span>';
            echo '</p>';
            echo '</div>';
        }
        
        echo '</div>'; // End of #dpp_product_data
    }

    /**
     * Save product meta
     *
     * @param int $post_id
     */
    public function save_product_meta($post_id) {
        // Save sync enabled
        $sync_enabled = isset($_POST['_dpp_sync_enabled']) ? 'yes' : 'no';
        update_post_meta($post_id, '_dpp_sync_enabled', $sync_enabled);
        
        // Save sustainability data
        if (isset($_POST['_dpp_carbon_footprint'])) {
            update_post_meta($post_id, '_dpp_carbon_footprint', sanitize_text_field($_POST['_dpp_carbon_footprint']));
        }
        
        if (isset($_POST['_dpp_recyclable'])) {
            update_post_meta($post_id, '_dpp_recyclable', 'yes');
        } else {
            update_post_meta($post_id, '_dpp_recyclable', 'no');
        }
        
        if (isset($_POST['_dpp_materials'])) {
            update_post_meta($post_id, '_dpp_materials', sanitize_textarea_field($_POST['_dpp_materials']));
        }
        
        // If sync is enabled, trigger sync
        if ($sync_enabled === 'yes') {
            $product = wc_get_product($post_id);
            DPP_Connector()->sync_product($product);
            
            // Update last sync time
            update_post_meta($post_id, '_dpp_last_sync', time());
        }
    }

    /**
     * Enqueue admin styles
     */
    public function enqueue_admin_styles() {
        wp_enqueue_style('dpp-admin-styles', DPP_CONNECTOR_PLUGIN_URL . 'assets/css/admin.css', array(), DPP_CONNECTOR_VERSION);
    }

    /**
     * Register bulk actions
     *
     * @param array $actions
     * @return array
     */
    public function register_bulk_actions($actions) {
        $actions['sync_with_dpp'] = __('Sync with DPP', 'dpp-connector');
        return $actions;
    }

    /**
     * Handle bulk actions
     *
     * @param string $redirect_to
     * @param string $action
     * @param array $post_ids
     * @return string
     */
    public function handle_bulk_actions($redirect_to, $action, $post_ids) {
        if ($action !== 'sync_with_dpp') {
            return $redirect_to;
        }
        
        $synced_count = 0;
        
        foreach ($post_ids as $post_id) {
            // Enable DPP sync for the product
            update_post_meta($post_id, '_dpp_sync_enabled', 'yes');
            
            // Sync the product
            $product = wc_get_product($post_id);
            $synced = DPP_Connector()->sync_product($product);
            
            if ($synced) {
                $synced_count++;
                update_post_meta($post_id, '_dpp_last_sync', time());
            }
        }
        
        $redirect_to = add_query_arg('dpp_synced_count', $synced_count, $redirect_to);
        
        return $redirect_to;
    }

    /**
     * Bulk action admin notice
     */
    public function bulk_action_admin_notice() {
        if (!empty($_REQUEST['dpp_synced_count'])) {
            $count = intval($_REQUEST['dpp_synced_count']);
            
            $message = sprintf(
                _n(
                    'Synced %s product with Digital Product Passport.',
                    'Synced %s products with Digital Product Passport.',
                    $count,
                    'dpp-connector'
                ),
                $count
            );
            
            echo '<div class="notice notice-success is-dismissible"><p>' . esc_html($message) . '</p></div>';
        }
    }
} 