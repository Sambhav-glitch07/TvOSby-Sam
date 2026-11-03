# Sambhav TV OS ProGuard rules
-keep class tv.sambhav.os.launcher.** { *; }
-keep class androidx.leanback.** { *; }
-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}
-dontwarn okio.**
