<script>
  import { getContext, setContext, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let formState = getContext("formState");
  export let preventDefault = true;
  export let submitWhenValid = true;

  if (!getContext("formState") && formState) setContext("formState", formState);
  if (!formState) throw new Error("formState is required");

  async function onChange(event) {
    if (!("form" in event.target)) return;
    const field = event.target.name;
    if (!field) {
      // console.warn("Change event fired but no field name found", event);
      return;
    }
    await formState.validate("change", field);
  }
  async function onBlur(event) {
    if (!("form" in event.target)) return;
    const field = event.target.name;
    if (!field) {
      // console.warn("Blur event fired but no field name found", event);
      return;
    }
    await formState.validate("blur", field);
  }
  async function onSubmit(event) {
    if (preventDefault) event.preventDefault();
    await formState.validate("submit");
    if (
      (submitWhenValid && !$formState.isValidating && !$formState.inError) ||
      !submitWhenValid
    ) {
      dispatch("submit", $formState);
    }
  }

  // TODO: Add hooks beforeValidation, afterValidation,
</script>

<div on:input={onChange} on:focusout={onBlur} on:submit={onSubmit}>
  <slot />
</div>
