<script lang="ts">
  import {
    getWordleAnswer,
    solveWordle,
    type CharType,
    type WordleBoard,
    typeToClass,
  } from "./utils";
  import Modal from "./Modal.svelte";
  import TimePagination from "./TimePagination.svelte";

  let type = $state<CharType>("correct");
  let currentSolution = $state<string | null>(null);
  let collapse = $state(false);
  let submitDisabled = $state(false);
  let showModal = $state(false);
  let solutionDate = $state<Date>(new Date());
  let board: WordleBoard = $state(
    Array.from({ length: 6 }, () =>
      Array.from({ length: 5 }, () => ({
        type: "absent" as CharType,
        char: " ",
      }))
    )
  );

  function clearBoard() {
    board = Array.from({ length: 6 }, () =>
      Array.from({ length: 5 }, () => ({
        type: "absent" as CharType,
        char: " ",
      }))
    );
  }

  function updateBoard(rId: number, cId: number, type: CharType) {
    const newBoard = board.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        rowIndex === rId && colIndex === cId ? { ...cell, type } : cell
      )
    );
    board = newBoard;
  }

  $effect(() => {
    const d = solutionDate;
    let cancelled = false;
    currentSolution = null;
    (async () => {
      try {
        const data = await getWordleAnswer(d);
        if (!cancelled) {
          if (data.success) {
            currentSolution = data.solution ?? null;
          } else {
            alert(data.error);
          }
        }
      } catch (error) {
        if (!cancelled) console.error("Error refreshing solution:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  async function handleSubmit() {
    submitDisabled = true;
    try {
      if (!currentSolution) {
        const data = await getWordleAnswer(solutionDate);
        if (data.success) {
          currentSolution = data.solution ?? null;
        } else {
          alert(data.error);
        }
      }
      if (currentSolution) board = solveWordle(board, currentSolution);
    } catch (error) {
      console.error("Error solving wordle: ", error);
    } finally {
      submitDisabled = false;
    }
  }

  function focusCell(row: number, col: number) {
    const cell = document.querySelector(
      `button[data-row="${row}"][data-col="${col}"]`
    );
    if (cell) {
      (cell as HTMLElement).focus();
    }
  }

  function handleHotkeys(e: KeyboardEvent) {
    let row: number | null = null;
    let col: number | null = null;
    const focusedCell = document.activeElement as HTMLElement;
    if (focusedCell && focusedCell.dataset.row && focusedCell.dataset.col) {
      row = parseInt(focusedCell.dataset.row);
      col = parseInt(focusedCell.dataset.col);
    }
    switch (e.key) {
      // solve board
      case "Enter":
        if (!submitDisabled) handleSubmit();
        break;
      // clear board
      case "x":
        clearBoard();
        break;
      // collapse/expand board
      case "c":
        collapse = !collapse;
        break;
      // correct (green)
      case "g":
        type = "correct";
        break;
      // present (yellow)
      case "y":
        type = "present";
        break;
      // absent (gray)
      case "b":
        type = "absent";
        break;
      // up
      case "w":
      case "ArrowUp":
        if (row !== null && col !== null) focusCell(row - (1 % 5), col);
        break;
      // down
      case "s":
      case "ArrowDown":
        if (row !== null && col !== null) focusCell(row + (1 % 5), col);
        break;
      // left
      case "a":
      case "ArrowLeft":
        if (row !== null && col !== null) focusCell(row, col - (1 % 4));
        break;
      // right
      case "d":
      case "ArrowRight":
        if (row !== null && col !== null) focusCell(row, col + (1 % 4));
        break;
      // focus first cell
      case "Home":
        focusCell(0, 0);
        break;
      // focus last cell
      case "End":
        focusCell(5, 4);
        break;
      case "h":
        showModal = true;
        break;
      default:
        break;
    }
  }

  const hotkeys = new Map<string[], string>([
    [["Enter"], "Solve Board"],
    [["Space"], "Color the Cell"],
    [["h"], "Show This Page"],
    [["x"], "Clear Board"],
    [["c"], "Collapse/Expand Board"],
    [["g"], "Choose Green Color (correct)"],
    [["y"], "Choose Yellow Color (present)"],
    [["b"], "Choose Gray Color (absent)"],
    [["w", "↑"], "Move Up"],
    [["s", "↓"], "Move Down"],
    [["a", "←"], "Move Left"],
    [["d", "→"], "Move Right"],
    [["Home"], "Focus First Cell"],
    [["End"], "Focus Last Cell"],
  ]);
</script>

<svelte:window
  on:keydown={handleHotkeys}
  on:keyup={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }}
/>
<TimePagination bind:date={solutionDate} />
<div class="font-nyt flex flex-col items-center justify-center w-full p-8 pt-0">
  <div
    class={`relative grid grid-cols-5 w-fit transition-all duration-300 ease ${collapse ? "gap-0" : "gap-1"}`}
  >
    {#each board as row, r}
      {#each row as cell, c}
        <button
          onclick={() => updateBoard(r, c, type)}
          data-row={r}
          data-col={c}
          class={`${typeToClass(cell.type)} cell cursor-pointer w-10 sm:w-13 h-10 sm:h-13 focus:z-50 focus:border-2 focus:outline-2 outline-offset-0 outline-black dark:outline-white border-0 focus:border-black dark:focus:border-white flex items-center justify-center font-bold text-[1.3rem] sm:text-[1.7rem] uppercase leading-4 text-[#f8f8f8]`}
        >
          {cell.char}
        </button>
        {#if r == 0 && c == 4}
          <button
            aria-label="Help"
            title="Help"
            onclick={() => (showModal = true)}
            class={`absolute ${collapse ? "left-51 sm:left-66" : "left-56 sm:left-70"} transition-[left] appearance-none cursor-pointer text-[#787c7e] hover:text-[#313334] dark:hover:text-gray-300 w-7 h-7 flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
          </button>
        {/if}
      {/each}
    {/each}
  </div>

  <div
    class="grid gap-1.5 grid-cols-4 w-fit items-center p-4 border-2 border-[#d3d6da] dark:border-[#3a3a3c] rounded-lg mt-8"
  >
    <label class="relative">
      <input
        type="radio"
        value="correct"
        name="type"
        bind:group={type}
        tabindex="0"
        title="Choose Green Color (correct)"
        class="cursor-pointer appearance-none font-bold text-[1.3rem] sm:text-[1.7rem] uppercase leading-4 bg-[#6aaa64] dark:bg-[#538d4e] w-10 sm:w-13 h-10 sm:h-13 checked:border-2 checked:outline-2 outline-offset-0 outline-black dark:outline-white border-0 checked:border-black dark:checked:border-white flex items-center justify-cente"
      />
      <span
        class="font-nyt text-[#f8f8f8] -mt-0.5 absolute inset-0 flex items-center justify-center font-bold text-[1.3rem] sm:text-[1.7rem] uppercase leading-4"
      >
        G
      </span>
    </label>
    <label class="relative">
      <input
        type="radio"
        value="present"
        name="type"
        bind:group={type}
        tabindex="0"
        title="Choose Yellow Color (present)"
        class="cursor-pointer appearance-none bg-[#c9b458] dark:bg-[#b59f3b] w-10 sm:w-13 h-10 sm:h-13 checked:border-2 checked:outline-2 outline-offset-0 outline-black dark:outline-white border-0 checked:border-black dark:checked:border-white flex items-center justify-center font-bold text-[1.3rem] sm:text-[1.7rem] uppercase leading-4"
      />
      <span
        class="font-nyt text-[#f8f8f8] -mt-0.5 absolute inset-0 flex items-center justify-center font-bold text-[1.3rem] sm:text-[1.7rem] uppercase leading-4"
      >
        Y
      </span>
    </label>
    <label class="relative">
      <input
        type="radio"
        value="absent"
        name="type"
        bind:group={type}
        tabindex="0"
        title="Choose Gray Color (absent)"
        class="cursor-pointer appearance-none bg-[#787c7e] dark:bg-[#3a3a3c] w-10 sm:w-13 h-10 sm:h-13 checked:border-2 checked:outline-2 outline-offset-0 outline-black dark:outline-white border-0 checked:border-black dark:checked:border-white flex items-center justify-center font-bold text-[1.3rem] sm:text-[1.7rem] uppercase leading-4"
      />
      <span
        class="font-nyt text-[#f8f8f8] -mt-0.5 absolute inset-0 flex items-center justify-center font-bold text-[1.3rem] sm:text-[1.7rem] uppercase leading-4"
      >
        B
      </span>
    </label>

    <label
      for="collapse"
      aria-label="Collapse/Expand Board"
      title="Collapse/Expand Board"
      class="focus-within:border-black dark:focus-within:border-white focus-within:border-2 cursor-pointer group w-10 sm:w-13 h-10 sm:h-13 border-2 border-[#d3d6da] dark:border-[#3a3a3c] text-[#787c7e] hover:text-[#313334] dark:hover:text-gray-300 flex items-center justify-center"
    >
      {#if !collapse}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 sm:size-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 sm:size-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      {/if}
      <input
        type="checkbox"
        id="collapse"
        name="collapse"
        bind:checked={collapse}
        class="sr-only"
      />
    </label>

    <button
      onclick={handleSubmit}
      disabled={submitDisabled}
      class="col-span-3 cursor-pointer font-medium text-lg text-white -ml-[1px] bg-[#5f995a] dark:bg-[#538d4e] dark:hover:bg-[#5f995a] hover:bg-[#558850] disabled:hover:bg-[#5f995a] disabled:cursor-not-allowed disabled:opacity-80 px-4 py-2 w-full h-full transition-colors duration-150 ease"
    >
      {submitDisabled ? "Solving..." : "Solve"}
    </button>

    <button
      aria-label="Clear Board"
      title="Clear Board"
      onclick={clearBoard}
      tabindex="0"
      class="appearance-none cursor-pointer text-[#787c7e] hover:text-[#313334] dark:hover:text-gray-300 border-2 border-[#d3d6da] dark:border-[#3a3a3c] w-10 sm:w-13 h-10 sm:h-13 flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    </button>
  </div>
</div>
<Modal bind:showModal>
  <h2 class="text-lg font-medium pt-1">Hotkeys</h2>
  <p class="mt-2">Use the following hotkeys to interact with the board:</p>
  <ul class="my-2">
    {#each Array.from(hotkeys.entries()) as [keys, description]}
      <li class="mt-1.5">
        {#each keys as key, i}
          <kbd
            class="font-mono px-2 mx-1 py-1 bg-[#f0f0f0] dark:bg-[#3a3a3c] shadow-[0_2px_0_rgba(0,0,0,0.1)] rounded-sm text-xs font-bold"
          >
            {key}
          </kbd>
          {#if i < keys.length - 1}/
          {/if}
        {/each}: {description}
      </li>
    {/each}
  </ul>
  <p
    class="mt-4 text-xs font-medium text-neutral-500 dark:text-zinc-400
    "
  >
    Press <kbd
      class="font-mono px-2 mx-1 py-1 bg-[#f0f0f0] dark:bg-[#3a3a3c] dark:text-[#f8f8f8] shadow-[0_2px_0_rgba(0,0,0,0.1)] rounded-sm text-xs font-bold"
      >Enter</kbd
    > to close this modal.
  </p>
</Modal>
