import WORDS from "../assets/words.json";

export type CharType = "present" | "correct" | "absent";
export type WordleBoard = { type: CharType; char: string }[][];
export type WordleAPIResponse =
  | {
    success: true;
    id: number;
    solution: string;
    print_date: string;
    days_since_launch: number;
    editor: string;
  }
  | {
    success: false;
    error: string;
  };

export const getWordleAnswer = async (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const response = await fetch(`/api/wordle?date=${dateStr}`);
  const data: WordleAPIResponse = await response.json();
  return data;
};

export function typeToClass(type: CharType): string {
  switch (type) {
    case "correct": return "bg-[#6aaa64] dark:bg-[#538d4e]";
    case "present": return "bg-[#c9b458] dark:bg-[#b59f3b]";
    default: return "bg-[#787c7e] dark:bg-[#3a3a3c]";
  }
}

function compareWord(guess: string, answer: string): CharType[] {
  const result: CharType[] = Array(answer.length).fill("absent");
  const counts: { [key: string]: number } = {};

  for (const char of answer) {
    counts[char] = (counts[char] || 0) + 1;
  }

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
      counts[guess[i]]--;
    }
  }

  for (let i = 0; i < answer.length; i++) {
    if (result[i] === "correct") continue;

    const char = guess[i];
    if (counts[char] && counts[char] > 0) {
      result[i] = "present";
      counts[char]--;
    }
  }

  return result;
}

function isMatch(word: string, pattern: CharType[], answer: string): boolean {
  const res = compareWord(word, answer);
  return res.every((type, index) => type === pattern[index]);
}

export const solveWordle = (board: WordleBoard, answer: string): WordleBoard => {

  const newBoard: WordleBoard = board.map(row => row.map(cell => ({ ...cell })));

  for (let i = 0; i < newBoard.length; i++) {
    const row = newBoard[i];
    const pattern = row.map((cell) => cell.type);

    let found = false;
    for (const word of WORDS as string[]) {
      if (word.length !== 5) continue;

      if (isMatch(word, pattern, answer)) {
        for (let i = 0; i < row.length && i < word.length; i++) {
          row[i].char = word[i].toUpperCase()
        }
        found = true;
        break;
      }
    }

    if (!found) {
      for (let i = 0; i < row.length; i++) {
        row[i].char = "?";
      }
    }
  }

  return newBoard;
};