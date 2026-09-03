package com.example.steampulse.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.steampulse.data.FirestoreManager

@Composable
fun PlaytimeChart(modifier: Modifier = Modifier) {
    var data by remember { mutableStateOf<List<Float>>(emptyList()) }

    LaunchedEffect(Unit) {
        data = FirestoreManager.getWeeklyPlaytimeTrends()
    }

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "WEEKLY PLAYTIME TRENDS",
            color = MaterialTheme.colorScheme.primary,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)
        )
        
        if (data.isNotEmpty()) {
            val chartColor = MaterialTheme.colorScheme.primary
            
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .padding(horizontal = 20.dp, vertical = 10.dp)
            ) {
                val maxData = data.maxOrNull() ?: 1f
                val minData = 0f
                val range = maxData - minData
                
                val width = size.width
                val height = size.height
                val stepX = width / (data.size - 1).coerceAtLeast(1)
                
                val path = Path()
                
                data.forEachIndexed { index, value ->
                    val x = index * stepX
                    val normalizedY = 1 - ((value - minData) / range)
                    val y = normalizedY * height
                    
                    if (index == 0) {
                        path.moveTo(x, y)
                    } else {
                        // Create a smooth curve
                        val previousX = (index - 1) * stepX
                        val previousNormalizedY = 1 - ((data[index - 1] - minData) / range)
                        val previousY = previousNormalizedY * height
                        
                        val controlX1 = previousX + stepX / 2
                        val controlY1 = previousY
                        val controlX2 = previousX + stepX / 2
                        val controlY2 = y
                        
                        path.cubicTo(
                            controlX1, controlY1,
                            controlX2, controlY2,
                            x, y
                        )
                    }
                }
                
                drawPath(
                    path = path,
                    color = chartColor,
                    style = Stroke(
                        width = 4.dp.toPx(),
                        cap = StrokeCap.Round
                    )
                )
                
                // Draw points
                data.forEachIndexed { index, value ->
                    val x = index * stepX
                    val normalizedY = 1 - ((value - minData) / range)
                    val y = normalizedY * height
                    
                    drawCircle(
                        color = Color.White,
                        radius = 4.dp.toPx(),
                        center = Offset(x, y)
                    )
                    drawCircle(
                        color = chartColor,
                        radius = 2.dp.toPx(),
                        center = Offset(x, y)
                    )
                }
            }
        }
    }
}
