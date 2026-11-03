package tv.sambhav.os.launcher.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import tv.sambhav.os.launcher.R
import tv.sambhav.os.launcher.model.MediaItem
import tv.sambhav.os.launcher.view.FocusElevationHelper

class MediaCardAdapter(
    private val items: List<MediaItem>,
    private val onCardClick: (MediaItem) -> Unit,
    private val onCardFocused: (MediaItem) -> Unit
) : RecyclerView.Adapter<MediaCardAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val root: View = view.findViewById(R.id.card_media_root)
        val poster: ImageView = view.findViewById(R.id.iv_media_poster)
        val focusGlow: View = view.findViewById(R.id.view_focus_glow)
        val badge: TextView = view.findViewById(R.id.tv_media_badge)
        val title: TextView = view.findViewById(R.id.tv_media_title)
        val subtitle: TextView = view.findViewById(R.id.tv_media_subtitle)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_media_card, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.title.text = item.title
        holder.subtitle.text = item.subtitle
        holder.badge.text = item.categoryBadge

        // Setup TV focus animation and specular highlight
        FocusElevationHelper.attachFocusAnimation(
            view = holder.root,
            focusedScale = 1.08f,
            elevateZ = true
        ) { hasFocus ->
            holder.focusGlow.visibility = if (hasFocus) View.VISIBLE else View.GONE
            if (hasFocus) {
                onCardFocused(item)
            }
        }

        holder.root.setOnClickListener {
            onCardClick(item)
        }
    }

    override fun getItemCount(): Int = items.size
}
