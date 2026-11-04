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

        try {
            // 1. Query Android TV Leanback-compatible applications first
            val leanbackIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER)
            }
            val leanbackResolves: List<ResolveInfo> = try {
                packageManager.queryIntentActivities(leanbackIntent, 0)
            } catch (t: Throwable) {
                Log.e(TAG, "Error querying leanback activities", t)
                emptyList()
            }

            for (info in leanbackResolves) {
                val pkg = info.activityInfo.packageName
                if (pkg == myPackageName || seenPackages.contains(pkg)) continue

                try {
                    val label = info.loadLabel(packageManager).toString()
                    val icon = try {
                        info.loadIcon(packageManager)
                    } catch (t: Throwable) {
                        null
                    }

                    val item = AppItem(
                        packageName = pkg,
                        activityName = info.activityInfo.name,
                        label = label,
                        icon = icon,
                        banner = null,
                        isLeanbackCompatible = true,
                        category = categorizePackage(pkg),
                        dominantColor = getAppAmbientColor(pkg)
                    )
                    appList.add(item)
                    seenPackages.add(pkg)
                } catch (t: Throwable) {
                    Log.w(TAG, "Skipping resolve info: $pkg", t)
                }
            }

            // 2. Query Standard Android Launchers as fallback for sideloaded or standard apps
            val standardIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val standardResolves: List<ResolveInfo> = try {
                packageManager.queryIntentActivities(standardIntent, 0)
            } catch (t: Throwable) {
                Log.e(TAG, "Error querying standard activities", t)
                emptyList()
            }

            for (info in standardResolves) {
                val pkg = info.activityInfo.packageName
                if (pkg == myPackageName || seenPackages.contains(pkg)) continue

                try {
                    val label = info.loadLabel(packageManager).toString()
                    val icon = try {
                        info.loadIcon(packageManager)
                    } catch (t: Throwable) {
                        null
                    }

                    val item = AppItem(
                        packageName = pkg,
                        activityName = info.activityInfo.name,
                        label = label,
                        icon = icon,
                        banner = null,
                        isLeanbackCompatible = false,
                        category = categorizePackage(pkg),
                        dominantColor = getAppAmbientColor(pkg)
                    )
                    appList.add(item)
                    seenPackages.add(pkg)
                } catch (t: Throwable) {
                    Log.w(TAG, "Skipping standard package: $pkg", t)
                }
            }

            // Sort alphabetically by label
            appList.sortBy { it.label.lowercase() }
        } catch (t: Throwable) {
            Log.e(TAG, "Global error discovering TV apps: ${t.message}", t)
        }
        appList
    }

    /**
     * Generates a signature liquid crystal glass ambient color for any TV app.
     */
    fun getAppAmbientColor(pkg: String): Int {
        val lower = pkg.lowercase()
        return when {
            lower.contains("netflix") -> android.graphics.Color.parseColor("#38060E")
            lower.contains("youtube") -> android.graphics.Color.parseColor("#3D0808")
            lower.contains("primevideo") || lower.contains("amazonvideo") -> android.graphics.Color.parseColor("#092240")
            lower.contains("disney") -> android.graphics.Color.parseColor("#0C184A")
            lower.contains("hotstar") -> android.graphics.Color.parseColor("#06173B")
            lower.contains("spotify") -> android.graphics.Color.parseColor("#07331F")
            lower.contains("apple") -> android.graphics.Color.parseColor("#1C2029")
            lower.contains("plex") -> android.graphics.Color.parseColor("#382305")
            lower.contains("twitch") -> android.graphics.Color.parseColor("#270E45")
            lower.contains("tcl") -> android.graphics.Color.parseColor("#38090C")
            lower.contains("setting") -> android.graphics.Color.parseColor("#151D28")
            else -> {
                val hues = intArrayOf(
                    android.graphics.Color.parseColor("#0F2538"),
                    android.graphics.Color.parseColor("#201235"),
                    android.graphics.Color.parseColor("#0A2B20"),
                    android.graphics.Color.parseColor("#331812"),
                    android.graphics.Color.parseColor("#122A30")
                )
                hues[Math.abs(pkg.hashCode()) % hues.size]
            }
        }
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
