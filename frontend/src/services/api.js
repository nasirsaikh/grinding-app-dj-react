const API = "/api/";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export async function api(path, opts = {}) {
  const method = opts.method || "GET";

  const res = await fetch(API + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(method !== "GET" && {
        "X-CSRFToken": getCookie("csrftoken"),
      }),

      ...(opts.headers || {}),
    },
    ...opts,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export { API };