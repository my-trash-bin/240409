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

async function getSession() {
  const result = await API("GET", "/api/auth/session");
  console.log(result);
  return result;
}
