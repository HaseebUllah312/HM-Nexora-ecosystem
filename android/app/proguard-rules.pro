# Keep Flutter engine & plugin classes
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }

# Keep Android WebView classes & JavaScript channels
-keep class androidx.webkit.** { *; }
-keep class android.webkit.** { *; }
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepclassmembers class io.flutter.plugins.webviewflutter.** { *; }

# Ignore missing optional Play Store split-install components in Flutter engine
-dontwarn com.google.android.play.core.**
-dontwarn io.flutter.embedding.engine.deferredcomponents.**

