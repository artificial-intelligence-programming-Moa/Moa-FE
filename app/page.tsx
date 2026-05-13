"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CATEGORY_COLORS: Record<string, string> = {
  장학: "#3b82f6",
  취업: "#06b6d4",
  학사: "#f97316",
  행사: "#eab308",
  프로그램 : "#a855f4",
  기타: "#9ca3af",
};

const CATEGORY_ORDER = ["장학", "학사", "취업", "행사", "프로그램", "기타"];

type BadgeType = "teal" | "blue" | "green" | "amber" | "gray" | "purple";

const CATEGORY_BADGE: Record<string, BadgeType> = {
  장학: "teal",
  학사: "blue",
  취업: "green",
  행사: "amber",
  기타: "gray",
  프로그램 : "purple"
};

const CATEGORY_TO_KOREAN: Record<string, string> = {
  scholarship: "장학",
  academic: "학사",
  job: "취업",
  event: "행사",
  program : "프로그램",
  other: "기타",
};

const badgeClass: Record<BadgeType, string> = {
  teal: "bg-teal-50 text-teal-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  gray: "bg-gray-100 text-gray-500",
  purple : "bg-purple-50 text-purple-700"
};


interface Article {
  id: number;
  title: string;
  category: string;
  summary?: string;
  created_at: string;
  source: string;
  url?: string;
}

function getRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 60) return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

function getBadge(category: string): BadgeType {
  return CATEGORY_BADGE[CATEGORY_TO_KOREAN[category]] ?? "gray";
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[CATEGORY_TO_KOREAN[category]] ?? "#84cc16";
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-1/3 mt-1" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/articles/?limit=100`);
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const data: Article[] = await res.json();
      setArticles(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const categoryCounts = articles.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  const categories = [
    { id: "전체", label: "전체", count: articles.length, color: "#84cc16" },
    ...Object.keys(categoryCounts)
      .map((cat) => ({
        id: cat,
        label: CATEGORY_TO_KOREAN[cat],
        count: categoryCounts[cat],
        color: getCategoryColor(cat),
      }))
      .sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.label);
        const bi = CATEGORY_ORDER.indexOf(b.label);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }),
  ];

  const filtered =
    selectedCategory === "전체"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const lastUpdatedStr = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000) < 1
      ? "방금 전"
      : `${Math.floor((Date.now() - lastUpdated.getTime()) / 60000)}분 전`
    : "...";

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-tight">
              경희대학교 공지 모아보기
            </h1>
            <p className="text-xs text-gray-400">
              마지막 업데이트 · {lastUpdatedStr}
            </p>
          </div>
        </div>
        <button
          onClick={fetchArticles}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshIcon spinning={loading} />
          새로고침
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-44 bg-white border-r border-gray-200 flex flex-col py-5 px-3 shrink-0">
          <p className="text-xs text-gray-400 font-medium px-2 mb-2">카테고리</p>
          <ul className="space-y-0.5 flex-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
                        style={{
                          backgroundColor: cat.color,
                          transform: isSelected ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                      {cat.label}
                    </div>
                    <span
                      className={`text-xs ${
                        isSelected ? "text-blue-500" : "text-gray-400"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {/* N logo */}
          <div className="px-2 mt-4">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold leading-none">N</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">
              전체 <span className="font-semibold">공지</span> {filtered.length}건
            </p>
            <select className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-600 cursor-pointer focus:outline-none">
              <option>최신순</option>
              <option>오래된순</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600 mb-3">
              {error}
              <button
                onClick={fetchArticles}
                className="ml-2 underline hover:no-underline"
              >
                다시 시도
              </button>
            </div>
          )}

          <div key={selectedCategory} className="space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : filtered.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-fade-slide-in bg-white rounded-xl px-5 py-4 shadow-sm"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: getCategoryColor(item.category) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-sm font-semibold text-gray-900 leading-snug">
                            {item.title}
                          </h2>
                          <span
                            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${badgeClass[getBadge(item.category)]}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        {item.summary && (
                          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                            {item.summary}
                          </p>
                        )}
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <ClockIcon />
                            <span>
                              {getRelativeTime(item.created_at)} · {item.source}
                            </span>
                          </div>
                          <a
                            href={item.url ?? "#"}
                            target={item.url ? "_blank" : undefined}
                            rel={item.url ? "noopener noreferrer" : undefined}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            원문 보기 ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </main>
      </div>
    </div>
  );
}
