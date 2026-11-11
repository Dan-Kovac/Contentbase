// Live-blog sample content (TLK-08). Lives here until live blogs have a table in lib/data.
// Every live page carries is_live = true, which switches wagering ads off for the page.

export interface LiveUpdate {
  id: string
  time: string
  /** 24-hour time for the datetime attribute. */
  iso: string
  title?: string
  text: string
  key?: boolean
  author: string
}

export interface LiveBlog {
  slug: string
  title: string
  standfirst: string
  event: string
  startedAt: string
  updatedAt: string
  updatedIso: string
  updates: LiveUpdate[]
}

const BLOGS: Record<string, LiveBlog> = {
  footyfix: {
    slug: "aflw-finals-team-news",
    title: "AFLW finals: team news as it lands",
    standfirst: "Every selection, omission and late change for the weekend's AFLW finals, with what each one means on the ground.",
    event: "AFLW finals, week two",
    startedAt: "11 November 2026",
    updatedAt: "6:42 pm",
    updatedIso: "2026-11-11T18:42:00+11:00",
    updates: [
      { id: "u6", time: "6:42 pm", iso: "2026-11-11T18:42:00+11:00", author: "Jess Nguyen", key: true, title: "All four sides named", text: "That's every team in. Three changes across the four sides, and only one of them forced. Our full preview drops tomorrow at 6 pm." },
      { id: "u5", time: "6:15 pm", iso: "2026-11-11T18:15:00+11:00", author: "Jess Nguyen", text: "North Melbourne are unchanged for a third straight week. The midfield rotation that has won the clearance count in every game since round six stays intact." },
      { id: "u4", time: "5:58 pm", iso: "2026-11-11T17:58:00+11:00", author: "Sam Doherty", title: "Adelaide make the one forced change", text: "A hamstring from last week's win rules out a key defender. The replacement is a taller option, so expect Adelaide to play one fewer small forward-line stopper." },
      { id: "u3", time: "5:30 pm", iso: "2026-11-11T17:30:00+11:00", author: "Sam Doherty", text: "Brisbane bring back their first-year ruck after two weeks in the twos. That matters: they lost the hitouts by eleven last start and conceded three goals from centre bounces." },
      { id: "u2", time: "5:12 pm", iso: "2026-11-11T17:12:00+11:00", author: "Jess Nguyen", text: "Quick reminder on how finals selection works this week: clubs name 21 plus emergencies tonight, with final changes allowed up to an hour before the first bounce." },
      { id: "u1", time: "5:00 pm", iso: "2026-11-11T17:00:00+11:00", author: "Jess Nguyen", key: true, title: "We're live", text: "Teams are due from 5 pm. We'll post each one as it lands, and Sam will add the tactical read." },
    ],
  },
  trackside: {
    slug: "sandown-wednesday",
    title: "Sandown Lakeside: race by race",
    standfirst: "Scratchings, track updates and the result of every race from Wednesday's meeting at Sandown.",
    event: "Sandown Lakeside, Wednesday 11 November 2026",
    startedAt: "11 November 2026",
    updatedAt: "3:48 pm",
    updatedIso: "2026-11-11T15:48:00+11:00",
    updates: [
      { id: "t6", time: "3:48 pm", iso: "2026-11-11T15:48:00+11:00", author: "Trackside", key: true, title: "Race 6 result", text: "SILVER CANOPY holds on by a short half-head over 1300 metres. Settled third on the fence and got the split at the 300. Fourth win from nine starts." },
      { id: "t5", time: "3:20 pm", iso: "2026-11-11T15:20:00+11:00", author: "Trackside", title: "Track upgraded", text: "The track is upgraded to a Good 4 after the fifth. Rail out three metres the entire circuit. Leaders have won three of the five so far." },
      { id: "t4", time: "2:51 pm", iso: "2026-11-11T14:51:00+11:00", author: "Trackside", title: "Race 5 result", text: "HARBOUR LIGHTS leads all the way over 1600 metres for a first metropolitan win. Her trainer says she'll head to the Pakenham Cup next." },
      { id: "t3", time: "2:10 pm", iso: "2026-11-11T14:10:00+11:00", author: "Trackside", text: "A late scratching in race 7: number 4 is out on the vet's advice. That leaves nine runners." },
      { id: "t2", time: "1:35 pm", iso: "2026-11-11T13:35:00+11:00", author: "Trackside", title: "Race 3 result", text: "MOONEE MIST settles last and runs over the top of them from the 400. Strong close over 2000 metres, and the type to step up to the Sandown Cup." },
      { id: "t1", time: "12:30 pm", iso: "2026-11-11T12:30:00+11:00", author: "Trackside", key: true, title: "We're live from Sandown", text: "Eight races, first jump at 12:45 pm. The track is a Soft 5 with the rail out three metres. We'll post every result and anything that changes the shape of the day." },
    ],
  },
}

export function getLiveBlog(channelSlug: string) {
  return BLOGS[channelSlug]
}
