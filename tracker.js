/**
 * 访客追踪器 - 记录访客信息到 Google Sheets
 * v2026.04.03
 */
(function() {
  var TRACKER_URL = 'https://script.google.com/macros/s/AKfycbylXqKiqxI7yi2cy49i6xrO9-vuZYKn6McWo7wcoS9w2phAEegFLc13vhTOxN_UhscU/exec';
  if (!TRACKER_URL) return;

  // 解析 UA
  var ua = navigator.userAgent;
  var browser = 'Unknown', os = 'Unknown', device = 'Desktop';

  if (ua.includes('MicroMessenger')) browser = '微信';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'Tablet';

  var pageName = location.pathname.split('/').pop() || 'index.html';

  function sendData(ip) {
    var payload = {
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      page: pageName,
      ip: ip || '',
      city: '',
      region: '',
      country: '',
      device: device,
      browser: browser,
      os: os,
      screen: screen.width + 'x' + screen.height,
      language: navigator.language,
      referrer: document.referrer || '直接访问',
    };

    // 方法1: GET 请求（把数据编码到 URL 参数，Google Apps Script 最兼容的方式）
    var params = Object.keys(payload).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(payload[k]);
    }).join('&');

    var img = new Image();
    img.src = TRACKER_URL + '?' + params + '&_t=' + Date.now();
  }

  // 发送事件（按钮点击等）
  function trackEvent(action) {
    var payload = {
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      page: pageName,
      ip: window._trackerIp || '',
      city: '',
      region: '',
      country: '',
      device: device,
      browser: browser,
      os: os,
      screen: screen.width + 'x' + screen.height,
      language: navigator.language,
      referrer: action,  // 用 referrer 字段记录操作名称
    };
    var params = Object.keys(payload).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(payload[k]);
    }).join('&');
    var img = new Image();
    img.src = TRACKER_URL + '?' + params + '&_t=' + Date.now();
  }

  // 暴露全局方法供页面调用
  window.trackEvent = trackEvent;

  // 简单获取 IP
  fetch('https://api.ipify.org?format=json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      window._trackerIp = data.ip;
      sendData(data.ip);
    })
    .catch(function() { sendData(''); });
})();
