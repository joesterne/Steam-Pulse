package com.example.steampulse.model

data class Game(
    val id: String,
    val name: String,
    val playtime: Int,
    val lastPlayed: String,
    val image: String,
    val achievements: Achievements,
    val description: String
)

data class Achievements(
    val earned: Int,
    val total: Int
)

val MOCK_GAMES = listOf(
    Game(
        id = "570",
        name = "Dota 2",
        playtime = 2450,
        lastPlayed = "2024-04-14T20:00:00Z",
        image = "https://picsum.photos/seed/dota2/400/225",
        achievements = Achievements(12, 12),
        description = "A modern multiplayer masterpiece of strategy and skill."
    ),
    Game(
        id = "730",
        name = "Counter-Strike 2",
        playtime = 1200,
        lastPlayed = "2024-04-15T10:00:00Z",
        image = "https://picsum.photos/seed/cs2/400/225",
        achievements = Achievements(1, 1),
        description = "The next era of Counter-Strike is here."
    ),
    Game(
        id = "1091500",
        name = "Cyberpunk 2077",
        playtime = 150,
        lastPlayed = "2024-04-10T15:30:00Z",
        image = "https://picsum.photos/seed/cyberpunk/400/225",
        achievements = Achievements(44, 57),
        description = "An open-world, action-adventure story set in Night City."
    ),
    Game(
        id = "1245620",
        name = "Elden Ring",
        playtime = 320,
        lastPlayed = "2024-04-12T22:15:00Z",
        image = "https://picsum.photos/seed/eldenring/400/225",
        achievements = Achievements(32, 42),
        description = "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring."
    )
)
