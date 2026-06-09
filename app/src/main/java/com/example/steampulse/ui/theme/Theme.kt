package com.example.steampulse.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BgColor = Color(0xFF0F172A)
val CardBgColor = Color(0xFF1E293B)
val AccentColor = Color(0xFF6366F1)
val AccentGreen = Color(0xFF10B981)
val TextMain = Color(0xFFF8FAFC)
val TextDim = Color(0xFF94A3B8)

private val DarkColorScheme = darkColorScheme(
    background = BgColor,
    surface = CardBgColor,
    primary = AccentColor,
    secondary = AccentGreen,
    onBackground = TextMain,
    onSurface = TextMain,
    onSurfaceVariant = TextDim,
)

@Composable
fun SteamPulseTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
