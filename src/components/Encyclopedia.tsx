/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronDown, 
  BookOpen, 
  ArrowLeft,
  Flame,
  Award,
  Info
} from 'lucide-react';
import { Question, UserStats, GenreFilter, DifficultyFilter } from '../types';

interface EncyclopediaProps {
  questions: Question[];
  stats: UserStats;
  onBack: () => void;
}

export default function Encyclopedia({ questions, stats, onBack }: EncyclopediaProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [unlockedFilter, setUnlockedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedLawId, setSelectedLawId] = useState<string | null>(null);
  const [devUnlockAll, setDevUnlockAll] = useState(false); // 【検証用】図鑑全開放フラグ

  // フィルタリング処理
  const filteredQuestions = questions.filter(q => {
    const isUnlocked = stats.unlockedIds.includes(q.id) || devUnlockAll;
    const matchesSearch = 
      q.lawName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGenre = genreFilter === 'all' || q.genre === genreFilter;
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    
    let matchesUnlock = true;
    if (unlockedFilter === 'unlocked') matchesUnlock = isUnlocked;
    if (unlockedFilter === 'locked') matchesUnlock = !isUnlocked;

    return matchesSearch && matchesGenre && matchesDifficulty && matchesUnlock;
  });

  // ジャンル日本語表記
  const getGenreLabel = (g: string) => {
    switch (g) {
      case 'daily': return '日常生活・マナー';
      case 'unusual': return '珍法律・歴史';
      case 'special': return '特殊エリア・乗り物';
      default: return '法律';
    }
  };

  const getGenreColor = (g: string) => {
    switch (g) {
      case 'daily': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'unusual': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'special': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // 難易度日本語表記
  const getDifficultyLabel = (d: string) => {
    switch (d) {
      case 'easy': return '初級';
      case 'medium': return '中級';
      case 'hard': return '上級';
      default: return '中級';
    }
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'hard': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // 進捗率
  const unlockedCount = devUnlockAll ? questions.length : questions.filter(q => stats.unlockedIds.includes(q.id)).length;
  const progressPercent = Math.round((unlockedCount / questions.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto" id="encyclopedia-wrapper">
      {/* ヘッダー・戻るボタン */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" id="encyclopedia-header">
        <div className="flex items-center gap-3" id="encyclopedia-title-block">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition duration-200 text-slate-600"
            id="back-to-menu-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight" id="encyclopedia-main-title">マイナー法律図鑑</h1>
            <p className="text-sm text-slate-500" id="encyclopedia-subtitle">解いたクイズの法律を自動収集し、実際の条文を学ぶ</p>
          </div>
        </div>

        {/* コレクション進捗表示 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 shrink-0 min-w-[240px]" id="collection-progress-card">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl" id="progress-icon-box">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1" id="progress-data-box">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1" id="progress-text-row">
              <span>コレクション回収率</span>
              <span className="font-bold text-indigo-600">{unlockedCount} / {questions.length} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden" id="progress-track">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
                id="progress-fill"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルターパネル */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 mb-6 flex flex-col gap-4" id="filters-panel">
        <div className="flex flex-col md:flex-row gap-3" id="search-row">
          {/* 検索入力 */}
          <div className="relative flex-1" id="search-input-box">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="法律名、キーワードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 rounded-xl text-sm transition duration-150 outline-none"
              id="law-search-input"
            />
          </div>

          {/* 解放フィルター */}
          <div className="flex rounded-xl bg-slate-100 p-1 shrink-0" id="unlock-tabs">
            <button
              onClick={() => setUnlockedFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                unlockedFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              id="filter-tab-all"
            >
              すべて
            </button>
            <button
              onClick={() => setUnlockedFilter('unlocked')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                unlockedFilter === 'unlocked' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              id="filter-tab-unlocked"
            >
              <Unlock className="w-3 h-3" />
              解放済
            </button>
            <button
              onClick={() => setUnlockedFilter('locked')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                unlockedFilter === 'locked' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              id="filter-tab-locked"
            >
              <Lock className="w-3 h-3" />
              未解放
            </button>
          </div>
        </div>

        {/* ジャンル・難易度フィルター */}
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4" id="filters-row-2">
          {/* ジャンル */}
          <div className="flex items-center gap-2" id="genre-filter-box">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">分類:</span>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value as GenreFilter)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
              id="genre-select"
            >
              <option value="all">すべて</option>
              <option value="daily">日常生活・マナー</option>
              <option value="unusual">珍法律・歴史</option>
              <option value="special">特殊エリア・乗り物</option>
            </select>
          </div>

          {/* 難易度 */}
          <div className="flex items-center gap-2" id="diff-filter-box">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">難易度:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
              id="diff-select"
            >
              <option value="all">すべて</option>
              <option value="easy">初級</option>
              <option value="medium">中級</option>
              <option value="hard">上級</option>
            </select>
          </div>

          {/* 【検証用】デバッグトグル */}
          <div className="flex items-center gap-2 md:ml-auto" id="dev-unlock-box">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
              <span>⚙️ 検証用:</span>
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={devUnlockAll} 
                onChange={(e) => setDevUnlockAll(e.target.checked)} 
                className="sr-only peer"
                id="dev-unlock-toggle"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-700">図鑑を強制全開放</span>
            </label>
          </div>
        </div>
      </div>

      {/* 法律カード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12" id="encyclopedia-grid">
        {filteredQuestions.map((q) => {
          const isUnlocked = stats.unlockedIds.includes(q.id) || devUnlockAll;
          const isSelected = selectedLawId === q.id;

          return (
            <div 
              key={q.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSelected 
                  ? 'ring-2 ring-indigo-500/80 border-transparent shadow-md col-span-1 md:col-span-2' 
                  : 'hover:shadow-sm hover:border-slate-300 border-slate-100 shadow-xs'
              }`}
              id={`encyclopedia-card-${q.id}`}
            >
              {/* カード上部 */}
              <div 
                onClick={() => setSelectedLawId(isSelected ? null : q.id)}
                className="p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                id={`card-header-clickable-${q.id}`}
              >
                <div className="flex-1" id={`card-title-box-${q.id}`}>
                  {/* バッジ一覧 */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2" id={`badges-row-${q.id}`}>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getGenreColor(q.genre)}`}>
                      {getGenreLabel(q.genre)}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getDifficultyColor(q.difficulty)}`}>
                      {getDifficultyLabel(q.difficulty)}
                    </span>
                  </div>

                  {/* 法律タイトル・法令名 */}
                  <h3 className="text-base font-bold text-slate-800 leading-snug flex items-center gap-1.5" id={`law-title-text-${q.id}`}>
                    {isUnlocked ? q.lawName : '未解禁の法律'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5" id={`law-no-text-${q.id}`}>
                    {isUnlocked ? q.lawNo : 'クイズに挑戦して解禁しよう'}
                  </p>
                </div>

                {/* ロック状態インジケータ */}
                <div className="shrink-0 mt-1" id={`lock-indicator-${q.id}`}>
                  {isUnlocked ? (
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100" id={`unlock-icon-box-${q.id}`}>
                      <Unlock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100" id={`lock-icon-box-${q.id}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* カード詳細（アコーディオン） */}
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-slate-100 bg-slate-50/50"
                    id={`accordion-body-${q.id}`}
                  >
                    <div className="p-5" id={`accordion-content-pading-${q.id}`}>
                      {isUnlocked ? (
                        <div className="space-y-4" id={`unlocked-details-${q.id}`}>
                          {/* 条文バッジ */}
                          <div className="flex flex-wrap gap-2" id={`article-badges-${q.id}`}>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold rounded-md">
                              対象：{q.article}
                            </span>
                          </div>

                          {/* クイズおさらい */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs" id={`quiz-review-box-${q.id}`}>
                            <p className="text-xs text-slate-400 font-bold mb-1">💡 クイズおさらい</p>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                              「{q.question}」
                            </p>
                            <p className="text-xs text-emerald-600 font-bold mt-1.5">
                              正解の解答：{q.choices[q.answerIndex]}
                            </p>
                          </div>

                          {/* 解説文 */}
                          <div id={`law-explanation-box-${q.id}`}>
                            <p className="text-xs text-slate-400 font-bold mb-1">📝 法律の解説</p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {q.explanation}
                            </p>
                          </div>

                          {/* e-Govジャンプボタン */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 shadow-xs" id={`egov-link-container-${q.id}`}>
                            <span className="text-xs text-slate-400 font-medium">e-Gov法令検索 (公式)</span>
                            <a
                              href={q.egovUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition duration-150 flex items-center gap-1"
                              id={`egov-direct-link-${q.id}`}
                            >
                              条文を直接開く
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-slate-500" id={`locked-message-box-${q.id}`}>
                          <Lock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-bold text-slate-700">この法律はまだ未解放です</p>
                          <p className="text-xs text-slate-400 mt-1">
                            クイズをプレイし、この問題に出会うか正解することで図鑑のロックを解除できます。
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-100" id="no-filtered-laws-box">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">条件に一致する法律がありません</p>
            <p className="text-xs text-slate-400 mt-1">検索キーワードやフィルター条件を変えてみてください。</p>
          </div>
        )}
      </div>
    </div>
  );
}
