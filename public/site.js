document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

const pagePath=location.pathname;document.querySelectorAll('.site-header nav a').forEach(a=>{const u=new URL(a.href);if(u.pathname===pagePath&&pagePath.endsWith('.html')){a.classList.add('active');a.setAttribute('aria-current','page');}});
