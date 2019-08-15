<script>
  import {
    FormState,
    FieldControl,
    FormControl,
    Validator,
    fieldError
  } from "../../src";
  import { Required, Min, Max } from "../../src/validators";
  const formState = FormState();
  $: console.log(JSON.parse(JSON.stringify($formState)));

  function onSubmit() {
    console.log("Form Submitted.");
  }
</script>

<FormControl {formState} on:submit={onSubmit}>
  <form>
    <FieldControl for="test">
      <input type="text" name="test" bind:value={$formState.values.test} />
      <p>
        <Required for="test" event="submit" />
        <Min for="test" event="submit" min="10">
          Please enter at lest 10 characters.
        </Min>
        <Max for="test" event="submit" max="20">
          Please enter at most 20 characters.
        </Max>
      </p>
    </FieldControl>
    <FieldControl for="test2">
      <input type="number" name="test2" bind:value={$formState.values.test2} />
      <p>
        <Required for="test2" event="change" />
        <Min for="test2" event="change" min="10" />
        <Max for="test2" event="change" max="20" />
      </p>
    </FieldControl>
    <button type="submit">Submit</button>
    <p>
      Validating: {$formState.isValidating}
      <br />
      Error: {$formState.inError}
    </p>
  </form>
</FormControl>
