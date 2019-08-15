<script>
  import Validator from "../Validator.svelte";

  export let max = null;

  if (typeof min === "string") max = Number(max);

  function validator({ value }) {
    switch (typeof value) {
      case "string":
        return value.length > max;
      case "number":
        return value > max;
      case "object":
        if (Array.isArray(value)) return value.length > max;
        return Object.keys(value).length > max;
    }
    return false;
  }
</script>

{#if max !== null}
  <Validator {...$$props} name="max" fn={validator}>
    <slot>Please enter in a maximum of {max}.</slot>
  </Validator>
{/if}
