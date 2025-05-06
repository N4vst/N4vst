<?php
/**
 * Plugin Name: DPP Connector
 * Description: Connect your WooCommerce products with Digital Product Passport API
 * Version: 1.0.0
 * Author: DPP Team
 * License: Apache 2.0
 * License URI: https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain: dpp-connector
 * Domain Path: /languages
 * WC requires at least: 5.0.0
 * WC tested up to: 7.8.0
 *
 * @package DPP_Connector
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main DPP_Connector class
 * 
 * This plugin allows SMEs to connect their WooCommerce products with the DPP API,
 * enabling them to generate and manage digital product passports for their products.
 * 
 * 43.5% of websites use WordPress, making this integration critical for SME adoption.
 */
class DPP_Connector {
    /**
     * Plugin version
     *
     * @var string
     */
    public $version = '1.0.0';

    /**
     * The single instance of the class
     *
     * @var DPP_Connector
     */
    protected static $_instance = null;

    /**
     * Main DPP_Connector Instance
     *
     * Ensures only one instance of DPP_Connector is loaded or can be loaded.
     *
     * @static
     * @return DPP_Connector - Main instance
     */
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Constructor
     */
    public function __construct() {
        $this->define_constants();
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Define constants
     */
    private function define_constants() {
        $this->define('DPP_CONNECTOR_VERSION', $this->version);
        $this->define('DPP_CONNECTOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
        $this->define('DPP_CONNECTOR_PLUGIN_URL', plugin_dir_url(__FILE__));
    }

    /**
     * Define constant if not already set
     *
     * @param string $name
     * @param string|bool $value
     */
    private function define($name, $value) {
        if (!defined($name)) {
            define($name, $value);
        }
    }

    /**
     * Include required files
     */
    private function includes() {
        // Admin includes
        if (is_admin()) {
            include_once DPP_CONNECTOR_PLUGIN_DIR . 'includes/admin/class-dpp-admin.php';
        }

        // Core includes
        include_once DPP_CONNECTOR_PLUGIN_DIR . 'includes/class-dpp-api.php';
        include_once DPP_CONNECTOR_PLUGIN_DIR . 'includes/class-dpp-product-sync.php';
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Register activation hook
        register_activation_hook(__FILE__, array($this, 'activation'));
        
        // Add settings link to plugins page
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
        
        // Admin menu
        add_action('admin_menu', array($this, 'admin_menu'));
        
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
        
        // Product save hook
        add_action('woocommerce_process_product_meta', array($this, 'sync_product_on_save'), 10, 1);
    }

    /**
     * Plugin activation
     */
    public function activation() {
        // Create a default option for the API key
        add_option('dpp_connector_api_key', '');
        add_option('dpp_connector_api_url', 'http://localhost:8000/api');
    }

    /**
     * Add settings link to plugins page
     *
     * @param array $links
     * @return array
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="admin.php?page=dpp-connector">' . __('Settings', 'dpp-connector') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Add admin menu
     */
    public function admin_menu() {
        add_menu_page(
            __('DPP Connector', 'dpp-connector'),
            __('DPP Connector', 'dpp-connector'),
            'manage_options',
            'dpp-connector',
            array($this, 'admin_page'),
            'dashicons-database-export',
            58
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('dpp_connector_options', 'dpp_connector_api_key');
        register_setting('dpp_connector_options', 'dpp_connector_api_url');
    }

    /**
     * Admin page
     */
    public function admin_page() {
        include DPP_CONNECTOR_PLUGIN_DIR . 'includes/admin/views/html-admin-page.php';
    }

    /**
     * Sync product on save
     *
     * @param int $product_id
     */
    public function sync_product_on_save($product_id) {
        // Get the product
        $product = wc_get_product($product_id);
        
        // Check if passport sync is enabled for this product
        $sync_enabled = get_post_meta($product_id, '_dpp_sync_enabled', true);
        
        if ($sync_enabled === 'yes') {
            // Create or update the passport
            $this->sync_product($product);
        }
    }

    /**
     * Sync product with DPP API
     *
     * @param WC_Product $product
     * @return bool
     */
    public function sync_product($product) {
        if (!class_exists('DPP_Product_Sync')) {
            return false;
        }
        
        $sync = new DPP_Product_Sync();
        return $sync->sync_product($product);
    }
}

/**
 * Returns the main instance of DPP_Connector
 *
 * @return DPP_Connector
 */
function DPP_Connector() {
    return DPP_Connector::instance();
}

// Global for backwards compatibility
$GLOBALS['dpp_connector'] = DPP_Connector(); 