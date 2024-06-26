package com.lucrasdk

import android.content.Context
import android.util.AttributeSet
import android.view.ViewGroup
import android.widget.FrameLayout
import android.graphics.Color
import android.view.View

class LucraMiniPublicFeed : FrameLayout {
  constructor(context: Context) : super(context) {
    init()
  }
  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
    init()
  }
  constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  ) {
    init()
  }

  private fun init() {
    // Ensure the FrameLayout matches the parent size
    layoutParams = LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.MATCH_PARENT
    )
  }

  override fun onViewAdded(child: View?) {
    super.onViewAdded(child)
    // Force the FrameLayout to remeasure and wrap its contents
    requestLayout()
    invalidate()
  }
}
