<script>
  let { showModal = $bindable(), children } = $props();

  let dialog = $state(); // HTMLDialogElement

  $effect(() => {
    if (showModal) dialog.showModal();
  });
</script>

<dialog
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
  class="rounded-md bg-white dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed] my-auto mx-4 sm:mx-auto p-4 backdrop:bg-black backdrop:opacity-20 shadow-lg max-w-[90vw] sm:max-w-md w-full px-4"
>
  <div class="relative text-left">
    {@render children?.()}
    <!-- svelte-ignore a11y_autofocus -->
    <button
      autofocus
      aria-label="Close Modal"
      onclick={() => dialog.close()}
      class="cursor-pointer absolute right-0 top-0 dark:text-gray-300 bg-neutral-100 hover:ring-neutral-200 hover:ring focus:ring-neutral-200 focus:ring rounded-md font-medium text-lg p-2"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="size-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</dialog>