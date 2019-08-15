import { writable, derived } from "svelte/store";

const EVENTS = ["change", "blur", "submit"];

const normalizeError = error => (error === undefined ? null : error);
const isError = error => error !== undefined && error !== null;
const isValidating = validating => validating.length > 0;
const inError = errors =>
  EVENTS.reduce((res, key) => (res.push(...Object.keys(errors[key])), res), [])
    .length > 0;

export const fieldError = (errors, field) => {
  const error = EVENTS.map(key => errors[key][field]).find(isError);
  return isError(error) ? error : "";
};

export const FieldValidator = ({ fn, event, field }) => {
  if (!fn || typeof fn !== "function") throw new Error("fn is required");
  if (!event) throw new Error("event is required");
  if (!field) throw new Error("field is required");

  return {
    fn,
    field,
    event,
    count: 0
  };
};

export const FormValidator = ({ fn, event }) =>
  FieldValidator({ fn, event, field: "form" });

export const FormState = () => {
  const store = writable({
    values: {},
    errors: {
      change: {},
      blur: {},
      submit: {}
    },
    validating: [],
    fields: []
  });
  let $store;
  store.subscribe(state => ($store = state));
  const validators = [];
  const fieldCounter = { form: 0 };

  const registerField = field => {
    if (field === "form") throw new Error("Form is a reserved field name");
    store.update($store => {
      if ($store.fields.includes(field)) {
        throw new Error(
          `${field} has already been registered. Can not have duplicate fields.`
        );
      }
      fieldCounter[field] = 0;
      $store.fields.push(field);
      return $store;
    });
    return () => {
      store.update($store => {
        $store.fields.splice($store.fields.indexOf(field), 1);
        delete fieldCounter[field];
        return $store;
      });
    };
  };

  const registerValidator = validator => {
    validators.push(validator);
    return () => {
      validators.splice(validators.indexOf(validator), 1);
    };
  };

  const runValidation = async (event, field) => {
    const fieldValidators = validators.filter(
      validator => validator.event === event && validator.field === field
    );
    if (fieldValidators.length === 0) return;

    const count = ++fieldCounter[field];
    let hasSetValidating = false;
    let result = null;
    for (let validator of fieldValidators) {
      const props = {
        value: $store.values[field],
        field,
        event,
        state: $store.values
      };

      let maybeAsync = validator.fn(props);
      if (maybeAsync instanceof Promise) {
        if (!hasSetValidating) {
          store.update($store => {
            $store.validating.push(field);
            return $store;
          });
          hasSetValidating = true;
        }
        maybeAsync = await maybeAsync;
      }
      if (count !== fieldCounter[field]) {
        // Another validator for this field is running. This is no longer relevant.
        result = undefined; // Dont change the error
        break;
      }
      if (isError(maybeAsync)) {
        result = maybeAsync;
        break;
      }
    }

    const errorChanged =
      result !== undefined &&
      result !== normalizeError($store.errors[event][field]);
    if (hasSetValidating || errorChanged) {
      store.update($store => {
        if (hasSetValidating) {
          $store.validating.splice($store.validating.indexOf(field), 1);
        }
        if (errorChanged) {
          if (result === null) {
            delete $store.errors[event][field];
          } else {
            $store.errors[event][field] = result;
          }
        }
        return $store;
      });
    }

    return result;
  };

  const runFieldValidation = async (event, field) => {
    const eventsToRun = [];
    switch (event) {
      case "*":
      case "submit":
        eventsToRun.push("submit");
      case "blur":
        eventsToRun.push("blur");
      case "change":
        eventsToRun.push("change");
    }

    for (let eventToRun of eventsToRun.reverse()) {
      const result = await runValidation(eventToRun, field);
      if (isError(result)) return result;
    }
  };

  const runFormValidation = async event => runFieldValidation(event, "form");

  const validate = async (event, ...fields) => {
    const selectedFields =
      fields.length > 0
        ? $store.fields.filter(x => fields.includes(x))
        : $store.fields;
    const results = await Promise.all(
      selectedFields.map(field => runFieldValidation(event, field))
    );
    const inError = results.some(isError);
    if (!inError) {
      await runFormValidation(event);
    }
  };

  const state = derived(store, $store => ({
    ...$store,
    isValidating: isValidating($store.validating),
    inError: inError($store.errors)
  }));

  return {
    ...store,
    ...state,
    registerField,
    registerValidator,
    runValidation,
    runFieldValidation,
    runFormValidation,
    validate
  };
};
