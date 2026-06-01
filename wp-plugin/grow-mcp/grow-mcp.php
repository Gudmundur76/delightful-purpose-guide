<?php
/**
 * Plugin Name: grow.contact MCP Server
 * Plugin URI: https://grow.contact
 * Description: Turns this WordPress site into a Model Context Protocol (MCP) server so AI agents (ChatGPT, Claude, Perplexity) can query posts, pages, FAQs, products, and submit leads via JSON-RPC over HTTP.
 * Version: 1.0.0
 * Author: grow.contact
 * Author URI: https://grow.contact
 * License: GPL-2.0-or-later
 * Text Domain: grow-mcp
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('GROW_MCP_VERSION', '1.0.0');
define('GROW_MCP_NAMESPACE', 'grow-mcp/v1');
define('GROW_MCP_REGISTRY_URL', 'https://grow.contact/api/public/mcp-register');

// -----------------------------------------------------------------------------
// Settings page
// -----------------------------------------------------------------------------
add_action('admin_menu', function () {
    add_options_page('grow.contact MCP', 'grow.contact MCP', 'manage_options', 'grow-mcp', 'grow_mcp_settings_page');
});

add_action('admin_init', function () {
    register_setting('grow_mcp', 'grow_mcp_token', ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field', 'default' => '']);
    register_setting('grow_mcp', 'grow_mcp_install_token', ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field', 'default' => '']);
    register_setting('grow_mcp', 'grow_mcp_allow_anonymous', ['type' => 'boolean', 'default' => false]);
    register_setting('grow_mcp', 'grow_mcp_enable_lead_submit', ['type' => 'boolean', 'default' => true]);
});

// Auto-register the MCP endpoint with grow.contact whenever settings are saved
// (and on plugin activation if an install token is already present).
function grow_mcp_register_with_platform() {
    $install_token = get_option('grow_mcp_install_token', '');
    if (!$install_token) return;
    $payload = [
        'install_token' => $install_token,
        'mcp_endpoint'  => rest_url(GROW_MCP_NAMESPACE . '/mcp'),
        'discovery_url' => home_url('/.well-known/mcp.json'),
        'site_url'      => home_url('/'),
        'tools_count'   => count(grow_mcp_tools()),
        'plugin_version' => GROW_MCP_VERSION,
    ];
    wp_remote_post(GROW_MCP_REGISTRY_URL, [
        'timeout' => 8,
        'blocking' => false,
        'headers' => ['Content-Type' => 'application/json'],
        'body' => wp_json_encode($payload),
    ]);
}
add_action('update_option_grow_mcp_install_token', 'grow_mcp_register_with_platform', 10, 0);
add_action('add_option_grow_mcp_install_token', 'grow_mcp_register_with_platform', 10, 0);
register_activation_hook(__FILE__, 'grow_mcp_register_with_platform');


function grow_mcp_settings_page() {
    if (!current_user_can('manage_options')) return;
    $token = get_option('grow_mcp_token', '');
    $mcp_url = rest_url(GROW_MCP_NAMESPACE . '/mcp');
    $discovery_url = home_url('/.well-known/mcp.json');
    ?>
    <div class="wrap">
        <h1>grow.contact MCP Server</h1>
        <p>Exposes this site as a Model Context Protocol server so AI agents can query posts, pages, FAQs, products, and submit leads.</p>

        <h2>Endpoints</h2>
        <table class="form-table" role="presentation">
            <tr><th>MCP endpoint</th><td><code><?php echo esc_html($mcp_url); ?></code></td></tr>
            <tr><th>Discovery</th><td><code><?php echo esc_html($discovery_url); ?></code></td></tr>
        </table>

        <form method="post" action="options.php">
            <?php settings_fields('grow_mcp'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="grow_mcp_token">Bearer token</label></th>
                    <td>
                        <input name="grow_mcp_token" id="grow_mcp_token" type="text" class="regular-text code" value="<?php echo esc_attr($token); ?>" />
                        <p class="description">Required for agent requests. Send as <code>Authorization: Bearer &lt;token&gt;</code>. Leave empty + enable anonymous access for fully public read tools.</p>
                    </td>
                </tr>
                <tr>
                    <th>Anonymous read access</th>
                    <td>
                        <label><input type="checkbox" name="grow_mcp_allow_anonymous" value="1" <?php checked(get_option('grow_mcp_allow_anonymous')); ?> />
                        Allow read tools (search_posts, get_page, list_faqs, list_products) without bearer token</label>
                    </td>
                </tr>
                <tr>
                    <th>Lead submission</th>
                    <td>
                        <label><input type="checkbox" name="grow_mcp_enable_lead_submit" value="1" <?php checked(get_option('grow_mcp_enable_lead_submit', true)); ?> />
                        Enable <code>submit_lead</code> tool (creates a draft <code>mcp_lead</code> post)</label>
                    </td>
                </tr>
                <tr>
                    <th><label for="grow_mcp_install_token">grow.contact install token</label></th>
                    <td>
                        <input name="grow_mcp_install_token" id="grow_mcp_install_token" type="text" class="regular-text code" value="<?php echo esc_attr(get_option('grow_mcp_install_token', '')); ?>" />
                        <p class="description">UUID from your grow.contact dashboard. Used to register this site's MCP endpoint with the platform so it appears in the agent-readable directory.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>


        <h2>Quick test</h2>
        <pre style="background:#1a1a1a;color:#e8e8e8;padding:12px;overflow:auto;">curl -X POST '<?php echo esc_html($mcp_url); ?>' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  <?php if ($token) echo "-H 'Authorization: Bearer " . esc_html($token) . "' \\\n  "; ?>-d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'</pre>
    </div>
    <?php
}

// -----------------------------------------------------------------------------
// Custom post type for MCP-submitted leads
// -----------------------------------------------------------------------------
add_action('init', function () {
    register_post_type('mcp_lead', [
        'label' => 'MCP Leads',
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-email-alt',
        'supports' => ['title', 'editor', 'custom-fields'],
    ]);
});

// -----------------------------------------------------------------------------
// REST routes — MCP endpoint + discovery
// -----------------------------------------------------------------------------
add_action('rest_api_init', function () {
    register_rest_route(GROW_MCP_NAMESPACE, '/mcp', [
        'methods'             => ['POST', 'OPTIONS'],
        'callback'            => 'grow_mcp_handle',
        'permission_callback' => '__return_true', // auth handled inside (per-tool)
    ]);
    register_rest_route(GROW_MCP_NAMESPACE, '/server-card', [
        'methods'             => 'GET',
        'callback'            => 'grow_mcp_server_card',
        'permission_callback' => '__return_true',
    ]);
});

// /.well-known/mcp.json discovery
add_action('init', function () {
    add_rewrite_rule('^\.well-known/mcp\.json$', 'index.php?grow_mcp_discovery=1', 'top');
    add_rewrite_tag('%grow_mcp_discovery%', '([0-9]+)');
});

add_action('template_redirect', function () {
    if (get_query_var('grow_mcp_discovery')) {
        nocache_headers();
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        echo wp_json_encode(grow_mcp_build_server_card(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }
});

register_activation_hook(__FILE__, function () { flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, function () { flush_rewrite_rules(); });

// -----------------------------------------------------------------------------
// MCP server card (discovery payload)
// -----------------------------------------------------------------------------
function grow_mcp_build_server_card() {
    $site = get_bloginfo('name');
    return [
        '$schema'     => 'https://modelcontextprotocol.io/schemas/2025-06-18/server-card.json',
        'name'        => sanitize_title($site) . '-mcp',
        'serverInfo'  => ['name' => $site . ' MCP', 'version' => GROW_MCP_VERSION],
        'description' => 'WordPress MCP server for ' . $site . '. Exposes posts, pages, FAQs, products, and lead submission as MCP tools. Powered by grow.contact.',
        'transport'   => [
            'type'     => 'streamable-http',
            'endpoint' => rest_url(GROW_MCP_NAMESPACE . '/mcp'),
            'methods'  => ['POST'],
        ],
        'auth'        => [
            'type'   => 'bearer',
            'header' => 'Authorization',
            'scheme' => 'Bearer',
        ],
        'capabilities' => ['tools' => true, 'resources' => false, 'prompts' => false],
        'vendor'      => ['name' => 'grow.contact', 'url' => 'https://grow.contact'],
    ];
}

function grow_mcp_server_card() {
    return new WP_REST_Response(grow_mcp_build_server_card(), 200);
}

// -----------------------------------------------------------------------------
// Tool registry
// -----------------------------------------------------------------------------
function grow_mcp_tools() {
    $tools = [
        [
            'name' => 'search_posts',
            'description' => 'Full-text search published WordPress posts. Returns title, excerpt, permalink, date.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'query' => ['type' => 'string', 'description' => 'Search term'],
                    'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 25, 'default' => 10],
                ],
                'required' => ['query'],
            ],
            'auth' => 'read',
        ],
        [
            'name' => 'get_post',
            'description' => 'Fetch a single post or page by slug or ID. Returns full HTML and metadata.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'slug' => ['type' => 'string'],
                    'id'   => ['type' => 'integer'],
                ],
            ],
            'auth' => 'read',
        ],
        [
            'name' => 'list_pages',
            'description' => 'List all published pages with title, slug, permalink. Use to discover the site structure.',
            'inputSchema' => ['type' => 'object', 'properties' => []],
            'auth' => 'read',
        ],
        [
            'name' => 'list_faqs',
            'description' => 'List FAQ entries (any post type named faq/faqs or posts in an "faq" category). Returns question + answer pairs.',
            'inputSchema' => ['type' => 'object', 'properties' => []],
            'auth' => 'read',
        ],
        [
            'name' => 'site_info',
            'description' => 'Returns site name, tagline, URL, admin email visibility, and active theme. Use to ground answers about the site identity.',
            'inputSchema' => ['type' => 'object', 'properties' => []],
            'auth' => 'read',
        ],
    ];

    if (class_exists('WooCommerce')) {
        $tools[] = [
            'name' => 'list_products',
            'description' => 'List WooCommerce products with name, price, permalink, stock status.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 20]],
            ],
            'auth' => 'read',
        ];
    }

    if (get_option('grow_mcp_enable_lead_submit', true)) {
        $tools[] = [
            'name' => 'submit_lead',
            'description' => 'Submit a lead/inquiry on behalf of a user. Creates a draft mcp_lead post visible in the WP admin.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'name'    => ['type' => 'string'],
                    'email'   => ['type' => 'string', 'format' => 'email'],
                    'message' => ['type' => 'string'],
                    'source'  => ['type' => 'string', 'description' => 'Which agent submitted it (e.g. claude, chatgpt)'],
                ],
                'required' => ['name', 'email', 'message'],
            ],
            'auth' => 'write',
        ];
    }

    return $tools;
}

// -----------------------------------------------------------------------------
// Auth helper
// -----------------------------------------------------------------------------
function grow_mcp_check_auth(WP_REST_Request $req, $required) {
    $token = get_option('grow_mcp_token', '');
    $allow_anon = (bool) get_option('grow_mcp_allow_anonymous', false);
    $header = $req->get_header('authorization');
    $provided = '';
    if ($header && stripos($header, 'Bearer ') === 0) {
        $provided = trim(substr($header, 7));
    }

    if ($required === 'write') {
        if (!$token || !$provided || !hash_equals($token, $provided)) return false;
        return true;
    }
    // read
    if ($allow_anon) return true;
    if (!$token) return false; // not configured
    return $provided && hash_equals($token, $provided);
}

// -----------------------------------------------------------------------------
// JSON-RPC dispatcher
// -----------------------------------------------------------------------------
function grow_mcp_handle(WP_REST_Request $req) {
    if ($req->get_method() === 'OPTIONS') {
        return new WP_REST_Response(null, 204, [
            'Access-Control-Allow-Origin'  => '*',
            'Access-Control-Allow-Methods' => 'POST, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept',
        ]);
    }

    $body = json_decode($req->get_body(), true);
    if (!is_array($body)) return grow_mcp_rpc_error(null, -32700, 'Parse error');

    $id = $body['id'] ?? null;
    $method = $body['method'] ?? '';
    $params = $body['params'] ?? [];

    switch ($method) {
        case 'initialize':
            return grow_mcp_rpc_result($id, [
                'protocolVersion' => '2025-06-18',
                'capabilities'    => ['tools' => ['listChanged' => false]],
                'serverInfo'      => ['name' => get_bloginfo('name') . ' MCP', 'version' => GROW_MCP_VERSION],
            ]);

        case 'tools/list':
            $tools = array_map(function ($t) {
                return ['name' => $t['name'], 'description' => $t['description'], 'inputSchema' => $t['inputSchema']];
            }, grow_mcp_tools());
            return grow_mcp_rpc_result($id, ['tools' => $tools]);

        case 'tools/call':
            $name = $params['name'] ?? '';
            $args = $params['arguments'] ?? [];
            $tool = current(array_filter(grow_mcp_tools(), fn($t) => $t['name'] === $name));
            if (!$tool) return grow_mcp_rpc_error($id, -32601, "Unknown tool: $name");
            if (!grow_mcp_check_auth($req, $tool['auth'])) {
                return grow_mcp_rpc_error($id, -32001, 'Unauthorized: bearer token required');
            }
            try {
                $result = grow_mcp_run_tool($name, $args);
                return grow_mcp_rpc_result($id, [
                    'content' => [['type' => 'text', 'text' => wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)]],
                ]);
            } catch (Throwable $e) {
                return grow_mcp_rpc_error($id, -32000, $e->getMessage());
            }

        case 'ping':
            return grow_mcp_rpc_result($id, []);

        default:
            return grow_mcp_rpc_error($id, -32601, "Method not found: $method");
    }
}

function grow_mcp_rpc_result($id, $result) {
    return new WP_REST_Response(['jsonrpc' => '2.0', 'id' => $id, 'result' => $result], 200, [
        'Access-Control-Allow-Origin' => '*',
    ]);
}

function grow_mcp_rpc_error($id, $code, $message) {
    $status = $code === -32001 ? 401 : 200; // unauth -> 401, other JSON-RPC errors -> 200
    return new WP_REST_Response(['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $code, 'message' => $message]], $status, [
        'Access-Control-Allow-Origin' => '*',
    ]);
}

// -----------------------------------------------------------------------------
// Tool implementations
// -----------------------------------------------------------------------------
function grow_mcp_run_tool($name, $args) {
    switch ($name) {
        case 'search_posts': {
            $q = sanitize_text_field($args['query'] ?? '');
            $limit = min(25, max(1, intval($args['limit'] ?? 10)));
            $posts = get_posts(['s' => $q, 'post_status' => 'publish', 'posts_per_page' => $limit, 'post_type' => ['post', 'page']]);
            return array_map('grow_mcp_post_summary', $posts);
        }
        case 'get_post': {
            $post = null;
            if (!empty($args['id'])) $post = get_post(intval($args['id']));
            elseif (!empty($args['slug'])) {
                $found = get_posts(['name' => sanitize_title($args['slug']), 'post_type' => ['post', 'page'], 'post_status' => 'publish', 'posts_per_page' => 1]);
                $post = $found[0] ?? null;
            }
            if (!$post || $post->post_status !== 'publish') return ['error' => 'not_found'];
            return [
                'id'        => $post->ID,
                'title'     => get_the_title($post),
                'slug'      => $post->post_name,
                'type'      => $post->post_type,
                'permalink' => get_permalink($post),
                'date'      => $post->post_date_gmt,
                'modified'  => $post->post_modified_gmt,
                'excerpt'   => wp_strip_all_tags(get_the_excerpt($post)),
                'html'      => apply_filters('the_content', $post->post_content),
                'text'      => wp_strip_all_tags(apply_filters('the_content', $post->post_content)),
            ];
        }
        case 'list_pages': {
            $pages = get_pages(['post_status' => 'publish']);
            return array_map(fn($p) => ['id' => $p->ID, 'title' => $p->post_title, 'slug' => $p->post_name, 'permalink' => get_permalink($p)], $pages);
        }
        case 'list_faqs': {
            $faqs = get_posts(['post_type' => ['faq', 'faqs'], 'post_status' => 'publish', 'posts_per_page' => 100]);
            if (empty($faqs)) {
                $faqs = get_posts(['category_name' => 'faq', 'posts_per_page' => 100]);
            }
            return array_map(fn($p) => [
                'question' => get_the_title($p),
                'answer'   => wp_strip_all_tags(apply_filters('the_content', $p->post_content)),
                'permalink'=> get_permalink($p),
            ], $faqs);
        }
        case 'site_info': {
            return [
                'name'        => get_bloginfo('name'),
                'tagline'     => get_bloginfo('description'),
                'url'         => home_url(),
                'language'    => get_bloginfo('language'),
                'theme'       => wp_get_theme()->get('Name'),
                'mcp_version' => GROW_MCP_VERSION,
            ];
        }
        case 'list_products': {
            if (!class_exists('WooCommerce')) return ['error' => 'woocommerce_not_active'];
            $limit = min(50, max(1, intval($args['limit'] ?? 20)));
            $products = wc_get_products(['status' => 'publish', 'limit' => $limit]);
            return array_map(fn($p) => [
                'id'        => $p->get_id(),
                'name'      => $p->get_name(),
                'price'     => $p->get_price(),
                'currency'  => get_woocommerce_currency(),
                'permalink' => $p->get_permalink(),
                'in_stock'  => $p->is_in_stock(),
                'short'     => wp_strip_all_tags($p->get_short_description()),
            ], $products);
        }
        case 'submit_lead': {
            $email = sanitize_email($args['email'] ?? '');
            if (!is_email($email)) throw new Exception('Invalid email');
            $name = sanitize_text_field($args['name'] ?? '');
            $msg  = sanitize_textarea_field($args['message'] ?? '');
            $source = sanitize_text_field($args['source'] ?? 'mcp');
            if (!$name || !$msg) throw new Exception('name and message required');
            $id = wp_insert_post([
                'post_type'    => 'mcp_lead',
                'post_status'  => 'draft',
                'post_title'   => sprintf('[%s] %s <%s>', $source, $name, $email),
                'post_content' => $msg,
                'meta_input'   => ['email' => $email, 'name' => $name, 'source' => $source, 'submitted_at' => gmdate('c')],
            ], true);
            if (is_wp_error($id)) throw new Exception($id->get_error_message());
            return ['ok' => true, 'lead_id' => $id, 'status' => 'draft'];
        }
    }
    throw new Exception("Unhandled tool: $name");
}

function grow_mcp_post_summary($p) {
    return [
        'id'        => $p->ID,
        'title'     => get_the_title($p),
        'slug'      => $p->post_name,
        'type'      => $p->post_type,
        'permalink' => get_permalink($p),
        'excerpt'   => wp_strip_all_tags(get_the_excerpt($p)),
        'date'      => $p->post_date_gmt,
    ];
}
