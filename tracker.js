/**
 * 访客追踪器
 * 记录访客信息到 Google Sheets（通过 Apps Script Web App）
 *
 * 配置方法：
 * 1. 新建一个 Google Sheet
 * 2. 打开 扩展程序 → Apps Script
 * 3. 粘贴下面的 Apps Script 代码，部署为 Web 应用
 * 4. 将部署 URL 填入下方 TRACKER_URL
 *
 * ===== Apps Script 代码（粘贴到 Google Apps Script）=====
 *
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = JSON.parse(e.postData.contents);
 *   sheet.appendRow([
 *     data.timestamp,
 *     data.page,
 *     data.ip,
 *     data.city,
 *     data.region,
 *     data.country,
 *     data.device,
 *     data.browser,
 *     data.os,
 *     data.screen,
 *     data.language,
 *     data.referrer
 *   ]);
 *   return ContentService.createTextOutput('ok');
 * }
 *
 * function doGet(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = sheet.getDataRange().getValues();
 *   // 返回最近100条
 *   var recent = data.slice(Math.max(1, data.length - 100));
 *   return ContentService.createTextOutput(JSON.stringify(recent))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 *
 * ========================================================
 *
 * v2026.04.03
 */
(function() {
  // ★★★ Google Apps Script Web App URL ★★★
  var TRACKER_URL = 'https://script.google.com/macros/s/AKfycbylXqKiqxI7yi2cy49i6xrO9-vuZYKn6McWo7wcoS9w2phAEegFLc13vhTOxN_UhscU/exec';

  // stats.html 也计入统计
  // 未配置则跳过
  if (!TRACKER_URL) return;

  // 解析 UA
  function parseUA(ua) {
    var browser = 'Unknown';
    var os = 'Unknown';
    var device = 'Desktop';

    // Browser
    if (ua.includes('MicroMessenger')) browser = '微信浏览器';
    else if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';

    // OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    // Device
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
    else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'Tablet';

    return { browser: browser, os: os, device: device };
  }

  var parsed = parseUA(navigator.userAgent);
  var pageName = location.pathname.split('/').pop() || 'index.html';

  // 获取 IP + 地理位置（免费 API）
  fetch('https://ipapi.co/json/')
    .then(function(r) { return r.json(); })
    .then(function(geo) {
      var payload = {
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        page: pageName,
        ip: geo.ip || '',
        city: geo.city || '',
        region: geo.region || '',
        country: geo.country_name || '',
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        screen: screen.width + 'x' + screen.height,
        language: navigator.language,
        referrer: document.referrer || '直接访问',
      };

      fetch(TRACKER_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      }).catch(function() {});
    })
    .catch(function() {
      // IP API 失败，仍然发送基础信息
      var payload = {
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        page: pageName,
        ip: '',
        city: '',
        region: '',
        country: '',
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        screen: screen.width + 'x' + screen.height,
        language: navigator.language,
        referrer: document.referrer || '直接访问',
      };

      fetch(TRACKER_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      }).catch(function() {});
    });
})();
