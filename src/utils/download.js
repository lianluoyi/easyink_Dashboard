import { MessageBox } from 'element-ui';
/* eslint-disable no-magic-numbers */
// download.js v4.2, by dandavis  2008-2016. [CCBY2] see http://danml.com/download.html for tests/usage
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
// v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
// v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support. 3.1 improved safari handling.
// v4 adds AMD/UMD, commonJS, and plain browser support
// v4.1 adds url download capability via solo URL argument (same domain/CORS only)
// v4.2 adds semantic variable names, long (over 2MB) dataURL support, and hidden by default temp anchors
// https://github.com/rndme/download
// (function (DownLoad) {
// (function (root, factory) {
// 	if (typeof define === 'function' && define.amd) {
// 		// AMD. Register as an anonymous module.
// 		define([], factory)
// 	} else if (typeof exports === 'object') {
// 		// Node. Does not work with strict CommonJS, but
// 		// only CommonJS-like environments that support module.exports,
// 		// like Node.
// 		module.exports = factory()
// 	} else {
// 		// Browser globals (root is window)
// 		root.download = factory()
//   }
// }(this, function () {
// eslint-disable-next-line complexity
export const download = (data, strFileName, strMimeType) => {
  // return function download(data, strFileName, strMimeType) {
  const self = window;// this script is only for browsers anyway...
  const	defaultMime = 'application/octet-stream'; // this default mime also triggers iframe downloads
  let	mimeType = strMimeType || defaultMime;
  let	payload = data;
  const	url = !strFileName && !strMimeType && payload;
  const	anchor = document.createElement('a');
  const	toString = function(a) { return String(a); };
  let	MyBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString);
  let	fileName = strFileName || 'download';
  let	blob = '';
  let reader = '';
  MyBlob = MyBlob.call ? MyBlob.bind(self) : Blob;
  if (String(this) === 'true') { // reverse arguments, allowing download.bind(true, 'text/xml', 'export.xml') to act as a callback
    payload = [payload, mimeType];
    mimeType = payload[0];
    payload = payload[1];
  }
  if (url && url.length < 2048) { // if no filename and no mime, assume a url was passed as the only argument
    fileName = url.split('/').pop().split('?')[0];
    fileName = decodeURIComponent(fileName);
    anchor.href = url; // assign href prop to temp anchor
    // 有些路径在赋值给a标签时会转编码，导致下载内容变成路径
    // if (anchor.href.indexOf(url) !== -1) { // if the browser determines that it's a potentially valid url path:
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, true);
    ajax.responseType = 'blob';
    ajax.onload = function(e) {
      download(e.target.response, fileName, defaultMime);
    };
    setTimeout(function() {
      ajax.send();
    }, 0); // allows setting custom ajax headers using the return:
    return ajax;
    // } // end if valid url?
  } // end if url?
  // go ahead and download dataURLs right away
  if (/^data\:[\w+\-]+\/[\w+\-]+[, ]/.test(payload)) {
    if (payload.length > (1024 * 1024 * 1.999) && MyBlob !== toString) {
      payload = dataUrlToBlob(payload);
      mimeType = payload.type || defaultMime;
    } else {
      return navigator.msSaveBlob // IE10 can't do a[download], only Blobs:
        ? navigator.msSaveBlob(dataUrlToBlob(payload), fileName)
        : saver(payload); // everyone else can save dataURLs un-processed
    }
  }// end if dataURL passed?
  blob = payload instanceof MyBlob
    ? payload
    : new MyBlob([payload], { type: mimeType });
  function dataUrlToBlob(strUrl) {
    const parts = strUrl.split(/[: ,]/);
    const type = parts[1];
    const decoder = parts[2] === 'base64' ? atob : decodeURIComponent;
    const binData = decoder(parts.pop());
    const mx = binData.length;
    let i = 0;
    const uiArr = new Uint8Array(mx);
    for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);
    return new MyBlob([uiArr], { type: type });
  }
  function saver(saverUrl, winMode) {
    if ('download' in anchor) { // html5 A[download]
      anchor.href = saverUrl;
      anchor.setAttribute('download', fileName);
      anchor.className = 'download-js-link';
      anchor.innerHTML = 'downloading...';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      setTimeout(function() {
        anchor.click();
        document.body.removeChild(anchor);
        if (winMode === true) {
          setTimeout(function() {
            self.URL.revokeObjectURL(anchor.href);
          }, 250);
        }
      }, 66);
      return true;
    }
    // handle non-a[download] safari as best we can:
    if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
      saverUrl = saverUrl.replace(/^data:([\w\/\-\+]+)/, defaultMime);
      if (!window.open(saverUrl)) { // popup blocked, offer direct download:
        MessageBox.$confirm('Use Save As... to download, then click back to return to this page.', 'Displaying New Document', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          location.href = saverUrl;
        });
      }
      return true;
    }
    // do iframe dataURL download (old ch+FF):
    const f = document.createElement('iframe');
    document.body.appendChild(f);
    if (!winMode) { // force a mime that will download:
      saverUrl = 'data:' + saverUrl.replace(/^data:([\w\/\-\+]+)/, defaultMime);
    }
    f.src = saverUrl;
    setTimeout(function() { document.body.removeChild(f); }, 333);
  }// end saver
  if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
    return navigator.msSaveBlob(blob, fileName);
  }
  if (self.URL) { // simple fast and modern way using Blob and URL:
    saver(self.URL.createObjectURL(blob), true);
  } else {
    // handle non-Blob()+non-URL browsers:
    if (typeof blob === 'string' || blob.constructor === toString) {
      try {
        return saver('data:' + mimeType + ' base64,' + self.btoa(blob));
      } catch (y) {
        return saver('data:' + mimeType + ',' + encodeURIComponent(blob));
      }
    }
    // Blob but not URL support:
    reader = new FileReader();
    reader.onload = function() {
      saver(this.result);
    };
    reader.readAsDataURL(blob);
  }
  return true;
};
