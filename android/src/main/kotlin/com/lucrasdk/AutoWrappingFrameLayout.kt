package com.lucrasdk


import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.widget.FrameLayout
import androidx.core.view.children
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerModule


/**
 * Android native views and RN components don't play well out of the box, we have to manually
 * update the size and call RN functions to update the size in real time. Android would do this
 * out of the box in native world, but not here!
 */
class AutoWrappingFrameLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private var viewAdded = false
    private var pendingChild: View? = null

    /**
     * use waitForAttach = true if the component is added via `createViewInstance`
     */
    fun addView(child: View?, waitForAttach: Boolean) {
        if (!waitForAttach) {
            super.addView(child)
            viewAdded = true
            pendingChild = null
        } else {
            viewAdded = false
            pendingChild = child
        }
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (!viewAdded && pendingChild != null) {
            post {
                addView(pendingChild, false)
            }
        }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        // wait until the fragment has been embedded into the view and the
        // children are ready to measure - else it will give a (0,0) size and
        // not layout correctly.
        //
        // Also in case fragment is not created, as a safe-guard, we should
        // skip the proper measuring of the view.
        if (children.count() == 0 || !viewAdded) {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
            return
        }

        var maxWidth = 0
        var maxHeight = 0

        children.forEach {
            it.measure(widthMeasureSpec, MeasureSpec.UNSPECIFIED)
            maxWidth = maxWidth.coerceAtLeast(it.measuredWidth)
            maxHeight = maxHeight.coerceAtLeast(it.measuredHeight)
        }

        val finalWidth = maxWidth.coerceAtLeast(suggestedMinimumWidth)
        val finalHeight = maxHeight.coerceAtLeast(suggestedMinimumHeight)
        setMeasuredDimension(finalWidth, finalHeight)
        (context as? ThemedReactContext)?.let { themedReactContext ->
            themedReactContext.runOnNativeModulesQueueThread {
                themedReactContext.getNativeModule(UIManagerModule::class.java)
                    ?.updateNodeSize(id, finalWidth, finalHeight)
            }
        }
    }
}