// ==================================================================
//  STATE
// ==================================================================
const State = {
  emailRegex:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/,
  messages: {
    success: "Thanks for completing the form. We'll be in touch soon!",
    error: "Please fill out all required fields correctly.",
  },
};

// ==================================================================
//  UI - DOM + helpers
// ==================================================================
const UI = (() => {
  const submitBtn = document.getElementById("submit");
  const consentChk = document.getElementById("consent");
  const toastEl = document.getElementById("toast");
  const allInputs = document.querySelectorAll("input, textarea");
  const textInputs = document.querySelectorAll(
    "input[type='text'], input[type='email'], textarea",
  );

  // Verify that all elements exist
  if (
    !submitBtn ||
    !consentChk ||
    !toastEl ||
    !allInputs.length === 0 ||
    !textInputs.length === 0
  ) {
    throw new Error("Required DOM elements not found. Check your HTML IDs.");
  }

  return { submitBtn, consentChk, toastEl, allInputs, textInputs };
})();

// ==================================================================
//  FORM - Global logical (events)
// ==================================================================
const Form = (() => {
  const { submitBtn, allInputs } = UI;

  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (Validator.form()) Toast.show(State.messages.success);
  });

  // Real-time input management
  allInputs.forEach((el) => {
    const evt =
      el.type === "radio" || el.type === "checkbox" ? "change" : "input";
    el.addEventListener(evt, handleInput);
  });

  function handleInput(e) {
    const el = e.currentTarget;
    const fieldset = el.closest("fieldset");

    // Text - We remove the error
    if (el.classList.contains("invalid")) {
      el.classList.remove("invalid");
      el.setAttribute("aria-invalid", "false");
    }

    // Radio group – if at least one is selected, the fieldset is cleared
    if (el.type === "radio" && fieldset) {
      const radios = fieldset.querySelectorAll(`input[name="${el.name}"]`);
      if (Array.from(radios).some((r) => r.checked)) {
        fieldset.classList.remove("invalid");
      }
    }

    // Checkbox or radio button – the error is removed if checked
    if ((el.type === "radio" || el.type === "checkbox") && el.checked) {
      fieldset.classList.remove("invalid");
    }
  }

  return {};
})();

// ==================================================================
//  VALIDATOR - Validation functions
// ==================================================================
const Validator = (() => {
  const { textInputs, consentChk } = UI;

  // Add / remove error class and aria-invalid
  const setErrorState = (el, state) => {
    el.classList.toggle("invalid", state);
    el.setAttribute("aria-invalid", String(state));
  };

  // Wrapper to validate the entire form
  const form = () => {
    let ok = true;
    textInputs.forEach((el) => {
      if (!text(el)) ok = false;
    });

    if (!radio("queryType")) ok = false;
    if (!checkbox(consentChk)) ok = false;
    return ok;
  };

  // Text / email
  const text = (el) => {
    let valid = true;
    if (!el.value.trim()) valid = false;
    if (el.type === "email" && !State.emailRegex.test(el.value)) valid = false;

    if (!valid) {
      el.classList.add("invalid");
      el.setAttribute("aria-invalid", "true");
      return false;
    }

    el.classList.remove("invalid");
    el.setAttribute("aria-invalid", "false");
    return true;
  };

  // Radio
  const radio = (name) => {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    const fieldset = radios[0].closest("fieldset");
    const isChecked = Array.from(radios).some((r) => r.checked);

    if (!isChecked) {
      fieldset.classList.add("invalid");
      radios.forEach((r) => setErrorState(r, true));
      return false;
    }

    fieldset.classList.remove("invalid");
    radios.forEach((r) => setErrorState(r, false));
    return true;
  };

  // Checkbox
  const checkbox = (el) => {
    const fieldset = el.closest("fieldset");
    if (!el.checked) {
      fieldset.classList.add("invalid");
      setErrorState(el, true);
      return false;
    }

    fieldset.classList.remove("invalid");
    setErrorState(el, false);
    return true;
  };

  return { form, text, radio, checkbox };
})();

// ==================================================================
//  TOAST - Show / hide
// ==================================================================
const Toast = (() => {
  let hideTimer;
  const { toastEl } = UI;

  const show = (msg, duration = 5000) => {
    // If a timer is already active, cancel it.
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    if (msg) toastEl.querySelector(".toast-message").textContent = msg;
    toastEl.classList.remove("hidden");
    toastEl.classList.add("show");

    hideTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      toastEl.classList.add("hidden");
    }, duration);
  };

  return { show };
})();
