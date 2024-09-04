package com.lucrasdk

import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner

/**
 * This is to avoid lack of view model store owner on unmount or remount
 * TODO need to emulate the issue before releasing this.
 */
object LucraViewModelStoreOwner : ViewModelStoreOwner {
    override val viewModelStore = ViewModelStore()
}