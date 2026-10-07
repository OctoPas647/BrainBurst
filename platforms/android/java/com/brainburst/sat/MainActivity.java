package com.brainburst.sat;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/* BrainBurst: a WebView that serves the bundled app from assets/. Works fully offline. */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final String START = "https://" + HOST + "/index.html";

    WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        if (Build.VERSION.SDK_INT >= 26) web.setDefaultFocusHighlightEnabled(false);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setBackgroundColor(Color.parseColor("#F5F4FC"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " BrainBurstApp/1.0");

        web.addJavascriptInterface(new UiBridge(), "AndroidUI");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                String path = u.getPath();
                if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
                try {
                    InputStream in = getAssets().open(path.substring(1));
                    WebResourceResponse r = new WebResourceResponse(mime(path), "utf-8", in);
                    Map<String, String> h = new HashMap<>();
                    h.put("Cache-Control", "no-cache");
                    r.setResponseHeaders(h);
                    return r;
                } catch (Exception e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException ignored) { }
                return true;
            }
        });
        web.getSettings().setSupportMultipleWindows(true);
        web.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture, android.os.Message msg) {
                // links with target="_blank" (like the Desmos link) open in the phone's browser
                WebView.HitTestResult r = view.getHitTestResult();
                String url = r != null ? r.getExtra() : null;
                if (url != null) { try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (ActivityNotFoundException ignored) { } }
                return false;
            }
        });

        if (state != null) web.restoreState(state); else web.loadUrl(START);
    }

    static String mime(String p) {
        p = p.toLowerCase(Locale.ROOT);
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }

    @Override
    protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override
    public void onBackPressed() {
        try {
            web.evaluateJavascript("(window.__back ? window.__back() : '')", new ValueCallback<String>() {
                @Override public void onReceiveValue(String v) { if (v == null || !v.contains("h")) finish(); }
            });
        } catch (Exception e) { finish(); }
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onDestroy() { web.destroy(); super.onDestroy(); }

    /* System bars follow the app theme */
    class UiBridge {
        @JavascriptInterface
        public void bars(final String hex, final boolean dark) {
            runOnUiThread(new Runnable() { @Override public void run() {
                try {
                    int c = Color.parseColor(hex);
                    Window w = getWindow();
                    w.setStatusBarColor(c);
                    w.setNavigationBarColor(c);
                    web.setBackgroundColor(c);
                    View d = w.getDecorView();
                    int f = d.getSystemUiVisibility();
                    if (dark) f &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR; else f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    if (Build.VERSION.SDK_INT >= 26) {
                        if (dark) f &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR; else f |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                    }
                    d.setSystemUiVisibility(f);
                } catch (Exception ignored) { }
            }});
        }
    }
}
