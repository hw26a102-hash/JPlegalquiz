/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  ChevronRight, 
  Award, 
  RotateCcw, 
  Home, 
  BookOpen, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { Question, UserStats } from '../types';

interface QuizGameProps {
  questions: Question[];
  genre: string;
  difficulty: string;
  onHome: () => void;
  onViewEncyclopedia: () => void;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export default function QuizGame({
  questions,
  genre,
  difficulty,
  onHome,
  onViewEncyclopedia,
  stats,
  onUpdateStats
}: QuizGameProps) {
  // 選ばれたジャンルと難易度でフィルタリング
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // ゲームプレイ状態
  const [lives, setLives] = useState(3);
  const [currentScore, setCurrentScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxComboThisRun, setMaxComboThisRun] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // エフェクト用ステート
  const [shakeLives, setShakeLives] = useState(false);
  const [showComboAnim, setShowComboAnim] = useState(false);

  // 初期化
  useEffect(() => {
    let list = [...questions];
    if (genre !== 'all') {
      list = list.filter(q => q.genre === genre);
    }
    if (difficulty !== 'all') {
      list = list.filter(q => q.difficulty === difficulty);
    }
    
    // シャッフル（ゲームを毎回新鮮にするため）
    const shuffled = list.sort(() => Math.random() - 0.5);
    setFilteredQuestions(shuffled);
    
    // リセット
    setCurrentIdx(0);
    setLives(3);
    setCurrentScore(0);
    setCombo(0);
    setMaxComboThisRun(0);
    setGameOver(false);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [questions, genre, difficulty]);

  if (filteredQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" id="no-questions-container">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 animate-bounce" id="alert-icon" />
        <h3 className="text-xl font-bold text-gray-800 mb-2" id="no-q-title">該当する問題が見つかりません</h3>
        <p className="text-gray-600 mb-6 max-w-md" id="no-q-desc">
          選択されたジャンルと難易度の組み合わせに一致するクイズがありません。条件を変更してお試しください。
        </p>
        <button
          onClick={onHome}
          className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition duration-200 shadow-md flex items-center gap-2"
          id="back-home-btn"
        >
          <Home className="w-4 h-4" />
          メニューに戻る
        </button>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentIdx];

  // 解答判定
  const handleAnswerClick = (index: number) => {
    if (isAnswered || gameOver || quizFinished) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    const isCorrect = index === currentQuestion.answerIndex;
    
    // 図鑑の解放登録
    const newUnlocked = stats.unlockedIds.includes(currentQuestion.id)
      ? stats.unlockedIds
      : [...stats.unlockedIds, currentQuestion.id];
      
    if (isCorrect) {
      // スコア計算: 基本100点 + 連勝コンボボーナス (連勝数 * 20点)
      const comboBonus = combo * 20;
      const pointsEarned = 100 + comboBonus;
      const nextScore = currentScore + pointsEarned;
      const nextCombo = combo + 1;
      
      setCurrentScore(nextScore);
      setCombo(nextCombo);
      if (nextCombo > maxComboThisRun) {
        setMaxComboThisRun(nextCombo);
      }
      
      // 連勝アニメーション起動
      if (nextCombo >= 2) {
        setShowComboAnim(true);
        setTimeout(() => setShowComboAnim(false), 1200);
      }
      
      // グローバルスタッツ更新
      onUpdateStats({
        score: stats.score + pointsEarned,
        highScore: Math.max(stats.highScore, nextScore),
        correctAnswersCount: stats.correctAnswersCount + 1,
        totalAnsweredCount: stats.totalAnsweredCount + 1,
        consecutiveCorrect: nextCombo,
        maxConsecutiveCorrect: Math.max(stats.maxConsecutiveCorrect, nextCombo),
        unlockedIds: newUnlocked
      });
    } else {
      // 不正解
      setCombo(0);
      const nextLives = lives - 1;
      setLives(nextLives);
      setShakeLives(true);
      setTimeout(() => setShakeLives(false), 500);
      
      // グローバルスタッツ更新
      onUpdateStats({
        ...stats,
        totalAnsweredCount: stats.totalAnsweredCount + 1,
        consecutiveCorrect: 0,
        unlockedIds: newUnlocked // 間違えた問題も図鑑に登録して学べるようにする
      });

      if (nextLives <= 0) {
        // すぐゲームオーバーにせず、この問題の解説を見せた後にゲームオーバーに遷移させるため、フラグ管理
      }
    }
  };

  // 次へ進む
  const handleNext = () => {
    if (lives <= 0) {
      setGameOver(true);
      return;
    }

    if (currentIdx + 1 >= filteredQuestions.length) {
      setQuizFinished(true);
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  // ジャンル日本語表記
  const getGenreLabel = (g: string) => {
    switch (g) {
      case 'daily': return '日常生活・マナー';
      case 'unusual': return '珍法律・歴史';
      case 'special': return '特殊エリア・乗り物';
      default: return '法律';
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

  return (
    <div className="w-full max-w-3xl mx-auto" id="quiz-game-wrapper">
      {/* プレイ中UI */}
      {!gameOver && !quizFinished && (
        <div id="active-quiz-view">
          {/* 上部ステータスバー */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6" id="quiz-header">
            {/* 進捗と難易度 */}
            <div className="flex items-center gap-3" id="progress-info">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800" id="difficulty-badge">
                {getGenreLabel(currentQuestion.genre)} • {getDifficultyLabel(currentQuestion.difficulty)}
              </span>
              <span className="text-sm font-medium text-slate-500" id="progress-text">
                問題 {currentIdx + 1} / {filteredQuestions.length}
              </span>
            </div>

            {/* スコア・コンボ */}
            <div className="flex items-center gap-4" id="score-combo-lives">
              <div className="flex items-center gap-1.5" id="score-display">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-700">{currentScore} <span className="text-xs font-normal text-slate-400">pts</span></span>
              </div>

              {/* 連勝コンボ表示 */}
              <AnimatePresence mode="wait">
                {combo > 0 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-xs font-extrabold"
                    id="combo-display"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                    <span>{combo} 連勝!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ライフ表示 */}
              <motion.div 
                animate={shakeLives ? { x: [-6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1"
                id="lives-display"
              >
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-5 h-5 transition-all duration-300 ${
                      i < lives 
                        ? 'text-red-500 fill-red-500 scale-100' 
                        : 'text-slate-200 fill-slate-200 scale-90'
                    }`} 
                    id={`heart-icon-${i}`}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* 連勝ポップアップ演出 */}
          <AnimatePresence>
            {showComboAnim && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1.2 }}
                exit={{ opacity: 0, y: -40, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xl tracking-wider"
                id="combo-toast"
              >
                <Flame className="w-6 h-6 fill-white" />
                {combo}連勝ボーナス発生中！
              </motion.div>
            )}
          </AnimatePresence>

          {/* クイズカード */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden mb-6" id="quiz-card">
            {/* 進行状況プログレスバー */}
            <div className="w-full bg-slate-100 h-1.5" id="progress-bar-container">
              <div 
                className="bg-indigo-600 h-1.5 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / filteredQuestions.length) * 100}%` }}
                id="progress-bar-fill"
              />
            </div>

            <div className="p-6 md:p-8" id="quiz-card-content">
              {/* 問題タイトル */}
              <div className="flex items-center gap-2 mb-3 text-slate-500 text-xs font-semibold tracking-wider uppercase" id="q-title-header">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>主題: {currentQuestion.title}</span>
              </div>

              {/* 問題文 */}
              <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed mb-8" id="q-text">
                {currentQuestion.question}
              </h2>

              {/* 選択肢ボタン群 */}
              <div className="grid grid-cols-1 gap-4 mb-8" id="choices-grid">
                {currentQuestion.choices.map((choice, i) => {
                  let btnStyle = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800";
                  let icon = null;

                  if (isAnswered) {
                    if (i === currentQuestion.answerIndex) {
                      // 正解の選択肢
                      btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20";
                      icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
                    } else if (selectedAnswer === i) {
                      // ユーザーが選んで間違えた選択肢
                      btnStyle = "bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20";
                      icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
                    } else {
                      // それ以外の選択肢（回答後は不活性化）
                      btnStyle = "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleAnswerClick(i)}
                      className={`w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border text-left font-medium transition-all duration-200 text-base md:text-lg ${btnStyle} focus:outline-none`}
                      id={`choice-btn-${i}`}
                    >
                      <span>{choice}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* 回答後の解説エリア */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 rounded-2xl border mb-6 ${
                      selectedAnswer === currentQuestion.answerIndex
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                    id="explanation-area"
                  >
                    {/* 結果表示 */}
                    <div className="flex items-center gap-2.5 mb-4" id="answer-result-badge">
                      {selectedAnswer === currentQuestion.answerIndex ? (
                        <>
                          <div className="bg-emerald-500 text-white rounded-full p-1" id="correct-badge-icon">
                            <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                          </div>
                          <span className="text-lg font-black text-emerald-800" id="correct-text">正解！ (+100点{combo > 1 && ` + 連勝ボーナス ${ (combo - 1) * 20 }点`})</span>
                        </>
                      ) : (
                        <>
                          <div className="bg-rose-500 text-white rounded-full p-1" id="wrong-badge-icon">
                            <XCircle className="w-5 h-5 stroke-[3]" />
                          </div>
                          <span className="text-lg font-black text-rose-800" id="wrong-text">不正解！ (ライフ減少)</span>
                        </>
                      )}
                    </div>

                    {/* 正確な法令情報バッジ */}
                    <div className="flex flex-wrap gap-2 mb-4" id="law-info-badges">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-lg" id="law-name-badge">
                        法：{currentQuestion.lawName}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg" id="law-no-badge">
                        番号：{currentQuestion.lawNo}
                      </span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold rounded-lg" id="law-article-badge">
                        対象箇所：{currentQuestion.article}
                      </span>
                    </div>

                    {/* 解説本文 */}
                    <div className="text-slate-700 text-sm md:text-base leading-relaxed mb-6" id="explanation-text-body">
                      <p className="font-semibold text-slate-800 mb-1" id="explanation-title">📝 基本解説</p>
                      {currentQuestion.explanation}
                    </div>

                    {/* e-Govリンク (URLが完全に機能するよう厳格に実装) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" id="egov-link-box">
                      <div id="egov-link-text">
                        <p className="text-xs text-slate-400 font-medium" id="egov-source">出典：e-Gov 法令検索 (デジタル庁)</p>
                        <p className="text-xs font-bold text-slate-600 mt-0.5 truncate max-w-xs md:max-w-md" id="egov-law-ref">
                          {currentQuestion.lawName} {currentQuestion.article} 付近の条文
                        </p>
                      </div>
                      <a
                        href={currentQuestion.egovUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition duration-200 flex items-center gap-1.5 shadow-sm shrink-0"
                        id="egov-link-anchor"
                      >
                        e-Govで公式条文を確認
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* アクションボタン */}
              {isAnswered && (
                <div className="flex justify-end" id="action-btn-area">
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition duration-200 shadow-md flex items-center gap-1"
                    id="next-q-btn"
                  >
                    <span>{lives <= 0 ? '結果発表へ' : currentIdx + 1 >= filteredQuestions.length ? '結果発表へ' : '次の問題へ'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ゲームオーバー or クイズ終了（リザルト画面） */}
      {(gameOver || quizFinished) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center"
          id="quiz-result-view"
        >
          {gameOver ? (
            <div className="mb-6" id="gameover-header">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-200" id="gameover-icon-box">
                <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-rose-600" id="gameover-title">ゲームオーバー</h2>
              <p className="text-slate-500 mt-2" id="gameover-subtitle">ライフが尽きてしまいました。法律の壁は高かった！</p>
            </div>
          ) : (
            <div className="mb-6" id="success-header">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200" id="success-icon-box">
                <Award className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-indigo-900" id="success-title">クイズ完了！</h2>
              <p className="text-slate-500 mt-2" id="success-subtitle">全問題を走り抜けました。お見事です！</p>
            </div>
          )}

          {/* 今回の成果グリッド */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8" id="result-stats-grid">
            <div className="text-center" id="stat-score-box">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">獲得スコア</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{currentScore}</p>
            </div>
            <div className="text-center" id="stat-correct-box">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">正解数</p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {gameOver ? `${currentIdx} / ${filteredQuestions.length}` : `${filteredQuestions.length - (3 - lives)} / ${filteredQuestions.length}`}
              </p>
            </div>
            <div className="text-center" id="stat-combo-box">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">最大連勝</p>
              <p className="text-2xl font-black text-amber-600 mt-1 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                {maxComboThisRun}
              </p>
            </div>
            <div className="text-center" id="stat-unlock-box">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">図鑑登録数</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {stats.unlockedIds.length} <span className="text-xs text-slate-400 font-normal">/ {questions.length}</span>
              </p>
            </div>
          </div>

          {/* 図鑑への誘導メッセージ */}
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-left flex items-start gap-3 mb-8" id="encyclopedia-teaser">
            <BookOpen className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-indigo-900" id="teaser-title">新発見のマイナー法律が図鑑に登録されました！</p>
              <p className="text-xs text-indigo-700 mt-1" id="teaser-desc">
                解いた法律クイズは自動的に「マイナー法律図鑑」へ収集されます。e-Govの公式データベースから実際の条文、何項に書かれているのか、詳細なファクトをいつでも確認できます。
              </p>
            </div>
          </div>

          {/* アクションボタン群 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" id="result-actions">
            <button
              onClick={() => {
                // 同じ設定でリトライ
                let list = [...questions];
                if (genre !== 'all') {
                  list = list.filter(q => q.genre === genre);
                }
                if (difficulty !== 'all') {
                  list = list.filter(q => q.difficulty === difficulty);
                }
                const shuffled = list.sort(() => Math.random() - 0.5);
                setFilteredQuestions(shuffled);
                setCurrentIdx(0);
                setLives(3);
                setCurrentScore(0);
                setCombo(0);
                setMaxComboThisRun(0);
                setGameOver(false);
                setQuizFinished(false);
                setSelectedAnswer(null);
                setIsAnswered(false);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2"
              id="retry-btn"
            >
              <RotateCcw className="w-4 h-4" />
              もう一度挑戦
            </button>

            <button
              onClick={onViewEncyclopedia}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2"
              id="goto-encyclopedia-btn"
            >
              <BookOpen className="w-4 h-4" />
              図鑑を見る
            </button>

            <button
              onClick={onHome}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2"
              id="go-title-btn"
            >
              <Home className="w-4 h-4" />
              タイトルへ
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
