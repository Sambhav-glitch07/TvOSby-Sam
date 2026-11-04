package tv.sambhav.os.launcher.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import tv.sambhav.os.launcher.R
import tv.sambhav.os.launcher.model.AppItem
import tv.sambhav.os.launcher.view.FocusElevationHelper

class AppTileAdapter(
    private var apps: List<AppItem>,
    private val onAppClick: (AppItem) -> Unit,
    private val onAppLongClick: ((AppItem) -> Unit)? = null,
    private val onAppFocused: ((AppItem) -> Unit)? = null
) : RecyclerView.Adapter<AppTileAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val root: View = view.findViewById(R.id.app_tile_root)
        val icon: ImageView = view.findViewById(R.id.iv_app_icon)
        val label: TextView = view.findViewById(R.id.tv_app_label)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_app_tile, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val app = apps[position]
        holder.label.text = app.label
        if (app.icon != null) {
            holder.icon.setImageDrawable(app.icon)
        } else {
            holder.icon.setImageResource(R.drawable.ic_sambhav_logo)
        }

        FocusElevationHelper.attachFocusAnimation(
            view = holder.root,
            focusedScale = 1.10f,
            elevateZ = true
        ) { hasFocus ->
            if (hasFocus) {
                onAppFocused?.invoke(app)
            }
        }

        holder.root.setOnClickListener {
            onAppClick(app)
        }

        holder.root.setOnLongClickListener {
            onAppLongClick?.invoke(app)
            true
        }
    }

    override fun getItemCount(): Int = apps.size

    fun updateApps(newApps: List<AppItem>) {
        this.apps = newApps
        notifyDataSetChanged()
    }
}
