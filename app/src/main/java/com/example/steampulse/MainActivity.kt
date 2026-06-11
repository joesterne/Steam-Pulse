package com.example.steampulse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Gamepad
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.example.steampulse.model.Game
import com.example.steampulse.model.MOCK_GAMES
import com.example.steampulse.ui.theme.SteamPulseTheme
import com.example.steampulse.ui.theme.TextDim

import kotlinx.coroutines.launch
import com.example.steampulse.data.FirestoreManager
import com.example.steampulse.data.GeminiApiManager
import com.example.steampulse.data.SteamApiManager

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SteamPulseTheme {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = MaterialTheme.colorScheme.background
                ) { innerPadding ->
                    DashboardScreen(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(modifier: Modifier = Modifier) {
    var selectedGame by remember { mutableStateOf<Game?>(MOCK_GAMES.first()) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            FirestoreManager.initializeAuth()
            MOCK_GAMES.forEach {
                FirestoreManager.saveGamePlaytime(it)
            }
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            DashboardHeader(onImportSteam = {
                scope.launch {
                    val steamId = "76561197960434622" // Replace with real Steam ID
                    val apiKey = "YOUR_STEAM_API_KEY" // Replace with real API Key
                    
                    val importedGames = SteamApiManager.fetchAndSaveRecentlyPlayedGames(steamId, apiKey)
                    if (importedGames.isNotEmpty()) {
                        selectedGame = importedGames.first()
                    }
                }
            })
        }
        item {
            ActiveMissionCard(game = selectedGame)
        }
        item {
            RecentActivityList(
                games = MOCK_GAMES,
                selectedGame = selectedGame,
                onGameSelected = { selectedGame = it }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardHeader(
    onImportSteam: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        AsyncImage(
            model = "https://ui-avatars.com/api/?name=User&background=random",
            contentDescription = "Profile",
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(12.dp))
        )
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search Steam games...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(24.dp),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                focusedBorderColor = MaterialTheme.colorScheme.primary
            ),
            singleLine = true
        )
        Button(
            onClick = onImportSteam,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.height(56.dp)
        ) {
            Text("Import Steam Data", fontSize = 12.sp)
        }
    }
}

@Composable
fun ActiveMissionCard(game: Game?) {
    val scope = rememberCoroutineScope()
    var savedSoundtrack by remember { mutableStateOf<String?>(null) }
    var recommendations by remember(game) { mutableStateOf<List<String>>(emptyList()) }

    LaunchedEffect(game) {
        if (game != null) {
            recommendations = FirestoreManager.getSoundtrackRecommendations(game.id)
        }
    }

    Card(
        modifier = Modifier.fillMaxWidth().height(300.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            if (game != null) {
                AsyncImage(
                    model = game.image,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                    alpha = 0.3f
                )
            }
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                Text(
                    text = "ACTIVE MISSION",
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                if (game != null) {
                    Text(
                        text = game.name,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = game.description,
                        color = TextDim,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    if (recommendations.isNotEmpty()) {
                        Text("SAVED SOUNDTRACKS: ${recommendations.joinToString()}", color = MaterialTheme.colorScheme.secondary, fontSize = 10.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("ACHIEVEMENTS", color = TextDim, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text("${game.achievements.earned} / ${game.achievements.total}", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                        Column {
                            val completion = if(game.achievements.total > 0) 
                                (game.achievements.earned.toFloat() / game.achievements.total * 100).toInt() else 0
                            Text("COMPLETION", color = MaterialTheme.colorScheme.secondary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text("$completion%", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = {
                                scope.launch {
                                    val apiKey = "YOUR_GEMINI_API_KEY" // Needs to be replaced with the actual key
                                    val results = GeminiApiManager.getSoundtrackRecommendations(game.name, apiKey)
                                    if (results.isNotEmpty()) {
                                        FirestoreManager.saveSoundtrackRecommendation(game.id, results.joinToString(", "))
                                        recommendations = FirestoreManager.getSoundtrackRecommendations(game.id)
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Get AI Soundtracks", fontSize = 10.sp)
                        }
                    }
                } else {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Gamepad, contentDescription = null, modifier = Modifier.size(48.dp), tint = TextDim)
                            Text("Select a game to view progress", color = TextDim)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RecentActivityList(
    games: List<Game>,
    selectedGame: Game?,
    onGameSelected: (Game) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "RECENT ACTIVITY",
                color = MaterialTheme.colorScheme.primary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(16.dp))
            games.forEach { game ->
                val isSelected = game == selectedGame
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) Color.White.copy(alpha = 0.1f) else Color.Transparent)
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = game.image,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(60.dp, 34.dp)
                            .clip(RoundedCornerShape(4.dp))
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(game.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("${game.playtime} Hours", color = TextDim, fontSize = 12.sp)
                    }
                    Button(
                        onClick = { onGameSelected(game) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.1f)
                        ),
                        shape = RoundedCornerShape(50)
                    ) {
                        Text(if (isSelected) "Active" else "Select", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
