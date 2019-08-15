<script>
  import { getContext, onMount } from "svelte";
  import { FieldValidator } from "./core";

  export let formState = getContext("formState");
  export let name;
  export let fn;
  export let event = "submit";
  let field;
  export { field as for };
  export let message = null;

  if (!formState) throw new Error("formState is required");
  if (!field) throw new Error("for is required");
  if (!message && !name) throw new Error("name is required");
  if (!fn || typeof fn !== "function") throw new Error("fn is required");

  const _fn = (...args) => {
    const cb = res => {
      if (res) return message || name;
      return null;
    };
    const maybePromise = fn(...args);
    if (maybePromise instanceof Promise) {
      return maybePromise.then(cb);
    }
    return cb(maybePromise);
  };

  const validator = FieldValidator({ event, field, fn: _fn });

  $: active =
    !message &&
    $formState.fields.includes(field) &&
    $formState.errors[event][field] === name;

  onMount(() => formState.registerValidator(validator));
</script>

{#if active}
  <slot />
{/if}
