package com.example.steampulse.data

import com.example.steampulse.model.Achievements
import com.example.steampulse.model.Game
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.time.Instant

object SteamApiManager {
    private val client = OkHttpClient()

    suspend fun fetchAndSaveRecentlyPlayedGames(steamId: String, apiKey: String): List<Game> {
        return withContext(Dispatchers.IO) {
            val fetchedGames = mutableListOf<Game>()
            try {
                val url = "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=$apiKey&steamid=$steamId&format=json"
                val request = Request.Builder().url(url).build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        println("Failed to fetch steam games: ${response.code}")
                        return@use
                    }
                    val responseBody = response.body?.string() ?: return@use

                    val jsonObject = JSONObject(responseBody)
                    val responseObj = jsonObject.optJSONObject("response") ?: return@use
                    val gamesArray = responseObj.optJSONArray("games") ?: return@use

                    for (i in 0 until gamesArray.length()) {
                        val gameObj = gamesArray.getJSONObject(i)
                        val appId = gameObj.getInt("appid").toString()
                        val name = gameObj.getString("name")
                        
                        // Steam provides playtime in minutes, converting to hours
                        val playtimeForeverMinutes = gameObj.optInt("playtime_forever", 0)
                        val playtimeHours = playtimeForeverMinutes / 60
                        
                        // Header images usually exist for most apps, and look better as banners
                        val imageUrl = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$appId/header.jpg"

                        val game = Game(
                            id = appId,
                            name = name,
                            playtime = playtimeHours,
                            lastPlayed = Instant.now().toString(), 
                            image = imageUrl,
                            achievements = Achievements(0, 0), // Not provided in this endpoint
                            description = "Imported from Steam"
                        )
                        
                        // Save directly to Firestore via FirestoreManager
                        FirestoreManager.saveGamePlaytime(game)
                        fetchedGames.add(game)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            fetchedGames
        }
    }
}
