<script>
  import { getContext } from "svelte";

  export let formState = getContext("formState");
  let field;
  export { field as for };

  if (!formState) throw new Error("formState is required");
  if (!field) throw new Error("for is required");

  $: active = $formState.validating.includes(field);
</script>

{#if active}
  <slot />
{/if}
