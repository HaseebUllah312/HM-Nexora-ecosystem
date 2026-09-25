import 'package:flutter/services.dart';

class NexoraExtensionLoader {
  static String? _cachedFullContentJs;
  static String? _cachedBypassJs;
  static String? _cachedContentCss;
  static String? _cachedPopupHtml;

  /// Complete WebExtension API Polyfill for mobile InAppWebView
  static const String webExtensionPolyfill = r'''
(function() {
  if (window.chrome && window.chrome.runtime && window.chrome.runtime.id) return;

  var _store = {};
  try {
    var raw = localStorage.getItem('__NX_CHROME_STORAGE__');
    if (raw) _store = JSON.parse(raw);
  } catch(e) {}

  window.chrome = {
    runtime: {
      id: "hm_nexora_mobile_extension",
      getURL: function(path) {
        return path;
      },
      sendMessage: function(msg, cb) {
        if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
          window.flutter_inappwebview.callHandler('nexoraBridge', msg);
        }
        if (typeof cb === 'function') cb({ success: true });
      },
      onMessage: {
        addListener: function(fn) {}
      }
    },
    storage: {
      local: {
        get: function(keys, cb) {
          var res = {};
          if (typeof keys === 'string') {
            res[keys] = _store[keys];
          } else if (Array.isArray(keys)) {
            keys.forEach(function(k) { res[k] = _store[k]; });
          } else if (keys === null || keys === undefined) {
            res = Object.assign({}, _store);
          } else if (typeof keys === 'object') {
            for (var k in keys) {
              res[k] = _store.hasOwnProperty(k) ? _store[k] : keys[k];
            }
          }
          if (typeof cb === 'function') cb(res);
          return Promise.resolve(res);
        },
        set: function(items, cb) {
          for (var k in items) {
            _store[k] = items[k];
          }
          try {
            localStorage.setItem('__NX_CHROME_STORAGE__', JSON.stringify(_store));
          } catch(e) {}
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        remove: function(keys, cb) {
          if (typeof keys === 'string') delete _store[keys];
          else if (Array.isArray(keys)) keys.forEach(function(k) { delete _store[k]; });
          try {
            localStorage.setItem('__NX_CHROME_STORAGE__', JSON.stringify(_store));
          } catch(e) {}
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        }
      },
      sync: {
        get: function(k, cb) { return window.chrome.storage.local.get(k, cb); },
        set: function(i, cb) { return window.chrome.storage.local.set(i, cb); }
      }
    },
    tabs: {
      query: function(opts, cb) {
        var tabs = [{ id: 1, active: true, url: window.location.href }];
        if (typeof cb === 'function') cb(tabs);
        return Promise.resolve(tabs);
      },
      sendMessage: function(tabId, msg, cb) {
        if (typeof cb === 'function') cb({ status: "delivered" });
        return Promise.resolve({ status: "delivered" });
      }
    }
  };
  window.browser = window.chrome;
})();
''';

  /// Load and prepare the real document-start bypass scripts
  static Future<String> getBypassScript() => getBypassJs();
  static Future<String> getFullContentScript() => getFullContentJs();

  static Future<String> getBypassJs() async {
    if (_cachedBypassJs != null) return _cachedBypassJs!;
    try {
      final bypass = await rootBundle
          .loadString('assets/extension/content/bypass.js');
      final paste = await rootBundle
          .loadString('assets/extension/content/paste-unlock.js');
      _cachedBypassJs = '$webExtensionPolyfill\n$bypass\n$paste';
    } catch (_) {
      _cachedBypassJs = webExtensionPolyfill;
    }
    return _cachedBypassJs!;
  }

  /// Load and bundle the complete real content scripts & styles
  static Future<String> getFullContentJs() async {
    if (_cachedFullContentJs != null) return _cachedFullContentJs!;
    try {
      final configJs =
          await rootBundle.loadString('assets/extension/shared/config.js');
      final utilsJs =
          await rootBundle.loadString('assets/extension/shared/utils.js');
      final vaultJs = await rootBundle
          .loadString('assets/extension/content/vault-secure.js');
      final contentJs =
          await rootBundle.loadString('assets/extension/content/content.js');
      final contentCss =
          await rootBundle.loadString('assets/extension/content/content.css');

      final escapedCss = contentCss
          .replaceAll('\\', '\\\\')
          .replaceAll('`', '\\`')
          .replaceAll('\$', '\\\$');

      final cssInjector = '''
(function() {
  if (document.getElementById('__nx_extension_real_css__')) return;
  var style = document.createElement('style');
  style.id = '__nx_extension_real_css__';
  style.textContent = `$escapedCss`;
  (document.head || document.documentElement).appendChild(style);
})();
''';

      _cachedFullContentJs = '''
$webExtensionPolyfill
$cssInjector
$configJs
$utilsJs
$vaultJs
$contentJs

// Mobile Lecture Quick Actions Exposer
window.nexoraSkipVideo = function() {
  var vids = document.querySelectorAll('video');
  var found = false;
  vids.forEach(function(v) {
    found = true;
    try {
      v.playbackRate = 16.0;
      if (v.duration && !isNaN(v.duration)) {
        v.currentTime = Math.max(0, v.duration - 0.5);
      }
      v.play();
      v.dispatchEvent(new Event('timeupdate'));
      v.dispatchEvent(new Event('ended'));
    } catch(e) {}
  });
  return found;
};

window.nexoraSetSpeed = function(rate) {
  var vids = document.querySelectorAll('video');
  vids.forEach(function(v) {
    try {
      v.playbackRate = rate;
      v.play();
    } catch(e) {}
  });
  return vids.length > 0;
};
''';
    } catch (e) {
      _cachedFullContentJs = webExtensionPolyfill;
    }
    return _cachedFullContentJs!;
  }

  /// Get Real Popup HTML with inlined CSS and JS for mobile rendering
  static Future<String> getRealPopupHtml() async {
    if (_cachedPopupHtml != null) return _cachedPopupHtml!;
    try {
      var html =
          await rootBundle.loadString('assets/extension/popup/popup.html');
      final css =
          await rootBundle.loadString('assets/extension/popup/popup.css');
      final js =
          await rootBundle.loadString('assets/extension/popup/popup.js');

      // Replace link and script tags with inlined content
      html = html.replaceFirst(
        '<link rel="stylesheet" href="popup.css">',
        '<style>$css\nbody { background: #0A0E1A !important; margin: 0; padding: 12px; }\n.popup-container { width: 100% !important; max-width: 100% !important; box-shadow: none !important; }</style>',
      );
      html = html.replaceFirst(
        '<script src="popup.js"></script>',
        '<script>$webExtensionPolyfill\n$js</script>',
      );

      _cachedPopupHtml = html;
    } catch (e) {
      _cachedPopupHtml = '<h3>HM Nexora Extension</h3>';
    }
    return _cachedPopupHtml!;
  }
}
