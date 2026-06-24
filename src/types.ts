/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  title: string;
  question: string;
  type: 'four-choice' | 'true-false';
  choices: string[];
  answerIndex: number; // 0-based index
  lawName: string; // 法律名 (例: 「決闘罪ニ関スル件」)
  lawNo: string; // 法律番号 (例: 「明治22年法律第34号」)
  article: string; // 具体的な条・項・号 (例: 「第1条」)
  explanation: string; // 基本解説文 (URLやどの項に存在するのかも明記)
  egovUrl: string; // e-Govへの直接リンク
  genre: 'daily' | 'unusual' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserStats {
  score: number;
  highScore: number;
  correctAnswersCount: number;
  totalAnsweredCount: number;
  consecutiveCorrect: number; // 現在の連勝数
  maxConsecutiveCorrect: number; // 最高連勝数
  unlockedIds: string[]; // 図鑑で解放されたQuestionのID一覧
}

export type GameMode = 'title' | 'setup' | 'quiz' | 'result' | 'encyclopedia' | 'how-to';

export type GenreFilter = 'all' | 'daily' | 'unusual' | 'special';
export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
