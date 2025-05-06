<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php echo esc_html__('Digital Product Passport Connector', 'dpp-connector'); ?></h1>
    
    <?php settings_errors(); ?>
    
    <div class="dpp-admin-content">
        <div class="dpp-admin-content__main">
            <form method="post" action="options.php">
                <?php settings_fields('dpp_connector_options'); ?>
                
                <table class="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label for="dpp_connector_api_key">
                                    <?php echo esc_html__('API Key', 'dpp-connector'); ?>
                                </label>
                            </th>
                            <td>
                                <input 
                                    type="text" 
                                    id="dpp_connector_api_key" 
                                    name="dpp_connector_api_key" 
                                    value="<?php echo esc_attr(get_option('dpp_connector_api_key')); ?>" 
                                    class="regular-text"
                                >
                                <p class="description">
                                    <?php echo esc_html__('Enter your Digital Product Passport API key.', 'dpp-connector'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="dpp_connector_api_url">
                                    <?php echo esc_html__('API URL', 'dpp-connector'); ?>
                                </label>
                            </th>
                            <td>
                                <input 
                                    type="url" 
                                    id="dpp_connector_api_url" 
                                    name="dpp_connector_api_url" 
                                    value="<?php echo esc_attr(get_option('dpp_connector_api_url', 'http://localhost:8000/api')); ?>" 
                                    class="regular-text"
                                >
                                <p class="description">
                                    <?php echo esc_html__('Enter the URL of the Digital Product Passport API.', 'dpp-connector'); ?>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <?php submit_button(__('Save Settings', 'dpp-connector')); ?>
            </form>
        </div>
        
        <div class="dpp-admin-content__sidebar">
            <div class="dpp-card">
                <h2><?php echo esc_html__('Product Sync Status', 'dpp-connector'); ?></h2>
                
                <?php
                // Get products with DPP sync enabled
                $args = array(
                    'post_type'      => 'product',
                    'posts_per_page' => -1,
                    'meta_query'     => array(
                        array(
                            'key'   => '_dpp_sync_enabled',
                            'value' => 'yes',
                        ),
                    ),
                );
                $products = new WP_Query($args);
                ?>
                
                <div class="dpp-sync-status">
                    <p>
                        <strong><?php echo esc_html__('Synced Products:', 'dpp-connector'); ?></strong>
                        <?php echo esc_html($products->found_posts); ?>
                    </p>
                    
                    <a href="<?php echo esc_url(admin_url('edit.php?post_type=product')); ?>" class="button">
                        <?php echo esc_html__('Manage Products', 'dpp-connector'); ?>
                    </a>
                </div>
            </div>
            
            <div class="dpp-card">
                <h2><?php echo esc_html__('Documentation', 'dpp-connector'); ?></h2>
                
                <p><?php echo esc_html__('For more information on how to use this plugin, please refer to the documentation.', 'dpp-connector'); ?></p>
                
                <a href="https://github.com/example/dpp-connector/wiki" target="_blank" class="button">
                    <?php echo esc_html__('View Documentation', 'dpp-connector'); ?>
                </a>
            </div>
        </div>
    </div>
</div>

<style>
.dpp-admin-content {
    display: flex;
    flex-wrap: wrap;
    margin: 20px 0;
}

.dpp-admin-content__main {
    flex: 2;
    margin-right: 20px;
}

.dpp-admin-content__sidebar {
    flex: 1;
    min-width: 250px;
}

.dpp-card {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
}

.dpp-card h2 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.dpp-sync-status {
    margin-bottom: 20px;
}
</style> 