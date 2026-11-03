package tv.sambhav.os.launcher

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ArgbEvaluator
import android.animation.ValueAnimator
import android.app.AlertDialog
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.util.Log
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.widget.NestedScrollView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import tv.sambhav.os.launcher.adapter.AppTileAdapter
import tv.sambhav.os.launcher.adapter.MediaCardAdapter
import tv.sambhav.os.launcher.manager.AppDiscoveryManager
import tv.sambhav.os.launcher.manager.TvInputManagerHelper
import tv.sambhav.os.launcher.model.AppItem
import tv.sambhav.os.launcher.model.LauncherTab
import tv.sambhav.os.launcher.model.MediaItem
import tv.sambhav.os.launcher.model.TvHardwareInput
import tv.sambhav.os.launcher.receiver.PackageChangeReceiver
import tv.sambhav.os.launcher.view.FocusElevationHelper
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Sambhav TV OS - Flagship Apple tvOS-inspired Television Launcher for Android 9 (API 28).
 * Optimized specifically for TCL 4K Smart TVs and Android TV boxes.
 *
 * Implements:
 * - 16:9 Cinematic Layout with Dual-layer Frosted Glass Surfaces
 * - Hardware D-Pad Remote Navigation with Focus Traversal & Memory Restoration
 * - Dynamic Background Cross-fading and Ambient Lighting Glow
 * - Automatic Installed Application Discovery & Leanback Launch Intent Resolution
 * - TCL TV Input / HDMI eARC Source Management
 * - Full TV Key Handling (Back, Menu, Input, Media Keys)
 * - Memory-friendly caching for low-RAM television hardware (1GB-2GB RAM)
 */
class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "SambhavTvOs"
        private const val PREFS_NAME = "sambhav_tv_launcher_prefs"
        private const val KEY_ACTIVE_TAB = "pref_key_active_tab"
        private const val KEY_FAVORITE_MEDIA = "pref_key_fav_media"
        private const val KEY_PICTURE_MODE = "pref_key_picture_mode"

        // Idle hero slideshow delay (in milliseconds)
        private const val HERO_AUTOPLAY_DELAY_MS = 25000L
        private const val CLOCK_UPDATE_INTERVAL_MS = 1000L
        private const val BACKDROP_CROSSFADE_DURATION_MS = 380L
    }

    // Coroutine Scope for background I/O operations
    private val activityScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var appDiscoveryJob: Job? = null

    // UI View References
    private lateinit var rootContainer: FrameLayout
    private lateinit var mainScrollView: NestedScrollView
    private lateinit var ivBackdrop: ImageView
    private lateinit var viewAmbientGlow: View

    // Top Bar UI
    private lateinit var layoutTopBar: LinearLayout
    private lateinit var tabHome: TextView
    private lateinit var tabMovies: TextView
    private lateinit var tabShows: TextView
    private lateinit var tabApps: TextView
    private lateinit var tabSettings: TextView
    private lateinit var tvClock: TextView
    private lateinit var tvNetworkStatus: TextView

    // Hero Showcase Banner UI
    private lateinit var layoutHeroBanner: LinearLayout
    private lateinit var tvHeroBadgeNetwork: TextView
    private lateinit var tvHeroBadgeTech: TextView
    private lateinit var tvHeroRating: TextView
    private lateinit var tvHeroTitle: TextView
    private lateinit var tvHeroSynopsis: TextView
    private lateinit var btnHeroWatch: TextView
    private lateinit var btnHeroTrailer: TextView
    private lateinit var btnHeroWatchlist: TextView

    // Carousels (Horizontal RecyclerViews)
    private lateinit var rvRecentApps: RecyclerView
    private lateinit var rvFeaturedCinematic: RecyclerView
    private lateinit var rvInstalledApps: RecyclerView
    private lateinit var rvSambhavShows: RecyclerView
    private lateinit var rvHardwareInputs: RecyclerView

    // Adapters
    private lateinit var recentAppsAdapter: AppTileAdapter
    private lateinit var installedAppsAdapter: AppTileAdapter
    private lateinit var featuredCinematicAdapter: MediaCardAdapter
    private lateinit var sambhavShowsAdapter: MediaCardAdapter
    private lateinit var hardwareInputsAdapter: HardwareInputAdapter

    // System Managers & Helpers
    private lateinit var appDiscoveryManager: AppDiscoveryManager
    private lateinit var tvInputManagerHelper: TvInputManagerHelper
    private lateinit var sharedPreferences: SharedPreferences
    private var connectivityManager: ConnectivityManager? = null

    // State Variables
    private var activeTab: LauncherTab = LauncherTab.HOME
    private var currentHeroMedia: MediaItem? = null
    private var lastFocusedView: View? = null
    private var lastUserInteractionTime = SystemClock.uptimeMillis()
    private var currentBackdropColor: Int = Color.parseColor("#05070A")

    // In-memory data collections
    private val allInstalledApps = ArrayList<AppItem>()
    private val recentApps = ArrayList<AppItem>()
    private val featuredMediaItems = ArrayList<MediaItem>()
    private val originalShowsItems = ArrayList<MediaItem>()
    private val tvHardwareInputs = ArrayList<TvHardwareInput>()

    // Handlers & Runnables
    private val mainHandler = Handler(Looper.getMainLooper())
    private val clockTicker = object : Runnable {
        override fun run() {
            updateSystemClockDisplay()
            mainHandler.postDelayed(this, CLOCK_UPDATE_INTERVAL_MS)
        }
    }

    private val heroSlideshowRunnable = object : Runnable {
        override fun run() {
            val now = SystemClock.uptimeMillis()
            if (now - lastUserInteractionTime >= HERO_AUTOPLAY_DELAY_MS && activeTab == LauncherTab.HOME) {
                cycleNextFeaturedHero()
            }
            mainHandler.postDelayed(this, HERO_AUTOPLAY_DELAY_MS)
        }
    }

    // Broadcast receiver for dynamic app install/remove updates
    private val packageUpdateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val action = intent.getStringExtra("action")
            val pkg = intent.getStringExtra("package_name")
            Log.d(TAG, "Dynamic package event: $action for $pkg")
            refreshInstalledApplications()
        }
    }

    // Network status listener
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            runOnUiThread {
                tvNetworkStatus.text = "Connected"
                tvNetworkStatus.setTextColor(ContextCompat.getColor(this@MainActivity, R.color.tv_accent_emerald))
            }
        }

        override fun onLost(network: Network) {
            runOnUiThread {
                tvNetworkStatus.text = "Offline"
                tvNetworkStatus.setTextColor(ContextCompat.getColor(this@MainActivity, R.color.tv_text_tertiary))
            }
        }
    }

    // =========================================================================
    // Activity Lifecycle
    // =========================================================================

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize Services & Storage
        sharedPreferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        appDiscoveryManager = AppDiscoveryManager(this)
        tvInputManagerHelper = TvInputManagerHelper(this)
        connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager

        // Bind Views
        bindViews()

        // Populate Mock & Catalog Data
        initializeMediaCatalog()

        // Setup UI Sections
        setupTopBarNavigation()
        setupHeroBannerActions()
        setupCarousels()
        setupAmbientLighting()

        // Asynchronously load real installed apps from PackageManager
        refreshInstalledApplications()
        refreshTvHardwareInputs()

        // Register internal app update broadcast receiver
        val filter = IntentFilter(PackageChangeReceiver.ACTION_REFRESH_APPS)
        registerReceiver(packageUpdateReceiver, filter)

        // Register network monitor
        registerNetworkMonitoring()

        // Set initial hero presentation
        if (featuredMediaItems.isNotEmpty()) {
            displayHeroMedia(featuredMediaItems[0])
        }

        // Restore initial focus to the "Play Now" action button
        btnHeroWatch.post {
            btnHeroWatch.requestFocus()
        }
    }

    override fun onStart() {
        super.onStart()
        mainHandler.post(clockTicker)
        mainHandler.postDelayed(heroSlideshowRunnable, HERO_AUTOPLAY_DELAY_MS)
    }

    override fun onResume() {
        super.onResume()
        lastUserInteractionTime = SystemClock.uptimeMillis()
        // Refresh recents row in case user launched an app and came back
        updateRecentAppsRow()
    }

    override fun onPause() {
        super.onPause()
        mainHandler.removeCallbacks(heroSlideshowRunnable)
    }

    override fun onStop() {
        super.onStop()
        mainHandler.removeCallbacks(clockTicker)
        mainHandler.removeCallbacks(heroSlideshowRunnable)
    }

    override fun onDestroy() {
        super.onDestroy()
        activityScope.cancel()
        try {
            unregisterReceiver(packageUpdateReceiver)
        } catch (e: Exception) {
            Log.w(TAG, "Receiver not registered", e)
        }
        try {
            connectivityManager?.unregisterNetworkCallback(networkCallback)
        } catch (e: Exception) {
            Log.w(TAG, "Network callback not registered", e)
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        // Returning to launcher home from an external application
        switchTab(LauncherTab.HOME)
        mainScrollView.smoothScrollTo(0, 0)
        btnHeroWatch.requestFocus()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString(KEY_ACTIVE_TAB, activeTab.name)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        val tabName = savedInstanceState.getString(KEY_ACTIVE_TAB)
        if (tabName != null) {
            try {
                switchTab(LauncherTab.valueOf(tabName))
            } catch (e: Exception) {
                switchTab(LauncherTab.HOME)
            }
        }
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        if (level >= TRIM_MEMORY_RUNNING_LOW) {
            Log.i(TAG, "Low TV memory: clearing transient caches")
            System.gc()
        }
    }

    override fun onLowMemory() {
        super.onLowMemory()
        Log.w(TAG, "System low memory: releasing background resources")
    }

    // =========================================================================
    // View Binding & Initialization
    // =========================================================================

    private fun bindViews() {
        rootContainer = findViewById(R.id.root_tv_container)
        mainScrollView = findViewById(R.id.main_scroll_view)
        ivBackdrop = findViewById(R.id.iv_backdrop)
        viewAmbientGlow = findViewById(R.id.view_ambient_glow)

        layoutTopBar = findViewById(R.id.layout_top_bar)
        tabHome = findViewById(R.id.tab_home)
        tabMovies = findViewById(R.id.tab_movies)
        tabShows = findViewById(R.id.tab_shows)
        tabApps = findViewById(R.id.tab_apps)
        tabSettings = findViewById(R.id.tab_settings)
        tvClock = findViewById(R.id.tv_clock)
        tvNetworkStatus = findViewById(R.id.tv_network_status)

        layoutHeroBanner = findViewById(R.id.layout_hero_banner)
        tvHeroBadgeNetwork = findViewById(R.id.tv_hero_badge_network)
        tvHeroBadgeTech = findViewById(R.id.tv_hero_badge_tech)
        tvHeroRating = findViewById(R.id.tv_hero_rating)
        tvHeroTitle = findViewById(R.id.tv_hero_title)
        tvHeroSynopsis = findViewById(R.id.tv_hero_synopsis)
        btnHeroWatch = findViewById(R.id.btn_hero_watch)
        btnHeroTrailer = findViewById(R.id.btn_hero_trailer)
        btnHeroWatchlist = findViewById(R.id.btn_hero_watchlist)

        rvRecentApps = findViewById(R.id.rv_recent_apps)
        rvFeaturedCinematic = findViewById(R.id.rv_featured_cinematic)
        rvInstalledApps = findViewById(R.id.rv_installed_apps)
        rvSambhavShows = findViewById(R.id.rv_sambhav_shows)
        rvHardwareInputs = findViewById(R.id.rv_hardware_inputs)
    }

    // =========================================================================
    // Top Bar & Navigation Engine
    // =========================================================================

    private fun setupTopBarNavigation() {
        val tabs = listOf(
            tabHome to LauncherTab.HOME,
            tabMovies to LauncherTab.MOVIES,
            tabShows to LauncherTab.SHOWS,
            tabApps to LauncherTab.APPS,
            tabSettings to LauncherTab.SETTINGS
        )

        for ((textView, tab) in tabs) {
            FocusElevationHelper.attachFocusAnimation(
                view = textView,
                focusedScale = 1.06f,
                elevateZ = true
            ) { hasFocus ->
                if (hasFocus) {
                    recordUserInteraction()
                    textView.setTextColor(ContextCompat.getColor(this, R.color.tv_text_dark))
                } else {
                    val isSelectedTab = (activeTab == tab)
                    textView.setTextColor(
                        if (isSelectedTab) ContextCompat.getColor(this, R.color.tv_text_primary)
                        else ContextCompat.getColor(this, R.color.tv_text_secondary)
                    )
                }
            }

            textView.setOnClickListener {
                switchTab(tab)
            }
        }

        updateTabSelectionVisuals()
    }

    private fun switchTab(newTab: LauncherTab) {
        if (activeTab == newTab && activeTab != LauncherTab.SETTINGS) return

        activeTab = newTab
        updateTabSelectionVisuals()
        recordUserInteraction()

        when (newTab) {
            LauncherTab.HOME -> {
                layoutHeroBanner.visibility = View.VISIBLE
                rvRecentApps.visibility = View.VISIBLE
                rvFeaturedCinematic.visibility = View.VISIBLE
                rvInstalledApps.visibility = View.VISIBLE
                rvSambhavShows.visibility = View.VISIBLE
                rvHardwareInputs.visibility = View.VISIBLE
                mainScrollView.smoothScrollTo(0, 0)
            }
            LauncherTab.MOVIES -> {
                layoutHeroBanner.visibility = View.VISIBLE
                rvRecentApps.visibility = View.GONE
                rvFeaturedCinematic.visibility = View.VISIBLE
                rvInstalledApps.visibility = View.GONE
                rvSambhavShows.visibility = View.VISIBLE
                rvHardwareInputs.visibility = View.GONE
                mainScrollView.smoothScrollTo(0, 0)
                if (featuredMediaItems.isNotEmpty()) {
                    displayHeroMedia(featuredMediaItems[0])
                }
            }
            LauncherTab.SHOWS -> {
                layoutHeroBanner.visibility = View.VISIBLE
                rvRecentApps.visibility = View.GONE
                rvFeaturedCinematic.visibility = View.GONE
                rvInstalledApps.visibility = View.GONE
                rvSambhavShows.visibility = View.VISIBLE
                rvHardwareInputs.visibility = View.GONE
                mainScrollView.smoothScrollTo(0, 0)
                if (originalShowsItems.isNotEmpty()) {
                    displayHeroMedia(originalShowsItems[0])
                }
            }
            LauncherTab.APPS -> {
                layoutHeroBanner.visibility = View.GONE
                rvRecentApps.visibility = View.VISIBLE
                rvFeaturedCinematic.visibility = View.GONE
                rvInstalledApps.visibility = View.VISIBLE
                rvSambhavShows.visibility = View.GONE
                rvHardwareInputs.visibility = View.VISIBLE
                mainScrollView.smoothScrollTo(0, 0)
                rvInstalledApps.post { rvInstalledApps.requestFocus() }
            }
            LauncherTab.SETTINGS -> {
                openGlassSettingsDialog()
            }
        }
    }

    private fun updateTabSelectionVisuals() {
        val tabMap = mapOf(
            LauncherTab.HOME to tabHome,
            LauncherTab.MOVIES to tabMovies,
            LauncherTab.SHOWS to tabShows,
            LauncherTab.APPS to tabApps,
            LauncherTab.SETTINGS to tabSettings
        )

        for ((tab, textView) in tabMap) {
            val isSelected = (tab == activeTab)
            textView.isSelected = isSelected
            if (!textView.hasFocus()) {
                textView.setTextColor(
                    if (isSelected) ContextCompat.getColor(this, R.color.tv_text_primary)
                    else ContextCompat.getColor(this, R.color.tv_text_secondary)
                )
            }
        }
    }

    private fun updateSystemClockDisplay() {
        val formatter = SimpleDateFormat("h:mm a", Locale.getDefault())
        tvClock.text = formatter.format(Date())
    }

    private fun registerNetworkMonitoring() {
        if (connectivityManager == null) return
        val builder = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        try {
            connectivityManager?.registerNetworkCallback(builder.build(), networkCallback)
        } catch (e: Exception) {
            Log.e(TAG, "Failed registering network callback", e)
        }
    }

    // =========================================================================
    // Cinematic Hero Banner Engine
    // =========================================================================

    private fun setupHeroBannerActions() {
        FocusElevationHelper.attachFocusAnimation(btnHeroWatch, 1.08f, true) { hasFocus ->
            if (hasFocus) btnHeroWatch.setTextColor(Color.BLACK)
            else btnHeroWatch.setTextColor(Color.WHITE)
        }

        FocusElevationHelper.attachFocusAnimation(btnHeroTrailer, 1.08f, true) { hasFocus ->
            if (hasFocus) btnHeroTrailer.setTextColor(Color.BLACK)
            else btnHeroTrailer.setTextColor(ContextCompat.getColor(this, R.color.tv_text_secondary))
        }

        FocusElevationHelper.attachFocusAnimation(btnHeroWatchlist, 1.08f, true) { hasFocus ->
            if (hasFocus) btnHeroWatchlist.setTextColor(Color.BLACK)
            else btnHeroWatchlist.setTextColor(ContextCompat.getColor(this, R.color.tv_text_secondary))
        }

        btnHeroWatch.setOnClickListener {
            currentHeroMedia?.let { media ->
                launchMediaPlayback(media)
            }
        }

        btnHeroTrailer.setOnClickListener {
            currentHeroMedia?.let { media ->
                previewTrailer(media)
            }
        }

        btnHeroWatchlist.setOnClickListener {
            currentHeroMedia?.let { media ->
                toggleWatchlist(media)
            }
        }
    }

    private fun displayHeroMedia(item: MediaItem) {
        currentHeroMedia = item

        tvHeroTitle.text = item.title
        tvHeroSynopsis.text = item.synopsis
        tvHeroBadgeNetwork.text = item.categoryBadge
        tvHeroBadgeTech.text = item.technicalBadges
        tvHeroRating.text = item.rating

        // Update Watchlist button state
        val isSaved = isMediaInWatchlist(item.id)
        btnHeroWatchlist.text = if (isSaved) "✓ In Watchlist" else "+ Watchlist"

        // Perform smooth backdrop crossfade
        crossfadeBackdrop(item.dominantColor)
    }

    private fun cycleNextFeaturedHero() {
        if (featuredMediaItems.isEmpty()) return
        val currentIndex = featuredMediaItems.indexOfFirst { it.id == currentHeroMedia?.id }
        val nextIndex = (currentIndex + 1) % featuredMediaItems.size
        displayHeroMedia(featuredMediaItems[nextIndex])
    }

    private fun crossfadeBackdrop(targetColor: Int) {
        val colorAnim = ValueAnimator.ofObject(ArgbEvaluator(), currentBackdropColor, targetColor)
        colorAnim.duration = BACKDROP_CROSSFADE_DURATION_MS
        colorAnim.interpolator = AccelerateDecelerateInterpolator()
        colorAnim.addUpdateListener { animator ->
            val color = animator.animatedValue as Int
            currentBackdropColor = color

            // Create smooth ambient gradient
            val gradientDrawable = GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                intArrayOf(color, Color.parseColor("#05070A"))
            )
            ivBackdrop.background = gradientDrawable
        }
        colorAnim.start()
    }

    private fun launchMediaPlayback(media: MediaItem) {
        recordUserInteraction()
        Toast.makeText(this, "Starting 4K Stream: ${media.title}", Toast.LENGTH_SHORT).show()

        // If media has an assigned package (e.g. Netflix / Hotstar / Prime), launch target intent
        if (media.targetPackage != null) {
            val intent = packageManager.getLeanbackLaunchIntentForPackage(media.targetPackage)
                ?: packageManager.getLaunchIntentForPackage(media.targetPackage)

            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
                return
            }
        }

        // Fallback: Open system media player action
        try {
            val streamIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(Uri.parse(media.streamUri ?: "content://sambhav/stream/${media.id}"), "video/*")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(streamIntent)
        } catch (e: Exception) {
            Log.w(TAG, "No video player available", e)
        }
    }

    private fun previewTrailer(media: MediaItem) {
        recordUserInteraction()
        Toast.makeText(this, "Playing Cinematic Preview: ${media.title}", Toast.LENGTH_SHORT).show()
    }

    private fun toggleWatchlist(media: MediaItem) {
        val currentSet = sharedPreferences.getStringSet(KEY_FAVORITE_MEDIA, emptySet())?.toMutableSet()
            ?: mutableSetOf()

        if (currentSet.contains(media.id)) {
            currentSet.remove(media.id)
            btnHeroWatchlist.text = "+ Watchlist"
            Toast.makeText(this, "Removed from Watchlist", Toast.LENGTH_SHORT).show()
        } else {
            currentSet.add(media.id)
            btnHeroWatchlist.text = "✓ In Watchlist"
            Toast.makeText(this, "Added to Watchlist", Toast.LENGTH_SHORT).show()
        }

        sharedPreferences.edit().putStringSet(KEY_FAVORITE_MEDIA, currentSet).apply()
    }

    private fun isMediaInWatchlist(id: String): Boolean {
        val currentSet = sharedPreferences.getStringSet(KEY_FAVORITE_MEDIA, emptySet()) ?: emptySet()
        return currentSet.contains(id)
    }

    // =========================================================================
    // Carousels & Adapters Setup
    // =========================================================================

    private fun setupCarousels() {
        // 1. Recent Apps Carousel
        recentAppsAdapter = AppTileAdapter(
            apps = recentApps,
            onAppClick = { app -> launchTelevisionApp(app) },
            onAppLongClick = { app -> showAppContextMenu(app) }
        )
        setupHorizontalTvRecyclerView(rvRecentApps, recentAppsAdapter)

        // 2. Featured Cinematic Carousel
        featuredCinematicAdapter = MediaCardAdapter(
            items = featuredMediaItems,
            onCardClick = { media -> launchMediaPlayback(media) },
            onCardFocused = { media ->
                recordUserInteraction()
                displayHeroMedia(media)
            }
        )
        setupHorizontalTvRecyclerView(rvFeaturedCinematic, featuredCinematicAdapter)

        // 3. Installed Apps Carousel
        installedAppsAdapter = AppTileAdapter(
            apps = allInstalledApps,
            onAppClick = { app -> launchTelevisionApp(app) },
            onAppLongClick = { app -> showAppContextMenu(app) }
        )
        setupHorizontalTvRecyclerView(rvInstalledApps, installedAppsAdapter)

        // 4. Sambhav Shows Carousel
        sambhavShowsAdapter = MediaCardAdapter(
            items = originalShowsItems,
            onCardClick = { media -> launchMediaPlayback(media) },
            onCardFocused = { media ->
                recordUserInteraction()
                displayHeroMedia(media)
            }
        )
        setupHorizontalTvRecyclerView(rvSambhavShows, sambhavShowsAdapter)

        // 5. Hardware Inputs Carousel
        hardwareInputsAdapter = HardwareInputAdapter(
            inputs = tvHardwareInputs,
            onInputClick = { input -> switchHardwareInput(input) }
        )
        setupHorizontalTvRecyclerView(rvHardwareInputs, hardwareInputsAdapter)
    }

    private fun setupHorizontalTvRecyclerView(recyclerView: RecyclerView, adapter: RecyclerView.Adapter<*>) {
        val layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        recyclerView.layoutManager = layoutManager
        recyclerView.adapter = adapter
        recyclerView.setHasFixedSize(true)
        recyclerView.setItemViewCacheSize(10)

        // Preserve focus position when re-entering row from above or below
        recyclerView.descendantFocusability = ViewGroup.FOCUS_AFTER_DESCENDANTS
        recyclerView.isFocusable = false
        recyclerView.isFocusableInTouchMode = false
    }

    private fun setupAmbientLighting() {
        // Soft pulsing ambient glow
        val anim = ValueAnimator.ofFloat(0.12f, 0.22f)
        anim.duration = 4000L
        anim.repeatCount = ValueAnimator.INFINITE
        anim.repeatMode = ValueAnimator.REVERSE
        anim.interpolator = DecelerateInterpolator()
        anim.addUpdateListener { animator ->
            viewAmbientGlow.alpha = animator.animatedValue as Float
        }
        anim.start()
    }

    // =========================================================================
    // Installed Application Discovery & Launching
    // =========================================================================

    private fun refreshInstalledApplications() {
        appDiscoveryJob?.cancel()
        appDiscoveryJob = activityScope.launch {
            val apps = appDiscoveryManager.discoverInstalledApps()
            withContext(Dispatchers.Main) {
                allInstalledApps.clear()
                allInstalledApps.addAll(apps)
                installedAppsAdapter.updateApps(allInstalledApps)
                updateRecentAppsRow()
                Log.d(TAG, "Discovered ${apps.size} installed apps for TV")
            }
        }
    }

    private fun updateRecentAppsRow() {
        val recentPkgNames = appDiscoveryManager.getRecentPackageNames()
        val mappedRecents = ArrayList<AppItem>()

        for (pkg in recentPkgNames) {
            val match = allInstalledApps.find { it.packageName == pkg }
            if (match != null) {
                mappedRecents.add(match)
            }
        }

        // If recents list is sparse, seed with popular installed apps
        if (mappedRecents.isEmpty() && allInstalledApps.isNotEmpty()) {
            mappedRecents.addAll(allInstalledApps.take(6))
        }

        recentApps.clear()
        recentApps.addAll(mappedRecents)
        recentAppsAdapter.updateApps(recentApps)
    }

    private fun launchTelevisionApp(app: AppItem) {
        recordUserInteraction()
        val success = appDiscoveryManager.launchApplication(app)
        if (success) {
            updateRecentAppsRow()
        }
    }

    private fun showAppContextMenu(app: AppItem) {
        recordUserInteraction()
        val options = arrayOf(
            "Launch Application",
            "Application Settings & Permissions",
            "View in Google Play / Sambhav Store",
            "Uninstall Application"
        )

        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle(app.label)
            .setItems(options) { dialog, which ->
                when (which) {
                    0 -> launchTelevisionApp(app)
                    1 -> openAppSettings(app.packageName)
                    2 -> openStorePage(app.packageName)
                    3 -> openAppUninstall(app.packageName)
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun openAppSettings(packageName: String) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", packageName, null)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Cannot open app settings", e)
        }
    }

    private fun openStorePage(packageName: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Cannot open store", e)
        }
    }

    private fun openAppUninstall(packageName: String) {
        try {
            val intent = Intent(Intent.ACTION_UNINSTALL_PACKAGE).apply {
                data = Uri.fromParts("package", packageName, null)
                putExtra(Intent.EXTRA_RETURN_RESULT, true)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Cannot request uninstall", e)
        }
    }

    // =========================================================================
    // TCL Hardware Inputs Management
    // =========================================================================

    private fun refreshTvHardwareInputs() {
        activityScope.launch(Dispatchers.IO) {
            val inputs = tvInputManagerHelper.queryTvInputs()
            withContext(Dispatchers.Main) {
                tvHardwareInputs.clear()
                tvHardwareInputs.addAll(inputs)
                hardwareInputsAdapter.notifyDataSetChanged()
            }
        }
    }

    private fun switchHardwareInput(input: TvHardwareInput) {
        recordUserInteraction()
        Toast.makeText(this, "Switching Source: ${input.title}", Toast.LENGTH_SHORT).show()
        tvInputManagerHelper.switchTvInput(input)
    }

    // =========================================================================
    // Glass Settings & System Configuration Dialog
    // =========================================================================

    private fun openGlassSettingsDialog() {
        recordUserInteraction()

        val settingsItems = arrayOf(
            "TCL Display & Dolby Vision Profiles",
            "Audio Output & eARC Passthrough",
            "HDMI & External Devices",
            "Network & Wi-Fi Settings",
            "System Information (TCL Android 9 / API 28)",
            "Launcher Customization"
        )

        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("Sambhav TV OS - TCL System Preferences")
            .setItems(settingsItems) { dialog, which ->
                when (which) {
                    0 -> showPictureModeDialog()
                    1 -> showAudioOutputDialog()
                    2 -> refreshTvHardwareInputs()
                    3 -> openNetworkSettings()
                    4 -> showSystemInfoDialog()
                    5 -> Toast.makeText(this, "Glass theme active (Apple tvOS style)", Toast.LENGTH_SHORT).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Close") { dialog, _ ->
                dialog.dismiss()
                tabSettings.requestFocus()
            }
            .show()
    }

    private fun showPictureModeDialog() {
        val modes = arrayOf(
            "Dolby Vision Cinema (Recommended)",
            "Dolby Vision Bright",
            "Filmmaker Mode (Accurate Colors)",
            "Low-Latency Game Mode (120Hz MEMC)",
            "Standard Energy Saver"
        )
        val currentMode = sharedPreferences.getInt(KEY_PICTURE_MODE, 0)

        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("TCL 4K Picture Profiles")
            .setSingleChoiceItems(modes, currentMode) { dialog, which ->
                sharedPreferences.edit().putInt(KEY_PICTURE_MODE, which).apply()
                Toast.makeText(this, "Applied: ${modes[which]}", Toast.LENGTH_SHORT).show()
                dialog.dismiss()
            }
            .setNegativeButton("Back", null)
            .show()
    }

    private fun showAudioOutputDialog() {
        val outputs = arrayOf(
            "TV Internal Speakers",
            "HDMI eARC Soundbar (Dolby Atmos)",
            "Optical Audio (SPDIF)",
            "Bluetooth Wireless Headphones"
        )
        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("TCL Digital Audio Architecture")
            .setItems(outputs) { dialog, which ->
                Toast.makeText(this, "Active Audio: ${outputs[which]}", Toast.LENGTH_SHORT).show()
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun openNetworkSettings() {
        try {
            val intent = Intent(Settings.ACTION_WIFI_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Opening network settings...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showSystemInfoDialog() {
        val message = """
            Platform: TCL Smart Television
            OS Version: Sambhav TV OS 1.0 (Cinematic Glass)
            Android Release: 9 (Pie)
            API Level: 28 (Leankback Launcher)
            Kernel: Linux 4.14.76
            Display Resolution: 3840 x 2160 (4K UHD)
            Hardware Acceleration: OpenGL ES 3.2 Enabled
            Video Codecs: HEVC, VP9, AV1, Dolby Vision Profile 5/8
        """.trimIndent()

        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("TCL Hardware & Architecture")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }

    // =========================================================================
    // D-Pad Remote Control & Key Event Handling
    // =========================================================================

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        recordUserInteraction()

        when (keyCode) {
            KeyEvent.KEYCODE_BACK -> {
                // TV Launcher back press policy: Return focus to top navigation bar
                if (!tabHome.hasFocus() && !tabMovies.hasFocus() && !tabShows.hasFocus() && !tabApps.hasFocus() && !tabSettings.hasFocus()) {
                    mainScrollView.smoothScrollTo(0, 0)
                    when (activeTab) {
                        LauncherTab.HOME -> tabHome.requestFocus()
                        LauncherTab.MOVIES -> tabMovies.requestFocus()
                        LauncherTab.SHOWS -> tabShows.requestFocus()
                        LauncherTab.APPS -> tabApps.requestFocus()
                        LauncherTab.SETTINGS -> tabSettings.requestFocus()
                    }
                    return true
                }
                // Do not close launcher on back button at top
                return true
            }

            KeyEvent.KEYCODE_MENU -> {
                // TV Remote Menu key: Quick Access Panel
                openGlassSettingsDialog()
                return true
            }

            KeyEvent.KEYCODE_TV_INPUT -> {
                // TV Source button: Cycle inputs
                refreshTvHardwareInputs()
                Toast.makeText(this, "TCL TV Input Switcher Active", Toast.LENGTH_SHORT).show()
                return true
            }

            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
            KeyEvent.KEYCODE_MEDIA_PLAY -> {
                currentHeroMedia?.let {
                    launchMediaPlayback(it)
                    return true
                }
            }

            KeyEvent.KEYCODE_SEARCH -> {
                Toast.makeText(this, "Voice Search Active", Toast.LENGTH_SHORT).show()
                return true
            }
        }

        return super.onKeyDown(keyCode, event)
    }

    private fun recordUserInteraction() {
        lastUserInteractionTime = SystemClock.uptimeMillis()
        lastFocusedView = currentFocus
    }

    // =========================================================================
    // Media Catalog Initialization (High-Fidelity Curated Content)
    // =========================================================================

    private fun initializeMediaCatalog() {
        // Featured 4K Cinematic Releases
        featuredMediaItems.clear()
        featuredMediaItems.add(
            MediaItem(
                id = "feat_interstellar",
                title = "CHRONICLES OF DEEP SPACE",
                subtitle = "Sci-Fi • 2h 45m • 2024",
                synopsis = "A team of celestial voyagers journeys through an enigmatic gateway on the fringe of known reality to seek an enduring sanctuary for humankind.",
                categoryBadge = "SAMBHAV CINEMA EXCLUSIVE",
                technicalBadges = "4K HDR10+ • DOLBY VISION • DOLBY ATMOS",
                rating = "IMDb 9.2",
                durationOrEpisodes = "165 min",
                releaseYear = 2024,
                backdropUrl = "",
                posterUrl = "",
                dominantColor = Color.parseColor("#0C1A30")
            )
        )
        featuredMediaItems.add(
            MediaItem(
                id = "feat_solaris",
                title = "THE SHADOW CITADEL",
                subtitle = "Action / Thriller • 2h 18m • 2024",
                synopsis = "Behind impenetrable basalt walls and biometric security, an elite syndicate uncovers an ancient cipher capable of rewriting global communication networks.",
                categoryBadge = "TRENDING BLOCKBUSTER",
                technicalBadges = "4K ULTRA HD • IMAX ENHANCED • 7.1 DTS-X",
                rating = "IMDb 8.9",
                durationOrEpisodes = "138 min",
                releaseYear = 2024,
                backdropUrl = "",
                posterUrl = "",
                dominantColor = Color.parseColor("#2B121A")
            )
        )
        featuredMediaItems.add(
            MediaItem(
                id = "feat_aurora",
                title = "AURORA BOREALIS",
                subtitle = "Nature Documentary • 1h 52m • 2024",
                synopsis = "Witness the magnificent arctic dance of polar magnetic storms filmed over four seasons with revolutionary ultra-low-light cinema sensors in 8K downsampled.",
                categoryBadge = "SAMBHAV EARTH",
                technicalBadges = "DOLBY VISION IQ • DOLBY ATMOS 3D AUDIO",
                rating = "IMDb 9.4",
                durationOrEpisodes = "112 min",
                releaseYear = 2024,
                backdropUrl = "",
                posterUrl = "",
                dominantColor = Color.parseColor("#08231C")
            )
        )
        featuredMediaItems.add(
            MediaItem(
                id = "feat_mirage",
                title = "ECHOES OF THE VALKYRIE",
                subtitle = "Historical Drama • 2h 30m • 2024",
                synopsis = "In the frozen fjords of 9th-century Scandinavia, twin sisters navigate dynastic power struggles and oceanic voyages into mythical western continents.",
                categoryBadge = "CRITICS CHOICE",
                technicalBadges = "4K HDR • MASTERED IN 24FPS",
                rating = "IMDb 8.7",
                durationOrEpisodes = "150 min",
                releaseYear = 2024,
                backdropUrl = "",
                posterUrl = "",
                dominantColor = Color.parseColor("#2A1E0D")
            )
        )

        // Sambhav Originals & Episodic Shows
        originalShowsItems.clear()
        originalShowsItems.add(
            MediaItem(
                id = "show_quantum",
                title = "QUANTUM HORIZON",
                subtitle = "Season 2 • 8 Episodes • 2024",
                synopsis = "In 2088, the first sub-atomic entanglement network triggers unexpected parallel timeline collapses across three major megacities.",
                categoryBadge = "SAMBHAV ORIGINAL SERIES",
                technicalBadges = "4K DOLBY VISION • 5.1 SURROUND",
                rating = "IMDb 9.0",
                durationOrEpisodes = "8 Episodes",
                releaseYear = 2024,
                backdropUrl = "",
                posterUrl = "",
                dominantColor = Color.parseColor("#151828")
            )
        )
        originalShowsItems.add(
            MediaItem(
                id = "show_valkyrie",
                title = "NEON MONARCHY",
                subtitle = "Season 1 • 10 Episodes • 2024",
                synopsis = "Under the rain-slicked skies of Neo-Tokyo, a high-stakes detective uncovers the disappearance of the city's lead synthetic intelligence architect.",
                categoryBadge = "NEW EPISODES WEEKLY",
                technicalBadges = "4K ULTRA HD • DOLBY ATMOS",
                rating = "IMDb 8.8",
                durationOrEpisodes = "10 Episodes",
                releaseYear = 2024,
                backdropUrl = "",
                posterUrl = "",
                dominantColor = Color.parseColor("#260E2A")
            )
        )
        originalShowsItems.add(
            MediaItem(
                id = "show_safari",
                title = "SERENGETI EXPEDITIONS",
                subtitle = "Documentary Series • 6 Episodes",
                synopsis = "An intimate, unprecedented look at the great wildebeest migration captured with high-speed remote drones and thermal optics.",
                categoryBadge = "PREMIUM NATURE",
                technicalBadges = "4K HDR10 • DOLBY SURROUND",
                rating = "IMDb 9.3",
                durationOrEpisodes = "6 Episodes",
                releaseYear = 2024,
                backdropUrl = "",
                posterUrl = "",
                dominantColor = Color.parseColor("#1F1C10")
            )
        )
    }

    // =========================================================================
    // Inner Adapter: TV Hardware Inputs (HDMI / eARC / AV)
    // =========================================================================

    private class HardwareInputAdapter(
        private val inputs: List<TvHardwareInput>,
        private val onInputClick: (TvHardwareInput) -> Unit
    ) : RecyclerView.Adapter<HardwareInputAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val root: View = view.findViewById(R.id.settings_tile_root)
            val title: TextView = view.findViewById(R.id.tv_setting_title)
            val status: TextView = view.findViewById(R.id.tv_setting_status)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_settings_tile, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = inputs[position]
            holder.title.text = item.title
            holder.status.text = item.subtitle

            FocusElevationHelper.attachFocusAnimation(
                view = holder.root,
                focusedScale = 1.08f,
                elevateZ = true
            )

            holder.root.setOnClickListener {
                onInputClick(item)
            }
        }

        override fun getItemCount(): Int = inputs.size
    }
}
