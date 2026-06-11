package com.example.steampulse.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

object GeminiApiManager {
    private val client = OkHttpClient()

    suspend fun getSoundtrackRecommendations(gameName: String, apiKey: String): List<String> {
        return withContext(Dispatchers.IO) {
            val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=$apiKey"
            val prompt = "Recommend 3 soundtracks or music genres perfect for listening to while playing the game '$gameName'. Respond in a strict JSON array of strings containing just the album/genre names. No markdown formatting, just the raw array."
            
            val jsonBody = JSONObject().apply {
                put("contents", JSONArray().apply {
                    put(JSONObject().apply {
                        put("parts", JSONArray().apply {
                            put(JSONObject().apply {
                                put("text", prompt)
                            })
                        })
                    })
                })
            }

            val request = Request.Builder()
                .url(endpoint)
                .post(jsonBody.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val recommendations = mutableListOf<String>()
            try {
                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        println("Failed to fetch from Gemini: ${response.code}")
                        return@use
                    }
                    val bodyString = response.body?.string() ?: return@use
                    val responseObject = JSONObject(bodyString)
                    val candidates = responseObject.optJSONArray("candidates")
                    if (candidates != null && candidates.length() > 0) {
                        val text = candidates.getJSONObject(0)
                            .optJSONObject("content")
                            ?.optJSONArray("parts")
                            ?.getJSONObject(0)
                            ?.optString("text") ?: ""

                        if (text.isNotBlank()) {
                            // Try to parse as JSON array
                            try {
                                val cleanText = text.trim().removePrefix("```json").removeSuffix("```").trim()
                                val array = JSONArray(cleanText)
                                for (i in 0 until array.length()) {
                                    recommendations.add(array.getString(i))
                                }
                            } catch (e: Exception) {
                                // Fallback: just return the raw text if parsing fails
                                recommendations.add(text.trim())
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            recommendations
        }
    }
}
