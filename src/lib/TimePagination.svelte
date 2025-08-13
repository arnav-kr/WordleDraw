<script lang="ts">
  let { date }: { date: Date } = $props();
  let disableNext = $state(false);

  $effect(() => {
    disableNext = new Date().toDateString() === date.toDateString();
  });
</script>

<nav class="w-full flex items-center gap-2 justify-center mt-3 mb-5">
  <button
    aria-label="Previous Date"
    onclick={() => (date = new Date(date.setDate(date.getDate() - 1)))}
    class="cursor-pointer dark:text-gray-300 bg-neutral-100 dark:bg-zinc-800 hover:ring-neutral-200 dark:hover:ring-zinc-700 hover:ring focus:ring-neutral-200 dark:focus:ring-zinc-700 focus:ring rounded-md font-medium text-lg p-2"
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="size-6"
    >
      <path
        fill-rule="evenodd"
        d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
  <div
    class="w-fit px-4 py-2 text-black dark:text-white rounded-md border-2 border-[#d3d6da] dark:border-[#3a3a3c]"
  >
    {date?.toLocaleDateString()}
  </div>
  <button
    aria-label="Next Date"
    disabled={disableNext}
    onclick={() => {
      let newDate = new Date(date.setDate(date.getDate() + 1))
      let tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      if(newDate > tomorrow) {
        date = tomorrow
      }
      else {
        date = newDate
      }
    }}
    class="cursor-pointer dark:text-gray-300 disabled:hover:ring-0 disabled:hover:border-0 disabled:opacity-65 bg-neutral-100 dark:bg-zinc-800 hover:ring-neutral-200 dark:hover:ring-zinc-700 hover:ring focus:ring-neutral-200 dark:focus:ring-zinc-700 focus:ring rounded-md font-medium text-lg p-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="size-6"
    >
      <path
        fill-rule="evenodd"
        d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</nav>
