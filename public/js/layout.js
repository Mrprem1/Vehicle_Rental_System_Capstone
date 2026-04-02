(function () {
  function renderNav() {
    const el = document.getElementById('site-nav');
    if (!el) return;
    const u = window.auth.user();
    const admin = u && u.role === 'admin';
    el.innerHTML = `
      <a href="index.html" class="logo">Ride<span>Hub</span></a>
      <nav class="nav-links" aria-label="Main">
        <a href="bikes.html">Bikes</a>
        ${u ? '<a href="my-bookings.html">My bookings</a>' : ''}
        ${u ? '<a href="profile.html">Profile</a>' : ''}
        ${admin ? '<a href="admin.html">Admin</a>' : ''}
        ${u ? '<button type="button" class="btn btn-secondary" id="btn-logout">Logout</button>' : '<a href="login.html" class="btn btn-primary">Login</a>'}
      </nav>
    `;
    const btn = document.getElementById('btn-logout');
    if (btn) {
      btn.addEventListener('click', () => {
        window.auth.clear();
        window.location.href = 'index.html';
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNav);
  } else {
    renderNav();
  }
})();
