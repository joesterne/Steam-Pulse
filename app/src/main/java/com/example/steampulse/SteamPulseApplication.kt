package com.example.steampulse

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class SteamPulseApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        val options = FirebaseOptions.Builder()
            .setProjectId("gen-lang-client-0620319277")
            .setApplicationId("1:310224715958:web:361d1ef06c5ec18f06a617")
            .setApiKey("AIzaSyAzI7F7l8mLyOO-REasHK1ovOxaRo_w_pI")
            .setDatabaseUrl("https://gen-lang-client-0620319277.firebaseio.com")
            .setStorageBucket("gen-lang-client-0620319277.firebasestorage.app")
            .build()
            
        FirebaseApp.initializeApp(this, options)
    }
}
