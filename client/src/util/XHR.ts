export type XHRMethod = "GET" | "POST";

export function XHR<TRequest, TResponse>(
  method: XHRMethod,
  url: string,
  params: TRequest
) {
  return new Promise<TResponse>((resolve, reject) => {
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
    xhr.send(JSON.stringify(params));
  });
}
