const USERS_KEY = "authoraUsers";
const SESSION_KEY = "authoraSession";

/* =========================
   PAGE DETECTION
========================= */

const currentPage = window.location.pathname.split("/").pop() || "index.html";

/* =========================
   SHA-256 PASSWORD HASH
========================= */

async function hashPassword(password) {
  const encoder = new TextEncoder();

  const data = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/* =========================
   STORAGE HELPERS
========================= */

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* =========================
   REGISTER PAGE
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", handleRegistration);
}

async function handleRegistration(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("registerUsername");

  const emailInput = document.getElementById("registerEmail");

  const passwordInput = document.getElementById("registerPassword");

  const usernameError = document.getElementById("registerUsernameError");

  const emailError = document.getElementById("registerEmailError");

  const passwordError = document.getElementById("registerPasswordError");

  const message = document.getElementById("registerMessage");

  clearFieldErrors(usernameInput, emailInput, passwordInput);

  message.textContent = "";
  message.className = "form-message";

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  let hasError = false;

  /* Username validation */

  if (username === "") {
    usernameError.textContent = "Username is required.";

    usernameInput.classList.add("input-error");

    hasError = true;
  }

  /* Email validation */

  if (email === "") {
    emailError.textContent = "Email is required.";

    emailInput.classList.add("input-error");

    hasError = true;
  } else if (!isValidEmail(email)) {
    emailError.textContent = "Please enter a valid email.";

    emailInput.classList.add("input-error");

    hasError = true;
  }

  /* Password validation */

  if (password === "") {
    passwordError.textContent = "Password is required.";

    passwordInput.classList.add("input-error");

    hasError = true;
  } else if (password.length < 8) {
    passwordError.textContent = "Password must be at least 8 characters.";

    passwordInput.classList.add("input-error");

    hasError = true;
  } else if (!/\d/.test(password)) {
    passwordError.textContent = "Password must contain at least 1 number.";

    passwordInput.classList.add("input-error");

    hasError = true;
  }

  if (hasError) {
    return;
  }

  /* Duplicate check */

  const users = getUsers();

  const duplicateUser = users.some((user) => {
    return (
      user.username.toLowerCase() === username.toLowerCase() ||
      user.email.toLowerCase() === email
    );
  });

  if (duplicateUser) {
    message.textContent =
      "An account with this username or email already exists.";

    message.classList.add("error");

    return;
  }

  /* Hash password */

  const passwordHash = await hashPassword(password);

  /* Create user */

  const newUser = {
    id: Date.now(),
    username: username,
    email: email,
    passwordHash: passwordHash,
  };

  users.push(newUser);

  saveUsers(users);

  /* Success */

  message.textContent = "Account created successfully. Redirecting to login...";

  message.classList.add("success");

  registerForm.reset();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
}

/* =========================
   LOGIN PAGE
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

async function handleLogin(event) {
  event.preventDefault();

  const identifierInput = document.getElementById("loginIdentifier");

  const passwordInput = document.getElementById("loginPassword");

  const identifierError = document.getElementById("loginIdentifierError");

  const passwordError = document.getElementById("loginPasswordError");

  const message = document.getElementById("loginMessage");

  clearFieldErrors(identifierInput, passwordInput);

  message.textContent = "";
  message.className = "form-message";

  const identifier = identifierInput.value.trim();

  const password = passwordInput.value;

  let hasError = false;

  if (identifier === "") {
    identifierError.textContent = "Username or email is required.";

    identifierInput.classList.add("input-error");

    hasError = true;
  }

  if (password === "") {
    passwordError.textContent = "Password is required.";

    passwordInput.classList.add("input-error");

    hasError = true;
  }

  if (hasError) {
    return;
  }

  const users = getUsers();

  const passwordHash = await hashPassword(password);

  const user = users.find((item) => {
    const identifierMatch =
      item.username.toLowerCase() === identifier.toLowerCase() ||
      item.email.toLowerCase() === identifier.toLowerCase();

    const passwordMatch = item.passwordHash === passwordHash;

    return identifierMatch && passwordMatch;
  });

  if (!user) {
    /*
     * Same message for username/email/password
     * so we do not reveal which credential is wrong.
     */

    message.textContent = "Invalid username/email or password.";

    message.classList.add("error");

    return;
  }

  /* Create login session */

  const sessionUser = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  saveSession(sessionUser);

  message.textContent = "Login successful. Redirecting...";

  message.classList.add("success");

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 600);
}

/* =========================
   DASHBOARD PROTECTION
========================= */

if (currentPage === "dashboard.html") {
  const session = getSession();

  if (!session) {
    window.location.replace("index.html");
  } else {
    const usernameElement = document.getElementById("dashboardUsername");

    const emailElement = document.getElementById("dashboardEmail");

    if (usernameElement) {
      usernameElement.textContent = session.username;
    }

    if (emailElement) {
      emailElement.textContent = session.email;
    }
  }
}

/* =========================
   LOGOUT
========================= */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearSession();

    window.location.replace("index.html");
  });
}

/* =========================
   HELPERS
========================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearFieldErrors(...inputs) {
  inputs.forEach((input) => {
    if (input) {
      input.classList.remove("input-error");
    }
  });

  const errorElements = document.querySelectorAll(".field-error");

  errorElements.forEach((element) => {
    element.textContent = "";
  });
}
