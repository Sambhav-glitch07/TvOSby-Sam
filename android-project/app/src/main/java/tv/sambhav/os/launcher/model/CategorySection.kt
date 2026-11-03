package tv.sambhav.os.launcher.model

enum class LauncherTab(val title: String) {
    HOME("Home"),
    MOVIES("Movies"),
    SHOWS("Shows"),
    APPS("Apps"),
    SETTINGS("Settings")
}

data class TvHardwareInput(
    val id: String,
    val title: String,
    val subtitle: String,
    val isConnected: Boolean,
    val inputUri: String? = null
)
