<script>
  import Validator from "../Validator.svelte";

  function validator({ value }) {
    if (value === undefined || value === null) return true;
    switch (typeof value) {
      case "string":
        return value === "";
    }
    return false;
  }
</script>

<Validator {...$$props} name="required" fn={validator}>
  <slot>This Field is Required.</slot>
</Validator>
