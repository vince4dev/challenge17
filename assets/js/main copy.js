// ==================================================================
//  STATE
// ==================================================================
const State = {
  emailRegex:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/,
};

// ==================================================================
//  DOM (UI)
// ==================================================================
const UI = {
  submit: document.getElementById("submit"),
  textInputs: document.querySelectorAll(
    "input[type='text'], input[type='email'], textarea",
  ),
  checkConsent: document.querySelector("checkBox-input"),
  allInputs: document.querySelectorAll("input, textarea"),
  consentCheckbox: document.getElementById("consent"),
  toast: document.getElementById("toast"),
};

// Verify that all elements exist
if (!UI.submit) {
  throw new Error("Required DOM elements not found. Check your HTML IDs.");
}

// ==================================================================
//  CLICK SUBMIT
// ==================================================================
UI.submit.addEventListener("click", (e) => {
  e.preventDefault();

  let isValid = true;

  // Validation of text and email fields
  UI.textInputs.forEach((input) => {
    if (!validateTextGroup(input)) {
      isValid = false;
    }
  });

  // Validation of the radio group Query Type
  if (!validateRadioGroup("queryType")) isValid = false;

  // Validation Checkbox Consent
  if (!validateCheckbox(UI.consentCheckbox)) isValid = false;

  // If everything is valid
  if (isValid) {
    console.log("valid");
    showToast();
  }
});

// Validation Input Text
function validateTextGroup(input) {
  let valid = true;

  // Check if empty
  if (input.required && !input.value.trim()) {
    valid = false;
  }
  // Check email
  else if (input.type === "email") {
    if (!State.emailRegex.test(input.value)) {
      valid = false;
    }
  }

  if (!valid) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
  } else {
    input.classList.remove("invalid");
    input.setAttribute("aria-invalid", "false");
  }

  return valid;
}

// Validation Radios
function validateRadioGroup(name) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  const isChecked = Array.from(radios).some((r) => r.checked);
  const fieldset = radios[0].closest("fieldset");

  if (!isChecked) {
    // No radio station selected → error
    fieldset.classList.add("invalid");
    radios.forEach((r) => r.setAttribute("aria-invalid", "true"));
    return false;
  } else {
    // At least one radio selected → error removed
    fieldset.classList.remove("invalid");
    radios.forEach((r) => r.setAttribute("aria-invalid", "false"));
    return true;
  }
}

// Validation Checkbox
function validateCheckbox(checkbox) {
  const isChecked = checkbox.checked;
  const fieldset = checkbox.closest("fieldset");

  if (!isChecked) {
    // Checkbox non cochée → erreur
    fieldset.classList.add("invalid"); // votre CSS doit afficher .visible
    checkbox.setAttribute("aria-invalid", "true");
    return false;
  } else {
    // Checkbox cochée → on enlève l’erreur
    fieldset.classList.remove("invalid");
    checkbox.setAttribute("aria-invalid", "false");
    return true;
  }
}

UI.allInputs.forEach((el) => {
  const eventName =
    el.type === "radio" || el.type === "checkbox" ? "change" : "input";

  el.addEventListener(eventName, handleInput);
});

function handleInput(e) {
  const el = e.currentTarget;
  const fieldset = el.closest("fieldset");

  // Clear the error if the field becomes valid
  if (el.classList.contains("invalid")) {
    el.classList.remove("invalid");
    el.setAttribute("aria-invalid", "false");
  }

  // If it is a radio group field, we check whether the *fieldset* should remain invalid or not.
  if (el.type === "radio" && fieldset) {
    const radios = fieldset.querySelectorAll(`input[name="${el.name}"]`);
    const anyChecked = Array.from(radios).some((r) => r.checked);

    if (anyChecked) {
      fieldset.classList.remove("invalid");
      fieldset.setAttribute("aria-invalid", "false");
    }
  }

  // Managing the "checked" state for radio buttons/checkboxes
  if ((el.type === "radio" || el.type === "checkbox") && el.checked) {
    if (fieldset) {
      fieldset.classList.remove("invalid");
      fieldset.setAttribute("aria-invalid", "false");
    }
    el.classList.remove("invalid");
    el.setAttribute("aria-invalid", "false");
  }
}

// ==================================================================
//  MESSAGE TOAST
// ==================================================================
function showToast(message, duration = 5000) {
  // Change the text dynamically
  if (message) {
    const msgEl = toast.querySelector(".toast-message");
    if (msgEl) msgEl.textContent = message;
  }

  // We remove the .hidden class and add .show
  UI.toast.classList.remove("hidden");
  UI.toast.classList.add("show");

  // Après `duration` ms, on le masque à nouveau
  setTimeout(() => {
    UI.toast.classList.remove("show");
    UI.toast.classList.add("hidden");
  }, duration);
}
