package com.example.steampulse.data

import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.example.steampulse.model.Game
import kotlinx.coroutines.tasks.await

object FirestoreManager {
    val db: FirebaseFirestore by lazy {
        val app = FirebaseApp.getInstance()
        FirebaseFirestore.getInstance(app, "ai-studio-7855f6aa-74b3-4483-a8e5-3f9fd34e9a86")
    }
    
    val auth: FirebaseAuth by lazy {
        val app = FirebaseApp.getInstance()
        FirebaseAuth.getInstance(app)
    }

    suspend fun initializeAuth() {
        if (auth.currentUser == null) {
            auth.signInAnonymously().await()
        }
    }

    suspend fun saveGamePlaytime(game: Game) {
        val uid = auth.currentUser?.uid ?: return
        val data = hashMapOf(
            "uid" to uid,
            "gameId" to game.id,
            "gameName" to game.name,
            "playtimeTotal" to game.playtime,
            "lastPlayed" to game.lastPlayed
        )
        try {
            db.collection("users").document(uid).collection("games").document(game.id).set(data).await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun getGamePlaytime(gameId: String): Int? {
        val uid = auth.currentUser?.uid ?: return null
        return try {
            val snapshot = db.collection("users").document(uid).collection("games").document(gameId).get().await()
            snapshot.getLong("playtimeTotal")?.toInt()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun saveSoundtrackRecommendation(gameId: String, soundtrack: String) {
        val uid = auth.currentUser?.uid ?: return
        val data = hashMapOf(
            "userId" to uid,
            "title" to soundtrack,
            "gameId" to gameId,
            "createdAt" to System.currentTimeMillis().toString()
        )
        try {
            db.collection("games").document(gameId).collection("soundtracks").add(data).await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun getSoundtrackRecommendations(gameId: String): List<String> {
        return try {
            val snapshot = db.collection("games").document(gameId).collection("soundtracks").get().await()
            snapshot.documents.mapNotNull { it.getString("title") }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }
}
