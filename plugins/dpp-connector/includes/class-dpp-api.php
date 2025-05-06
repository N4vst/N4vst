<?php
/**
 * DPP API Class
 *
 * Handles communication with the Digital Product Passport API.
 *
 * @package DPP_Connector
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DPP_API class
 */
class DPP_API {
    /**
     * API base URL
     *
     * @var string
     */
    private $api_url;

    /**
     * API key
     *
     * @var string
     */
    private $api_key;

    /**
     * Constructor
     */
    public function __construct() {
        $this->api_url = get_option('dpp_connector_api_url', 'http://localhost:8000/api');
        $this->api_key = get_option('dpp_connector_api_key', '');
    }

    /**
     * Make an API request
     *
     * @param string $endpoint
     * @param string $method
     * @param array $data
     * @return array|WP_Error
     */
    public function request($endpoint, $method = 'GET', $data = array()) {
        $url = trailingslashit($this->api_url) . ltrim($endpoint, '/');
        
        $args = array(
            'method'    => $method,
            'timeout'   => 30,
            'headers'   => array(
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ),
        );
        
        // Add authentication if API key is available
        if (!empty($this->api_key)) {
            $args['headers']['Authorization'] = 'Bearer ' . $this->api_key;
        }
        
        // Add data for POST, PUT requests
        if (in_array($method, array('POST', 'PUT')) && !empty($data)) {
            $args['body'] = json_encode($data);
        }
        
        // Make the request
        $response = wp_remote_request($url, $args);
        
        // Check for errors
        if (is_wp_error($response)) {
            return $response;
        }
        
        // Parse response
        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        // Handle error responses
        if ($code >= 400) {
            $error_message = isset($data['detail']) ? $data['detail'] : 'Unknown API error';
            return new WP_Error('dpp_api_error', $error_message, array('status' => $code));
        }
        
        return $data;
    }

    /**
     * Get all passports
     *
     * @return array|WP_Error
     */
    public function get_passports() {
        return $this->request('passports/');
    }

    /**
     * Get a single passport
     *
     * @param string $id
     * @return array|WP_Error
     */
    public function get_passport($id) {
        return $this->request('passports/' . $id . '/');
    }

    /**
     * Create a passport
     *
     * @param array $data
     * @return array|WP_Error
     */
    public function create_passport($data) {
        return $this->request('passports/', 'POST', $data);
    }

    /**
     * Update a passport
     *
     * @param string $id
     * @param array $data
     * @return array|WP_Error
     */
    public function update_passport($id, $data) {
        return $this->request('passports/' . $id . '/', 'PUT', $data);
    }

    /**
     * Delete a passport
     *
     * @param string $id
     * @return array|WP_Error
     */
    public function delete_passport($id) {
        return $this->request('passports/' . $id . '/', 'DELETE');
    }
} 