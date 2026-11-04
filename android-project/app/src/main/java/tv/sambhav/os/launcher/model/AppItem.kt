package tv.sambhav.os.launcher.model

import android.graphics.drawable.Drawable

/**
 * Model representing an installed television application, game, or system tool.
 */
data class AppItem(
    val packageName: String,
    val activityName: String,
    val label: String,
    val icon: Drawable? = null,
    val banner: Drawable? = null,
    val isSystemApp: Boolean = false,
    val isLeanbackCompatible: Boolean = true,
    val launchCount: Int = 0,
    val lastUsedTimestamp: Long = 0L,
    val category: AppCategory = AppCategory.ENTERTAINMENT,
    val dominantColor: Int = android.graphics.Color.parseColor("#0C182A")
)

enum class AppCategory {
    ENTERTAINMENT,
    GAMING,
    STREAMING,
    UTILITIES,
    SYSTEM
}
