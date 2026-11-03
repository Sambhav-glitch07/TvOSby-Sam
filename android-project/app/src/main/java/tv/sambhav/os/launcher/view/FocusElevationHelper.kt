package tv.sambhav.os.launcher.view

import android.animation.TimeInterpolator
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import androidx.core.view.ViewCompat

/**
 * Handles smooth television focus scaling, elevation, and depth effects
 * calibrated for 60fps performance on Android 9 television processors.
 */
object FocusElevationHelper {

    private val focusInInterpolator: TimeInterpolator = OvershootInterpolator(1.2f)
    private val focusOutInterpolator: TimeInterpolator = DecelerateInterpolator()

    const val DURATION_FOCUS_MS = 220L
    const val SCALE_CARD_FOCUSED = 1.08f
    const val SCALE_CARD_IDLE = 1.0f
    const val ELEVATION_FOCUSED_DP = 18f
    const val ELEVATION_IDLE_DP = 2f

    fun attachFocusAnimation(
        view: View,
        focusedScale: Float = SCALE_CARD_FOCUSED,
        elevateZ: Boolean = true,
        onFocusChanged: ((Boolean) -> Unit)? = null
    ) {
        val density = view.resources.displayMetrics.density
        val focusedElev = ELEVATION_FOCUSED_DP * density
        val idleElev = ELEVATION_IDLE_DP * density

        view.setOnFocusChangeListener { v, hasFocus ->
            val targetScale = if (hasFocus) focusedScale else SCALE_CARD_IDLE
            val targetElevation = if (hasFocus) focusedElev else idleElev
            val interpolator = if (hasFocus) focusInInterpolator else focusOutInterpolator

            v.animate()
                .scaleX(targetScale)
                .scaleY(targetScale)
                .setDuration(DURATION_FOCUS_MS)
                .setInterpolator(interpolator)
                .start()

            if (elevateZ) {
                ViewCompat.animate(v)
                    .translationZ(if (hasFocus) targetElevation else 0f)
                    .setDuration(DURATION_FOCUS_MS)
                    .start()
            }

            onFocusChanged?.invoke(hasFocus)
        }
    }
}
