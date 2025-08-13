import type { WordleBoard } from "./utils";

class Database {
  private db: Storage;

  constructor() {
    this.db = localStorage;
  }

  async getBoard(date: string): Promise<WordleBoard | null> {
    if(localStorage.getItem(date) === null) {
      return null;
    }
    const data = JSON.parse(localStorage.getItem(date) || '[]');
    if(!data || data.length != 6 || data[0].length != 5) {
      return null;
    }
    return data as WordleBoard;
  }

  async setBoard(date: string, board: WordleBoard): Promise<void> {
    this.db.setItem(date, JSON.stringify(board));
  }
}

export const db = new Database();