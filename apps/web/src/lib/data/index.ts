// Data access for every screen. Today it reads the fixed sample data; in the
// build plan these become database queries (Drizzle + Postgres) with the same
// signatures, so screens don't change.
import {
  adDecisions,
  campaigns,
  channels,
  creatives,
  customPages,
  sponsors,
  standaloneArticles,
  dailyStats,
  earnings,
  videoTemplates,
  creditAccount,
  madeVideos,
  importJobs,
  shorts,
  videos,
} from "./sample"
import type { ContentStatus } from "@/lib/types"

export const DEMO_CHANNEL_SLUG = "footyfix"

export function listChannels() {
  return channels
}
export function getChannel(slug: string) {
  return channels.find((c) => c.slug === slug)
}
export function getChannelById(id: string) {
  return channels.find((c) => c.id === id)
}
export function listVideos(channelId: string, status?: ContentStatus | ContentStatus[]) {
  const s = status ? (Array.isArray(status) ? status : [status]) : null
  return videos.filter((v) => v.channelId === channelId && (!s || s.includes(v.status)))
}
export function getVideo(id: string) {
  return videos.find((v) => v.id === id)
}
export function getVideoBySlug(channelId: string, slug: string) {
  return videos.find((v) => v.channelId === channelId && v.slug === slug)
}
export function listShorts(channelId: string, status?: ContentStatus) {
  return shorts.filter((s) => s.channelId === channelId && (!status || s.status === status))
}
export function getShort(id: string) {
  return shorts.find((s) => s.id === id)
}
export function listImportJobs(channelId: string) {
  return importJobs.filter((j) => j.channelId === channelId)
}
export function listVideoTemplates() {
  return videoTemplates
}
export function getCreditAccount() {
  return creditAccount
}
export function listMadeVideos(channelId: string) {
  return madeVideos.filter((v) => v.channelId === channelId)
}

/** The channel's share of sponsor revenue for the last 30 days (sample). */
export function getEarnings(channelId: string) {
  return earnings.find((e) => e.channelId === channelId)
}
export function getDailyStats() {
  return dailyStats
}
export function listCampaigns() {
  return campaigns
}
export function listCreatives() {
  return creatives
}
export function listAdDecisions() {
  return adDecisions
}
export function allVideos() {
  return videos
}
export function allShorts() {
  return shorts
}
export function listSponsors() {
  return sponsors
}
export function getSponsor(id: string) {
  return sponsors.find((s) => s.id === id)
}
export function listArticles(channelId: string) {
  return standaloneArticles.filter((a) => a.channelId === channelId)
}
export function getArticle(id: string) {
  return standaloneArticles.find((a) => a.id === id)
}
export function getArticleBySlug(channelId: string, slug: string) {
  return standaloneArticles.find((a) => a.channelId === channelId && a.slug === slug)
}
export function allArticles() {
  return standaloneArticles
}
export function listPages(channelId: string) {
  return customPages.filter((p) => p.channelId === channelId)
}
export function getPage(id: string) {
  return customPages.find((p) => p.id === id)
}
export function getPageBySlug(channelId: string, slug: string) {
  return customPages.find((p) => p.channelId === channelId && p.slug === slug)
}
export function allPages() {
  return customPages
}
