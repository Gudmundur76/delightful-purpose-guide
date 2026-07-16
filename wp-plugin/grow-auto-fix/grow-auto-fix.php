<?php
/**
 * Plugin Name: grow.contact Auto-Fix
 * Plugin URI: https://grow.contact
 * Description: Automatically improves your site's AI discoverability (ChatGPT, Perplexity, Claude citations) by injecting approved Schema.org JSON-LD, serving a virtual /llms.txt, and patching robots.txt — all pulled from your grow.contact dashboard.
 * Version: 1.0.0
 * Author: grow.contact
 * Author URI: https://grow.contact
 * License: GPL-2.0-or-later
 * Text Domain: grow-auto-fix
 */

if (!defined('ABSPATH')) {
    exit;
}

define('GROW_AUTOFIX_VERSION', '1.0.0');
define('GROW_AUTOFIX_API_BASE', 'https://grow.contact/api/public/inject');
define('GROW_AUTOFIX_TRANSIENT', 'grow_autofix_manifest');
define('GROW_AUTOFIX_TTL', 6 * HOUR_IN_SECONDS);

/* ---------------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------------- */

function grow_autofix_get_token() {
    $token = get_option('grow_autofix_token', '');
    return is_string($token) ? trim($token) : '';
}

function grow_autofix_register_settings() {
    register_setting('grow_autofix', 'grow_autofix_token', [
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => '',
    ]);
}
add_action('admin_init', 'grow_autofix_register_settings');

function grow_autofix_admin_menu() {
    add_options_page(
        'grow.contact Auto-Fix',
        'grow.contact',
        'manage_options',
        'grow-auto-fix',
        'grow_autofix_render_settings_page'
    );
}
add_action('admin_menu', 'grow_autofix_admin_menu');

function grow_autofix_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $token   = grow_autofix_get_token();
    $cached  = get_transient(GROW_AUTOFIX_TRANSIENT);
    $count   = is_array($cached) && isset($cached['interventions']) ? count($cached['interventions']) : 0;
    ?>
    <div class="wrap">
        <h1>grow.contact Auto-Fix</h1>
        <p>Paste the install token from your grow.contact dashboard. The plugin will pull approved Schema.org JSON-LD, llms.txt, and robots.txt updates every 6 hours.</p>
        <form method="post" action="options.php">
            <?php settings_fields('grow_autofix'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="grow_autofix_token">Install token</label></th>
                    <td>
                        <input name="grow_autofix_token" id="grow_autofix_token" type="text" value="<?php echo esc_attr($token); ?>" class="regular-text" placeholder="00000000-0000-0000-0000-000000000000" />
                        <p class="description">Found in your grow.contact dashboard under <em>Sites → your domain → Install</em>.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Status</th>
                    <td>
                        <?php if ($token === ''): ?>
                            <span style="color:#b32d2e;">No token configured.</span>
                        <?php elseif ($count > 0): ?>
                            <span style="color:#1a7f37;">Connected — <?php echo (int) $count; ?> active intervention(s).</span>
                        <?php else: ?>
                            <span>Connected — no approved interventions yet.</span>
                        <?php endif; ?>
                        <br/>
                        <a href="<?php echo esc_url(wp_nonce_url(admin_url('options-general.php?page=grow-auto-fix&grow_refresh=1'), 'grow_refresh')); ?>" class="button" style="margin-top:8px;">Refresh now</a>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <h2>Endpoints handled by this plugin</h2>
        <ul style="list-style:disc; padding-left:20px;">
            <li><code><?php echo esc_html(home_url('/llms.txt')); ?></code> — served from approved llms.txt intervention</li>
            <li><code><?php echo esc_html(home_url('/robots.txt')); ?></code> — patched with approved AI crawler directives</li>
            <li>JSON-LD <code>&lt;script&gt;</code> blocks injected into <code>&lt;head&gt;</code></li>
        </ul>
    </div>
    <?php
}

/* Manual refresh trigger from settings page */
function grow_autofix_handle_manual_refresh() {
    if (!is_admin() || empty($_GET['grow_refresh'])) return;
    if (!current_user_can('manage_options')) return;
    if (!isset($_GET['_wpnonce']) || !wp_verify_nonce($_GET['_wpnonce'], 'grow_refresh')) return;
    delete_transient(GROW_AUTOFIX_TRANSIENT);
    grow_autofix_fetch_manifest(true);
    wp_safe_redirect(admin_url('options-general.php?page=grow-auto-fix'));
    exit;
}
add_action('admin_init', 'grow_autofix_handle_manual_refresh');

/* ---------------------------------------------------------------------------
 * Manifest fetch + cache
 * ------------------------------------------------------------------------- */

function grow_autofix_fetch_manifest($force = false) {
    if (!$force) {
        $cached = get_transient(GROW_AUTOFIX_TRANSIENT);
        if (is_array($cached)) return $cached;
    }
    $token = grow_autofix_get_token();
    if ($token === '') return ['interventions' => []];

    $url = trailingslashit(GROW_AUTOFIX_API_BASE) . rawurlencode($token) . '.json';
    $res = wp_remote_get($url, [
        'timeout'    => 8,
        'user-agent' => 'grow-auto-fix-wp/' . GROW_AUTOFIX_VERSION . '; ' . home_url('/'),
    ]);
    if (is_wp_error($res) || wp_remote_retrieve_response_code($res) !== 200) {
        return ['interventions' => []];
    }
    $data = json_decode(wp_remote_retrieve_body($res), true);
    if (!is_array($data)) $data = ['interventions' => []];
    set_transient(GROW_AUTOFIX_TRANSIENT, $data, GROW_AUTOFIX_TTL);
    return $data;
}

/* ---------------------------------------------------------------------------
 * Cron — refresh every 6h
 * ------------------------------------------------------------------------- */

register_activation_hook(__FILE__, function () {
    if (!wp_next_scheduled('grow_autofix_cron')) {
        wp_schedule_event(time() + 60, 'sixhours', 'grow_autofix_cron');
    }
});
register_deactivation_hook(__FILE__, function () {
    wp_clear_scheduled_hook('grow_autofix_cron');
    delete_transient(GROW_AUTOFIX_TRANSIENT);
});

add_filter('cron_schedules', function ($schedules) {
    $schedules['sixhours'] = ['interval' => 6 * HOUR_IN_SECONDS, 'display' => '6 hours'];
    return $schedules;
});

add_action('grow_autofix_cron', function () {
    grow_autofix_fetch_manifest(true);
});

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

function grow_autofix_get_by_kind($kind) {
    $manifest = grow_autofix_fetch_manifest();
    $out = [];
    foreach (($manifest['interventions'] ?? []) as $row) {
        if (($row['kind'] ?? '') === $kind) $out[] = $row;
    }
    return $out;
}

/* ---------------------------------------------------------------------------
 * Inject Schema.org JSON-LD into <head>
 * ------------------------------------------------------------------------- */

add_action('wp_head', function () {
    foreach (grow_autofix_get_by_kind('schema') as $row) {
        $jsonld = $row['payload']['jsonld'] ?? null;
        if (!$jsonld) continue;
        echo "\n<script type=\"application/ld+json\" data-grow-auto-fix=\"1\">"
            . wp_json_encode($jsonld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            . "</script>\n";
    }
}, 99);

/* ---------------------------------------------------------------------------
 * Virtual /llms.txt
 * ------------------------------------------------------------------------- */

add_action('init', function () {
    add_rewrite_rule('^llms\.txt$', 'index.php?grow_llms=1', 'top');
    add_rewrite_tag('%grow_llms%', '1');
});

register_activation_hook(__FILE__, function () {
    add_rewrite_rule('^llms\.txt$', 'index.php?grow_llms=1', 'top');
    flush_rewrite_rules();
});
register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});

add_action('template_redirect', function () {
    if (get_query_var('grow_llms') !== '1') return;
    $rows = grow_autofix_get_by_kind('llms_txt');
    $body = '';
    if (!empty($rows)) {
        $body = (string) ($rows[0]['payload']['content'] ?? '');
    }
    if ($body === '') {
        $body = "# grow.contact: no approved llms.txt yet\n";
    }
    status_header(200);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: public, max-age=300');
    echo $body;
    exit;
});

/* ---------------------------------------------------------------------------
 * robots.txt — append approved AI crawler directives
 * ------------------------------------------------------------------------- */

add_filter('robots_txt', function ($output, $public) {
    $rows = grow_autofix_get_by_kind('robots_txt');
    if (empty($rows)) return $output;
    $extra = (string) ($rows[0]['payload']['content'] ?? '');
    if ($extra === '') return $output;
    return rtrim($output) . "\n\n# grow.contact auto-fix\n" . trim($extra) . "\n";
}, 10, 2);
