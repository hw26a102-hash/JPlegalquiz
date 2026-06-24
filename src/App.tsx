/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Play, 
  BookOpen, 
  Info, 
  Award, 
  Flame, 
  Heart,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { QUESTIONS } from './data/questions';
import { GameMode, UserStats, GenreFilter, DifficultyFilter } from './types';
import QuizGame from './components/QuizGame';
import Encyclopedia from './components/Encyclopedia';

const LOCAL_STORAGE_KEY = 'minor_law_quiz_user_stats_v1';

export default function App() {
  const [mode, setMode] = useState<GameMode>('title');
  const [genre, setGenre] = useState<GenreFilter>('all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  
  // インライン確認ダイアログのステート
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  // カスタム通知メッセージ
  const [notification, setNotification] = useState<string | null>(null);

  // ユーザー成績と図鑑登録データ (localStorageで永続化)
  const [stats, setStats] = useState<UserStats>({
    score: 0,
    highScore: 0,
    correctAnswersCount: 0,
    totalAnsweredCount: 0,
    consecutiveCorrect: 0,
    maxConsecutiveCorrect: 0,
    unlockedIds: []
  });

  // 通知の自動消去
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 初回読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load user stats from localStorage:', e);
    }
  }, []);

  // スタッツ更新・永続化関数
  const handleUpdateStats = (newStats: UserStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStats));
    } catch (e) {
      console.error('Failed to save user stats to localStorage:', e);
    }
  };

  // 全リセット（図鑑もスコアもすべてリセットする機能）
  const handleResetAllData = () => {
    const defaultStats: UserStats = {
      score: 0,
      highScore: 0,
      correctAnswersCount: 0,
      totalAnsweredCount: 0,
      consecutiveCorrect: 0,
      maxConsecutiveCorrect: 0,
      unlockedIds: []
    };
    handleUpdateStats(defaultStats);
    setNotification('セーブデータを初期化しました。');
    setShowResetConfirm(false);
  };

  // 【検証用】図鑑の全開放
  const handleUnlockAllData = () => {
    const allIds = QUESTIONS.map(q => q.id);
    const updatedStats: UserStats = {
      ...stats,
      unlockedIds: allIds
    };
    handleUpdateStats(updatedStats);
    setNotification('すべての図鑑をセーブデータ上で解放しました！');
    setShowUnlockConfirm(false);
  };

  // 図鑑解放率
  const unlockProgress = QUESTIONS.length > 0 
    ? Math.round((stats.unlockedIds.length / QUESTIONS.length) * 100) 
    : 0;

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased transition-colors duration-300 ${mode === 'title' ? 'h-screen overflow-hidden bg-slate-950 text-white' : ''}`} id="main-layout">
      {/* 共通ナビゲーションバー（タイトル以外の画面で表示可能） */}
      {mode !== 'title' && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 animate-fade-in" id="global-header">
          <div className="max-w-5xl mx-auto flex items-center justify-between" id="header-container">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setMode('title')} id="header-logo">
              <Scale className="w-6 h-6 text-indigo-600 stroke-[2.5]" />
              <span className="font-black text-lg text-slate-800 tracking-tight">日本のマイナー法律クイズ</span>
            </div>

            <div className="flex items-center gap-3" id="header-actions">
              {mode !== 'title' && (
                <button
                  onClick={() => setMode('title')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1"
                  id="header-home-btn"
                >
                  タイトルに戻る
                </button>
              )}
              
              {/* クイック統計 */}
              <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-100/50 px-3 py-1.5 rounded-xl border border-slate-200/50" id="header-stats">
                <span className="text-slate-400 font-semibold">図鑑解放:</span>
                <span className="font-extrabold text-indigo-600">{stats.unlockedIds.length} / {QUESTIONS.length}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* メインコンテンツエリア */}
      <main className={`flex-1 w-full mx-auto flex flex-col justify-center ${mode === 'title' ? 'h-full max-w-4xl p-4 md:p-6 overflow-hidden justify-between' : 'max-w-5xl p-4 md:p-8'}`} id="main-content-container">
        <AnimatePresence mode="wait">
          
          {/* 1. タイトル画面 */}
          {mode === 'title' && (
            <motion.div
              key="title"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-between overflow-hidden py-1"
              id="title-view"
            >
              {/* メインビジュアル / タイトルカード */}
              <div className="bg-gradient-to-br from-slate-900/60 via-indigo-950/40 to-slate-900/60 text-white p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center border border-indigo-500/10 flex-1 flex flex-col justify-center my-auto min-h-0" id="title-hero-card">
                
                {/* 装飾用背景パターン */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" id="title-bg-dots" />
                
                <div className="flex flex-col items-center justify-center shrink-0" id="title-logo-and-headings">
                  {/* スケール（天秤）アイコンアニメーション */}
                  <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="w-14 h-14 md:w-16 md:h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-indigo-400/20"
                    id="title-scale-icon-box"
                  >
                    <Scale className="w-7 h-7 md:w-8 md:h-8" />
                  </motion.div>

                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2 md:mb-3" id="title-app-name">
                    日本のマイナー法律クイズ<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-amber-200 text-lg md:text-2xl font-extrabold" id="title-app-sub">
                      〜法廷の達人・珍法編〜
                    </span>
                  </h1>
                </div>

                <p className="text-indigo-200/90 text-xs md:text-sm max-w-md mx-auto leading-relaxed mb-4 md:mb-6 font-medium shrink-0" id="title-tagline">
                  「知っていれば無罪、知らねば犯罪!?」<br />
                  日常生活に潜む意外なルールや、明治時代から現代に息づくマイナーな法律を、e-Gov公式データに基づく正確な解説で楽しく学びましょう。
                </p>

                {/* スコアボードダッシュボード */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-full shrink-0" id="title-stats-dashboard">
                  <div className="text-center" id="dashboard-high-score">
                    <p className="text-[9px] md:text-[10px] text-indigo-200 font-semibold tracking-wider uppercase">ハイスコア</p>
                    <p className="text-sm md:text-base font-black text-amber-200 mt-0.5">{stats.highScore} <span className="text-[8px] md:text-[9px] font-normal text-indigo-300">pts</span></p>
                  </div>
                  <div className="text-center border-l border-white/10" id="dashboard-unlock">
                    <p className="text-[9px] md:text-[10px] text-indigo-200 font-semibold tracking-wider uppercase">図鑑解放</p>
                    <p className="text-sm md:text-base font-black text-indigo-200 mt-0.5">{stats.unlockedIds.length} <span className="text-[8px] md:text-[9px] font-normal text-indigo-300">/ {QUESTIONS.length}</span></p>
                  </div>
                  <div className="text-center border-l border-white/10" id="dashboard-max-combo">
                    <p className="text-[9px] md:text-[10px] text-indigo-200 font-semibold tracking-wider uppercase">最高連勝</p>
                    <p className="text-sm md:text-base font-black text-emerald-300 mt-0.5 flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      {stats.maxConsecutiveCorrect}
                    </p>
                  </div>
                </div>
              </div>

              {/* メインアクション */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 shrink-0" id="title-action-buttons">
                {/* クイズを始める */}
                <button
                  onClick={() => setMode('setup')}
                  className="sm:col-span-2 group relative bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg transition-all duration-200 flex flex-row items-center justify-center gap-3 text-left cursor-pointer"
                  id="start-quiz-setup-btn"
                >
                  <div className="p-2.5 bg-white/10 text-white rounded-xl group-hover:scale-110 transition duration-200 shrink-0" id="play-icon-box">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                  <div id="start-btn-labels">
                    <span className="block font-black text-base md:text-lg tracking-wide">法律クイズに挑戦</span>
                    <span className="block text-[10px] text-indigo-100 font-medium mt-0.5">3ライフ制・連続正解でコンボボーナス！</span>
                  </div>
                </button>

                {/* 図鑑をひらく */}
                <button
                  onClick={() => setMode('encyclopedia')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-4 rounded-2xl shadow-md transition-all duration-200 flex flex-row items-center justify-center gap-3 text-left cursor-pointer"
                  id="open-encyclopedia-btn"
                >
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl shrink-0" id="book-icon-box">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div id="book-btn-labels">
                    <span className="block font-extrabold text-sm md:text-base text-white">マイナー法律図鑑</span>
                    <span className="block text-[10px] text-indigo-200 mt-0.5">解放率 {unlockProgress}% のコレクション</span>
                  </div>
                </button>
              </div>

              {/* サブメニュー */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4 shrink-0" id="title-footer-row">
                <button
                  onClick={() => setMode('how-to')}
                  className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  id="open-howto-btn"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  詳しい遊び方・ルール
                </button>

                <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right w-full sm:w-auto">
                  {showUnlockConfirm ? (
                    <div className="flex items-center gap-2 bg-indigo-950/85 border border-indigo-500/30 px-3 py-1 rounded-xl text-[11px] shadow-lg animate-fade-in" id="unlock-confirm-box">
                      <span className="font-extrabold text-indigo-200">本当に図鑑を全開放しますか？</span>
                      <button
                        onClick={handleUnlockAllData}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded-lg font-bold transition cursor-pointer"
                        id="unlock-confirm-yes-btn"
                      >
                        はい
                      </button>
                      <button
                        onClick={() => setShowUnlockConfirm(false)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg font-bold transition cursor-pointer"
                        id="unlock-confirm-no-btn"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : showResetConfirm ? (
                    <div className="flex items-center gap-2 bg-rose-950/85 border border-rose-500/30 px-3 py-1 rounded-xl text-[11px] shadow-lg animate-fade-in" id="reset-confirm-box">
                      <span className="font-extrabold text-rose-200">本当に全データを初期化しますか？</span>
                      <button
                        onClick={handleResetAllData}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded-lg font-bold transition cursor-pointer"
                        id="reset-confirm-yes-btn"
                      >
                        はい
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg font-bold transition cursor-pointer"
                        id="reset-confirm-no-btn"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs" id="submenu-standard-buttons">
                      <button
                        onClick={() => {
                          setShowUnlockConfirm(true);
                          setShowResetConfirm(false);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold transition cursor-pointer"
                        id="dev-unlock-all-btn"
                      >
                        ⚙️ 図鑑を全開放
                      </button>
                      <span className="text-slate-700">|</span>
                      <button
                        onClick={() => {
                          setShowResetConfirm(true);
                          setShowUnlockConfirm(false);
                        }}
                        className="text-rose-400/80 hover:text-rose-300 text-[11px] font-medium transition cursor-pointer"
                        id="reset-data-btn"
                      >
                        セーブデータ初期化
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ゲーム風コンパクトな著作権表示 */}
              <div className="text-center text-[10px] text-slate-500 mt-2 shrink-0" id="title-game-copyright">
                日本のマイナー法律クイズ © 2026. 解説は「e-Gov法令検索」に基づきます。
              </div>
            </motion.div>
          )}

          {/* 2. クイズセットアップ画面 */}
          {mode === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-100"
              id="setup-view"
            >
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2" id="setup-title">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                出題条件を設定
              </h2>

              {/* 1. ジャンル選択 */}
              <div className="mb-6" id="genre-select-group">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  ① クイズのジャンルを選ぶ
                </label>
                <div className="grid grid-cols-2 gap-3" id="genre-grid">
                  {[
                    { id: 'all', label: 'すべてのジャンル', desc: '全問題からランダムに出題' },
                    { id: 'daily', label: '日常生活・マナー', desc: '軽犯罪法、遺失物法など身近なルール' },
                    { id: 'unusual', label: '珍法律・歴史', desc: '決闘の禁止、お酒の強要禁止など' },
                    { id: 'special', label: '特殊エリア・乗り物', desc: '南極、鉄道、道路交通法など' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setGenre(item.id as GenreFilter)}
                      className={`p-4 rounded-2xl border text-left transition duration-150 focus:outline-none ${
                        genre === item.id 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/10' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                      id={`genre-btn-${item.id}`}
                    >
                      <span className="block font-bold text-sm md:text-base">{item.label}</span>
                      <span className="block text-[10px] md:text-xs text-slate-400 mt-1 font-medium">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 難易度選択 */}
              <div className="mb-8" id="difficulty-select-group">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  ② 難易度を選ぶ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="difficulty-grid">
                  {[
                    { id: 'all', label: 'すべて' },
                    { id: 'easy', label: '初級' },
                    { id: 'medium', label: '中級' },
                    { id: 'hard', label: '上級' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setDifficulty(item.id as DifficultyFilter)}
                      className={`p-3.5 rounded-xl border text-center font-bold text-sm transition duration-150 focus:outline-none ${
                        difficulty === item.id 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                      id={`diff-btn-${item.id}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6" id="setup-actions">
                <button
                  onClick={() => setMode('title')}
                  className="w-full sm:w-auto px-5 py-2.5 text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center justify-center gap-1 transition"
                  id="setup-back-btn"
                >
                  <ArrowLeft className="w-4 h-4" />
                  戻る
                </button>

                <button
                  onClick={() => setMode('quiz')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-1.5"
                  id="setup-start-btn"
                >
                  <span>クイズを開始する</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. クイズゲーム中 */}
          {mode === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
              id="game-active-view-container"
            >
              <QuizGame
                questions={QUESTIONS}
                genre={genre}
                difficulty={difficulty}
                onHome={() => setMode('title')}
                onViewEncyclopedia={() => setMode('encyclopedia')}
                stats={stats}
                onUpdateStats={handleUpdateStats}
              />
            </motion.div>
          )}

          {/* 4. 図鑑画面 */}
          {mode === 'encyclopedia' && (
            <motion.div
              key="encyclopedia"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
              id="encyclopedia-view-container"
            >
              <Encyclopedia
                questions={QUESTIONS}
                stats={stats}
                onBack={() => setMode('title')}
              />
            </motion.div>
          )}

          {/* 5. 遊び方画面 */}
          {mode === 'how-to' && (
            <motion.div
              key="how-to"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-100"
              id="howto-view"
            >
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4" id="howto-title">
                <HelpCircle className="w-6 h-6 text-indigo-500" />
                日本のマイナー法律クイズ：ルールと遊び方
              </h2>

              <div className="space-y-6 text-slate-600 text-sm md:text-base leading-relaxed mb-8" id="howto-content">
                {/* 1 */}
                <div className="flex gap-3" id="rule-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 mb-1 text-sm md:text-base">出題条件のセレクト</h3>
                    <p className="text-xs md:text-sm">
                      「日常生活・マナー」「珍法律・歴史」「特殊エリア・乗り物」からジャンルを、そして「初級」「中級」「上級」からお好みの難易度を自由に選択してゲームを開始します。
                    </p>
                  </div>
                </div>

                {/* 2 */}
                <div className="flex gap-3" id="rule-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 mb-1 text-sm md:text-base">3ライフのサバイバルシステム</h3>
                    <p className="text-xs md:text-sm">
                      プレイヤーは3つのライフ（ハート）を持ってクイズに挑みます。答えを間違えるとライフが1つ減少します。すべてのライフが尽きるとその時点でゲームオーバーとなります。
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="flex gap-3" id="rule-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 mb-1 text-sm md:text-base">連勝（コンボ）ボーナス</h3>
                    <p className="text-xs md:text-sm">
                      連続で正解するたびに、コンボボーナスが発生します。1問正解の基本スコア100点に加えて、コンボに応じた「連勝数 × 20点」のボーナスポイントが加算され、ハイスコアを目指しやすくなります。
                    </p>
                  </div>
                </div>

                {/* 4 */}
                <div className="flex gap-3" id="rule-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 mb-1 text-sm md:text-base">自動図鑑登録とe-Govリンク学習</h3>
                    <p className="text-xs md:text-sm">
                      クイズ中に挑戦した、あるいは正解した法律は自動的に「マイナー法律図鑑」に登録されます。図鑑では、デジタル庁提供の公式データベース「e-Gov法令検索」への直接アクセスURLとともに、詳細な法律の歴史や実態をいつでも復習することができます。
                    </p>
                  </div>
                </div>
              </div>

              {/* 閉じる */}
              <div className="flex justify-end border-t border-slate-100 pt-6" id="howto-footer">
                <button
                  onClick={() => setMode('title')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-sm"
                  id="howto-close-btn"
                >
                  分かりました
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* フッター */}
      {mode !== 'title' && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium animate-fade-in" id="global-footer">
          <p id="footer-text-content">
            日本のマイナー法律クイズ © 2026. すべての法令解説データはデジタル庁提供「e-Gov法令検索」に基づいてファクトチェックされています。
          </p>
        </footer>
      )}

      {/* 通知トースト (iFrame制限対応のカスタムアラート) */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-indigo-500/30 text-sm font-extrabold shrink-0"
            id="custom-toast-notification"
          >
            <span className="text-base animate-pulse">✨</span>
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
