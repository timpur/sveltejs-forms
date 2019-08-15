<script>
  import Validator from "../Validator.svelte";

  export let min = null;

  if (typeof min === "string") min = Number(min);

  function validator({ value }) {
    switch (typeof value) {
      case "string":
        return value.length < min;
      case "number":
        return value < min;
      case "object":
        if (Array.isArray(value)) return value.length < min;
        return Object.keys(value).length < min;
    }
    return false;
  }
</script>

{#if min !== null}
  <Validator {...$$props} name="min" fn={validator}>
    <slot>Please enter in a minimum of {min}</slot>
  </Validator>
{/if}
