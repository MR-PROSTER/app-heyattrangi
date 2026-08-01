export type ReadArticleCategory =
  | "Calm"
  | "Habits"
  | "Sleep"
  | "Feelings"
  | "Focus"
  | "Rest"

export interface ReadArticle {
  id: string
  slug: string
  title: string
  description: string
  category: ReadArticleCategory
  readTime: string
  body: string
  publishedDate: string
}

export const READ_ARTICLES: ReadArticle[] = [
  {
    id: "small-pauses",
    slug: "small-pauses",
    title: "The Quiet Power of Small Pauses",
    description: "Why brief moments of stillness can gently reset your day.",
    category: "Calm",
    readTime: "4 min",
    publishedDate: "2026-06-12",
    body: `Most days move quickly. Between messages, tasks, and the noise of ordinary life, it can feel like there is little room to breathe.

A small pause does not need to solve anything. It can be as simple as placing your feet on the floor, noticing one full breath, or looking out a window for a few seconds.

These moments will not fix every hard feeling. They can, however, create a little space — enough to notice what you need next.

You might try one pause between meetings, or before you pick up your phone again. There is no perfect way to do it. Soft attention is enough.

Over time, these quiet intervals can become familiar resting places you return to when the day feels crowded.`,
  },
  {
    id: "naming-feelings",
    slug: "naming-feelings",
    title: "Naming What You Feel, Softly",
    description: "A gentle way to notice emotions without needing to fix them.",
    category: "Feelings",
    readTime: "5 min",
    publishedDate: "2026-05-28",
    body: `Sometimes a feeling arrives without a clear name. Tightness in the chest, a restless mind, or a heaviness that sits quietly in the background.

Giving a feeling a simple name — tired, uneasy, hopeful, overwhelmed — can make it feel a little less blurry. You do not need the perfect word. Close enough is fine.

Naming is not the same as solving. You are not required to change the feeling, explain it, or push it away. You are only acknowledging that it is here.

You might say to yourself, “Something in me feels tense right now.” That sentence alone can soften the edges.

If the feeling stays, that is allowed too. Soft noticing is a kind of company you can offer yourself, even on difficult days.`,
  },
  {
    id: "evening-wind-down",
    slug: "evening-wind-down",
    title: "A Softer Way to End the Day",
    description: "Simple evening habits that help your body recognize rest.",
    category: "Sleep",
    readTime: "6 min",
    publishedDate: "2026-07-02",
    body: `Evenings often carry leftovers from the day — unfinished thoughts, open tabs, and plans for tomorrow. Rest can feel distant when the mind is still working.

A wind-down does not have to be elaborate. Dimming lights a little earlier, putting the phone farther away, or taking a few slower breaths can signal that the day is closing.

You might choose one small ritual: a warm drink, a short stretch, or writing down one thing you can leave until morning.

Sleep may still take time. That is okay. The goal is not perfect rest every night. It is offering your body a gentler runway.

If sleep feels hard often, be kind with yourself. Soft evenings are one place to begin, not a promise of results.`,
  },
  {
    id: "one-kind-habit",
    slug: "one-kind-habit",
    title: "Building One Kind Habit at a Time",
    description: "How tiny, repeatable actions can feel more sustainable than big plans.",
    category: "Habits",
    readTime: "5 min",
    publishedDate: "2026-04-18",
    body: `Big resolutions can look inspiring and still feel heavy. When change asks for too much at once, it is easy to stop before you begin.

A kind habit is small enough that you can return to it on ordinary days. A glass of water after waking. Two minutes of stretching. One sentence in a notebook.

The size matters less than the return. Missing a day does not erase the habit. Tomorrow is another chance to begin again, lightly.

You might ask: what is one action that feels supportive and doable this week? Not impressive — supportive.

Over weeks, these quiet repetitions can become a soft structure around your days, without demanding perfection.`,
  },
  {
    id: "attention-gently",
    slug: "attention-gently",
    title: "When Focus Feels Scattered",
    description: "Gentle ways to gather your attention without forcing it.",
    category: "Focus",
    readTime: "4 min",
    publishedDate: "2026-03-09",
    body: `Scattered attention is common. Notifications, unfinished thoughts, and tiredness can pull the mind in many directions at once.

Instead of demanding focus, you can invite it. Choose one small task. Clear a little visual space. Take one breath before you begin.

If your mind wanders, that is ordinary. Gently bringing it back is the practice — not staying perfectly locked on.

Short stretches of attention often work better than long ones when you feel worn. Ten quiet minutes can be enough for now.

Be patient with a busy mind. Soft redirection tends to land more kindly than criticism.`,
  },
  {
    id: "permission-to-rest",
    slug: "permission-to-rest",
    title: "Giving Yourself Permission to Rest",
    description: "Rest is not a reward you have to earn first.",
    category: "Rest",
    readTime: "3 min",
    publishedDate: "2026-06-30",
    body: `Many of us wait until we are exhausted before we allow rest. Productivity can become the gatekeeper of care.

Rest does not require a finished list. You can pause because you are a person, not because you have earned it.

Rest might look like lying down, sitting quietly, stepping outside, or doing less for a short while. It does not need to be productive.

If guilt shows up, notice it without letting it run the whole show. You can feel uneasy about resting and still choose a softer pace.

One small rest today is enough. You do not have to overhaul your whole life to begin.`,
  },
  {
    id: "walking-and-noticing",
    slug: "walking-and-noticing",
    title: "Walking as a Way of Noticing",
    description: "How a short walk can reconnect you with your senses.",
    category: "Calm",
    readTime: "4 min",
    publishedDate: "2026-05-04",
    body: `A walk does not have to be long or athletic to be useful. Even a few minutes outdoors — or around your home — can shift the texture of a day.

As you walk, you might notice colors, temperatures, sounds, or the feeling of your feet meeting the ground. You do not need to turn it into a formal practice.

If thoughts keep arriving, let them pass like scenery. You can return to one sensory detail whenever you remember.

Walking will not erase every worry. It can offer movement and a change of view, which sometimes helps feelings settle a little.

Choose a pace that feels kind. There is nowhere particular you need to arrive.`,
  },
  {
    id: "talking-to-yourself-kindly",
    slug: "talking-to-yourself-kindly",
    title: "The Tone You Use With Yourself",
    description: "How a gentler inner voice can change difficult moments.",
    category: "Feelings",
    readTime: "5 min",
    publishedDate: "2026-07-14",
    body: `The way we speak to ourselves often goes unnoticed — until a hard moment makes it loud. Harsh words can arrive automatically.

You do not have to invent forced positivity. A kinder tone can be simple: “This is hard.” “I am doing what I can.” “It makes sense that I feel this way.”

Try noticing your inner commentary for one day without trying to rewrite all of it. Awareness alone can create a little distance.

When you catch a sharp sentence, you might soften it the way you would for a friend. Not perfect. Just a little gentler.

Over time, that quieter kindness can become more familiar — a steadier companion on ordinary and difficult days alike.`,
  },
  {
    id: "mornings-without-rush",
    slug: "mornings-without-rush",
    title: "Mornings Without the Rush",
    description: "Small ways to start the day with a little more room.",
    category: "Habits",
    readTime: "4 min",
    publishedDate: "2026-02-21",
    body: `Mornings can feel like a race before they have begun. Alarms, messages, and the sense of already being behind.

A slower start does not require an hour of free time. It might be one quiet minute before screens, a glass of water, or sitting for three breaths.

You can protect a tiny threshold between sleep and the day. That threshold can be imperfect and still helpful.

If some mornings stay chaotic, that is human. The practice is returning when you can, not getting every morning “right.”

Begin with the smallest possible softness. That is often the most realistic place to start.`,
  },
]

export function getReadArticleBySlug(slug: string): ReadArticle | undefined {
  return READ_ARTICLES.find((a) => a.slug === slug)
}

export function getReadArticlesByIds(ids: string[]): ReadArticle[] {
  const map = new Map(READ_ARTICLES.map((a) => [a.id, a]))
  return ids
    .map((id) => map.get(id))
    .filter((a): a is ReadArticle => Boolean(a))
}

export function formatReadPublishedDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
