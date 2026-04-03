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

    // 用 form 表单提交（最兼容 Google Apps Script 的方式）
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = TRACKER_URL;
    form.target = '_tracker_frame';
    form.style.display = 'none';

    // 创建隐藏 iframe 接收响应
    var iframe = document.createElement('iframe');
    iframe.name = '_tracker_frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // 把 payload 作为一个隐藏字段发送
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();

    // 清理
    setTimeout(function() {
      try {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      } catch(e) {}
    }, 5000);
  }

  // 尝试获取 IP（用支持 HTTPS 的免费 API）
  fetch('https://api.ipify.org?format=json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      sendData(data.ip, '', '', '');
    })
    .catch(function() {
      sendData('', '', '', '');
    });
})();
