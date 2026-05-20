# Audit Report — Card Text Wrapping & Content Overflow

**Screen Name:** `ExploreScreen & HomeScreen Cards`
**Timestamp:** `2026-05-20T20:18:30+03:00`
**Priority:** `MEDIUM`

## Visual Ground Truth
![audit_screenshot](./report-3.png)

## Issue Description
Sonuç kartlarındaki (`resultCard` ve keşfet sekmesindeki trend slop listesi) uzun analiz açıklamaları herhangi bir sarmalama/satır sınırı olmaksızın render ediliyor. Bu durum, uzun yapay zeka analizlerinde kartın ekranı aşağıya doğru aşırı derecede germesine veya tasarım sınırlarının dışına taşmasına yol açıyor.

## Suggested Fix
1. Ana sayfadaki `resultCard` analiz metnine `numberOfLines={3}` sınırı ekleyerek taşmaları engelleyin.
2. `explore.tsx` üzerindeki örnek trend açıklamalarına `numberOfLines={2}` sınırlaması getirerek kart yüksekliklerinin stabil kalmasını sağlayın.
