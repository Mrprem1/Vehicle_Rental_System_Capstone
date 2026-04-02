(function () {
  const API_BASE = '/api';

  async function request(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    let body = {};
    try {
      body = await res.json();
    } catch {
      body = {};
    }
    if (!res.ok) {
      const err = new Error(body.message || 'Request failed');
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  window.api = {
    request,
    get: (p) => request(p, { method: 'GET' }),
    post: (p, data) => request(p, { method: 'POST', body: JSON.stringify(data || {}) }),
    patch: (p, data) => request(p, { method: 'PATCH', body: JSON.stringify(data || {}) }),
    put: (p, data) => request(p, { method: 'PUT', body: JSON.stringify(data || {}) }),
    delete: (p) => request(p, { method: 'DELETE' }),
  };

  window.auth = {
    user: () => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        return null;
      }
    },
    setSession: (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    clear: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    isAdmin: () => auth.user()?.role === 'admin',
  };
})();
