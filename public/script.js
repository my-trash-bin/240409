"use strict";

// @ts-check

/**
 * @param {"GET" | "POST"} method
 * @param {string} url
 * @param {any} [params]
 * @return {Promise<any>}
 */
function API(method, url, params) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = function () {
      reject(xhr.statusText);
    };
    xhr.send(params);
  });
}

/**
 * @returns {import('../src/JwtPayload').JwtPayload | null}
 */
async function getSession() {
  const result = await API("GET", "/api/auth/session");
  return result;
}

const escapeHtmlMap = { "<": "&lt;", ">": "&gt;", "&": "&amp;" };

/**
 * @param {string} input
 * @returns {string}
 */
function escapeHtml(input) {
  return input.replace(/<>&/, (toReplace) => escapeHtmlMap[toReplace]);
}

/**
 * @param {import('../src/JwtPayload').JwtPayload | null} session
 * @param {HTMLElement} container
 * @return {void}
 */
function displaySession(session, container) {
  if (!session) {
    container.innerHTML = "Not logged in";
    return;
  }
  switch (session.state.phase) {
    case "oauthOnly":
      container.innerHTML = `
        <div>
          OAuth authenticated, not registered. ID: ${session.state.id}
        </div>
      `;
      break;
    case "authenticated":
      container.innerHTML = `
        <div>
          Registered. ID: ${session.state.id},
          nickname: ${escapeHtml(session.state.nickname)}
        </div>
      `;
  }
}
