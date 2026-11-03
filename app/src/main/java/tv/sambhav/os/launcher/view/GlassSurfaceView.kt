package tv.sambhav.os.launcher.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View

/**
 * A hardware-accelerated frosted glass surface designed specifically for Android 9 (API 28)
 * on television SOCs (e.g. MediaTek / Realtek on TCL smart TVs).
 *
 * Avoids CPU-heavy RenderScript blur at runtime by synthesizing multi-layer specular
 * highlights, dynamic Fresnel reflection gradients, and soft ambient obsidian tints.
 */
class GlassSurfaceView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val surfaceBounds = RectF()
    private val cornerRadius = 14f * resources.displayMetrics.density

    private val glassPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 1.2f * resources.displayMetrics.density
    }

    private val specularPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 1.0f * resources.displayMetrics.density
    }

    private var isGlassFocused = false
    private var baseTint = Color.parseColor("#12FFFFFF")
    private var focusedTint = Color.parseColor("#E6FFFFFF")

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        surfaceBounds.set(
            paddingLeft.toFloat(),
            paddingTop.toFloat(),
            (w - paddingRight).toFloat(),
            (h - paddingBottom).toFloat()
        )
        updateGradients()
    }

    private fun updateGradients() {
        if (surfaceBounds.width() <= 0f || surfaceBounds.height() <= 0f) return

        val topColor = if (isGlassFocused) Color.parseColor("#F5FFFFFF") else Color.parseColor("#1CFFFFFF")
        val bottomColor = if (isGlassFocused) Color.parseColor("#D9E2EC") else Color.parseColor("#08FFFFFF")

        glassPaint.shader = LinearGradient(
            surfaceBounds.left,
            surfaceBounds.top,
            surfaceBounds.left,
            surfaceBounds.bottom,
            topColor,
            bottomColor,
            Shader.TileMode.CLAMP
        )

        val borderTopColor = if (isGlassFocused) Color.parseColor("#FFFFFFFF") else Color.parseColor("#38FFFFFF")
        val borderBottomColor = if (isGlassFocused) Color.parseColor("#B0FFFFFF") else Color.parseColor("#14FFFFFF")

        borderPaint.shader = LinearGradient(
            surfaceBounds.left,
            surfaceBounds.top,
            surfaceBounds.left,
            surfaceBounds.bottom,
            borderTopColor,
            borderBottomColor,
            Shader.TileMode.CLAMP
        )
    }

    fun setGlassFocused(focused: Boolean) {
        if (this.isGlassFocused != focused) {
            this.isGlassFocused = focused
            updateGradients()
            invalidate()
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (surfaceBounds.isEmpty) return

        // 1. Draw base translucent glass body
        canvas.drawRoundRect(surfaceBounds, cornerRadius, cornerRadius, glassPaint)

        // 2. Draw crisp glass border with subtle Fresnel gradient
        canvas.drawRoundRect(surfaceBounds, cornerRadius, cornerRadius, borderPaint)
    }
}
