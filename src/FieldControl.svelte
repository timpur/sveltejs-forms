<script>
  import { getContext, onMount, beforeUpdate } from "svelte";

  export let formState = getContext("formState");
  let field;
  export { field as for };
  export let show = true;

  if (!formState) throw new Error("formState is required");
  if (!field) throw new Error("for is required");

  let subscription;

  function subscribe() {
    if (!subscription) {
      subscription = formState.registerField(field);
    }
  }
  function unSubscribe() {
    if (subscription) {
      subscription();
      subscription = null;
    }
  }

  onMount(() => (subscribe(), unSubscribe));
  beforeUpdate(() => (show ? subscribe() : unSubscribe()));
</script>

{#if show}
  <slot />
{/if}
