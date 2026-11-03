package tv.sambhav.os.launcher.model

import android.graphics.Color

/**
 * Represents a featured film, series, or live broadcast in the Sambhav TV OS launcher.
 */
data class MediaItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val synopsis: String,
    val categoryBadge: String,
    val technicalBadges: String,
    val rating: String,
    val durationOrEpisodes: String,
    val releaseYear: Int,
    val backdropUrl: String,
    val posterUrl: String,
    val dominantColor: Int = Color.parseColor("#1A202C"),
    val streamUri: String? = null,
    val targetPackage: String? = null,
    val isOriginal: Boolean = true,
    val contentTags: List<String> = emptyList()
)
