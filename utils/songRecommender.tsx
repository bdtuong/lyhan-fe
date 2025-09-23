import data from "@/data/response.json"

export interface SongInfo {
  id: number
  title: string
  artist: string
  album: string
  duration: string
  youtubeId: string
  mood: string[]
  keywords: string[]
  description: string
  meaning: string
  responses: string[]
}

interface DataSchema {
  overview: {
    intro: string[]
    hot: string
    best: string
    hotSongIds?: number[]
    bestSongIds?: number[]
  }
  songs: SongInfo[]
}

export type RecommendationResult = {
  message: string
  song?: SongInfo
  intent:
    | "overview"
    | "hot"
    | "best"
    | "random_today"
    | "emotion_match"
    | "fallback_positive"
}

const { overview, songs } = data as DataSchema

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function intentFrom(input: string) {
  const s = input.toLowerCase()
  if (/(giới thiệu|tổng quan|âm nhạc.*lyhan|lyhan là ai)/.test(s)) return "overview"
  if (/(bài.*hot|đang trend|nhiều người nghe|phổ biến|đang nổi)/.test(s)) return "hot"
  if (/(bài.*hay|hay nhất|tốt nhất|nên nghe nhất)/.test(s)) return "best"
  if (/(hôm nay.*nghe gì|hôm nay nghe|gợi ý.*bài|nghe bài gì)/.test(s)) return "random_today"
  return "emotion_match"
}

export function recommendSong(userInput: string): RecommendationResult {
  const input = (userInput || "").trim()
  const intent = intentFrom(input)

  // 1) INTENT: overview/hot/best/random today
  if (intent === "overview") {
    return {
      message: pickRandom(overview.intro),
      intent,
    }
  }

  if (intent === "hot") {
    const hotMsg = overview.hot
    const hotSong =
      (overview.hotSongIds &&
        songs.find((s) => overview.hotSongIds!.includes(s.id))) ||
      songs.find((s) => s.title.toLowerCase().includes("harley")) ||
      songs[0]
    return {
      message: hotMsg,
      song: hotSong,
      intent,
    }
  }

  if (intent === "best") {
    const bestMsg = overview.best
    const bestSong =
      (overview.bestSongIds &&
        songs.find((s) => overview.bestSongIds!.includes(s.id))) ||
      songs.find((s) => s.title.toLowerCase().includes("tình yêu ngủ quên")) ||
      songs[0]
    return {
      message: bestMsg,
      song: bestSong,
      intent,
    }
  }

  if (intent === "random_today") {
    const randomSong = pickRandom(songs)
    return {
      message:
        `Hôm nay mình nghĩ bạn có thể thử **${randomSong.title}**. ` +
        pickRandom(randomSong.responses),
      song: randomSong,
      intent,
    }
  }

  // 2) EMOTION-BASED
  let bestMatch: SongInfo | null = null
  let maxScore = 0

  for (const song of songs) {
    let score = 0
    for (const keyword of song.keywords) {
      if (input.toLowerCase().includes(keyword)) score += 2
    }
    for (const mood of song.mood) {
      if (input.toLowerCase().includes(mood)) score += 1
    }
    if (score > maxScore) {
      maxScore = score
      bestMatch = song
    }
  }

  if (!bestMatch) {
    const fallback =
      songs.find((s) => s.title.toLowerCase().includes("tình yêu ngủ quên")) ||
      songs[0]
    return {
      message: pickRandom(fallback.responses),
      song: fallback,
      intent: "fallback_positive",
    }
  }

  return {
    message: pickRandom(bestMatch.responses),
    song: bestMatch,
    intent: "emotion_match",
  }
}
