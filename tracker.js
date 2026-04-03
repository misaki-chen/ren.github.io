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

  function sendData(ip, city, region, country) {
    var payload = {
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      page: pageName,
      ip: ip || '',
      city: city || '',
      region: region || '',
      country: country || '',
      device: device,
      browser: browser,
      os: os,
      screen: screen.width + 'x' + screen.height,
      language: navigator.language,
      referrer: document.referrer || '直接访问',
    };

    // 用 sendBeacon（最可靠）或 fetch 发送
    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACKER_URL, body);
    } else {
      fetch(TRACKER_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: body,
      }).catch(function() {});
    }
  }

  // 尝试获取 IP（用 ip-api.com，免费无需注册）
  fetch('https://ip-api.com/json/?lang=zh-CN')
    .then(function(r) { return r.json(); })
    .then(function(geo) {
      sendData(geo.query, geo.city, geo.regionName, geo.country);
    })
    .catch(function() {
      // IP API 失败也发送基础信息
      sendData('', '', '', '');
    });
})();
