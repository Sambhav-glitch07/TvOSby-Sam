package tv.sambhav.os.launcher.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * BroadcastReceiver listening for APK install, update, and uninstall events.
 * Dispatches an internal notification so MainActivity can immediately refresh
 * the installed application carousel.
 */
class PackageChangeReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "PackageChangeReceiver"
        const val ACTION_REFRESH_APPS = "tv.sambhav.os.ACTION_REFRESH_APPS"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val packageName = intent.data?.schemeSpecificPart
        Log.d(TAG, "Package event received: $action for $packageName")

        if (action == Intent.ACTION_PACKAGE_ADDED ||
            action == Intent.ACTION_PACKAGE_REMOVED ||
            action == Intent.ACTION_PACKAGE_REPLACED
        ) {
            val refreshIntent = Intent(ACTION_REFRESH_APPS).apply {
                putExtra("package_name", packageName)
                putExtra("action", action)
                setPackage(context.packageName)
            }
            context.sendBroadcast(refreshIntent)
        }
    }
}
