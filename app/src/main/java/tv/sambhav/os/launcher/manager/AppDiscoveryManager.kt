package tv.sambhav.os.launcher.manager

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.util.Log
import android.widget.Toast
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import tv.sambhav.os.launcher.model.AppCategory
import tv.sambhav.os.launcher.model.AppItem

/**
 * Discovers and caches installed applications for Sambhav TV OS on Android 9 (API 28).
 * Scans both Leanback TV launchers and standard Android applications, deduplicating
 * and classifying them for the television carousel.
 */
class AppDiscoveryManager(private val context: Context) {

    companion object {
        private const val TAG = "AppDiscoveryManager"
        private const val PREFS_NAME = "sambhav_apps_pref"
        private const val KEY_RECENTS = "key_recent_pkgs"
    }

    private val packageManager: PackageManager = context.packageManager

    suspend fun discoverInstalledApps(): List<AppItem> = withContext(Dispatchers.IO) {
        val appList = ArrayList<AppItem>()
        val seenPackages = HashSet<String>()
        val myPackageName = context.packageName

        // 1. Query Android TV Leanback-compatible applications first
        val leanbackIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER)
        }
        val leanbackResolves: List<ResolveInfo> = try {
            packageManager.queryIntentActivities(leanbackIntent, 0)
        } catch (e: Exception) {
            Log.e(TAG, "Error querying leanback activities", e)
            emptyList()
        }

        for (info in leanbackResolves) {
            val pkg = info.activityInfo.packageName
            if (pkg == myPackageName || seenPackages.contains(pkg)) continue

            try {
                val label = info.loadLabel(packageManager).toString()
                val icon = info.loadIcon(packageManager)
                val banner = info.activityInfo.loadBanner(packageManager)

                val item = AppItem(
                    packageName = pkg,
                    activityName = info.activityInfo.name,
                    label = label,
                    icon = icon,
                    banner = banner,
                    isLeanbackCompatible = true,
                    category = categorizePackage(pkg)
                )
                appList.add(item)
                seenPackages.add(pkg)
            } catch (e: Exception) {
                Log.w(TAG, "Skipping resolve info: $pkg", e)
            }
        }

        // 2. Query Standard Android Launchers as fallback for sideloaded or standard apps
        val standardIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        val standardResolves: List<ResolveInfo> = try {
            packageManager.queryIntentActivities(standardIntent, 0)
        } catch (e: Exception) {
            Log.e(TAG, "Error querying standard activities", e)
            emptyList()
        }

        for (info in standardResolves) {
            val pkg = info.activityInfo.packageName
            if (pkg == myPackageName || seenPackages.contains(pkg)) continue

            try {
                val label = info.loadLabel(packageManager).toString()
                val icon = info.loadIcon(packageManager)

                val item = AppItem(
                    packageName = pkg,
                    activityName = info.activityInfo.name,
                    label = label,
                    icon = icon,
                    banner = null,
                    isLeanbackCompatible = false,
                    category = categorizePackage(pkg)
                )
                appList.add(item)
                seenPackages.add(pkg)
            } catch (e: Exception) {
                Log.w(TAG, "Skipping standard package: $pkg", e)
            }
        }

        // Sort alphabetically by label
        appList.sortBy { it.label.lowercase() }
        appList
    }

    /**
     * Safely launches an application on television hardware.
     */
    fun launchApplication(app: AppItem): Boolean {
        try {
            // First attempt: Leanback or package launch intent
            var launchIntent = packageManager.getLeanbackLaunchIntentForPackage(app.packageName)
            if (launchIntent == null) {
                launchIntent = packageManager.getLaunchIntentForPackage(app.packageName)
            }

            if (launchIntent == null && app.activityName.isNotEmpty()) {
                launchIntent = Intent(Intent.ACTION_MAIN).apply {
                    component = ComponentName(app.packageName, app.activityName)
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
            }

            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
                context.startActivity(launchIntent)
                recordAppLaunched(app.packageName)
                return true
            } else {
                Toast.makeText(context, "Cannot find launch intent for ${app.label}", Toast.LENGTH_SHORT).show()
                return false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch package: ${app.packageName}", e)
            Toast.makeText(context, "Launch error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            return false
        }
    }

    private fun categorizePackage(pkg: String): AppCategory {
        val lower = pkg.lowercase()
        return when {
            lower.contains("netflix") || lower.contains("primevideo") || lower.contains("youtube") ||
            lower.contains("disney") || lower.contains("hulu") || lower.contains("hbo") ||
            lower.contains("hotstar") || lower.contains("apple") || lower.contains("plex") -> AppCategory.STREAMING
            lower.contains("game") || lower.contains("play") || lower.contains("steam") -> AppCategory.GAMING
            lower.contains("setting") || lower.contains("tcl") || lower.contains("android") -> AppCategory.SYSTEM
            else -> AppCategory.ENTERTAINMENT
        }
    }

    private fun recordAppLaunched(packageName: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val recents = prefs.getString(KEY_RECENTS, "")?.split(",")?.toMutableList() ?: mutableListOf()
        recents.remove(packageName)
        recents.add(0, packageName)
        val trimmed = recents.take(12).joinToString(",")
        prefs.edit().putString(KEY_RECENTS, trimmed).apply()
    }

    fun getRecentPackageNames(): List<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val recents = prefs.getString(KEY_RECENTS, "") ?: ""
        return if (recents.isEmpty()) emptyList() else recents.split(",")
    }
}
