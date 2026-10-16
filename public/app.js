let currentLang = localStorage.getItem('appLanguage') || 'en';

// ==========================================================================
// EXCELLENCE SERVICES - DYNAMIC SERVICES & BLOG RENDERING
// ==========================================================================

let globalServicesData = [];
let globalBlogsData = [];
let globalLeadsData = [];

// Load and render public services & rates
async function loadAndRenderServices() {
    const grid = document.getElementById('public-services-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/services');
        if (res.ok) {
            globalServicesData = await res.json();
        }
    } catch (e) {
        console.warn("Could not fetch /api/services, using fallback", e);
    }

    if (!globalServicesData || globalServicesData.length === 0) {
        globalServicesData = [
            { id: 1, name: "SSP Scholarship Online Application (Karnataka)", category: "Scholarship", rate: "₹50 Only", turnAround: "Same Day", description: "Applicable for 1st-10th Class, PUC, Degree UG/PG with online tracking slip." },
            { id: 2, name: "Fresh Indian Passport Application", category: "Passport", rate: "₹500 / Filing", turnAround: "1-2 Days", description: "Online filing, document pre-screening & PSK appointment slot scheduling." },
            { id: 3, name: "Tatkaal Passport Urgent Application", category: "Passport", rate: "₹800 / Priority", turnAround: "Express / Same Day", description: "Emergency Tatkaal passport filing with priority PSK slot booking." },
            { id: 4, name: "Passport Name Spelling & DOB Correction", category: "Passport", rate: "₹400 / File", turnAround: "1-2 Days", description: "Official correction filing for spelling mismatch & Annexure-D affidavit formatting." },
            { id: 5, name: "Annexure-D / Annexure-E Legal Affidavit", category: "Legal Affidavit", rate: "₹250 / Notarized", turnAround: "Same Day (1 Hr)", description: "Notarized One & Same Person affidavit formatting for PSK submission." },
            { id: 6, name: "New PAN Card (Instant / Regular)", category: "PAN Card", rate: "₹150 / Doorstep", turnAround: "2-3 Days", description: "Fresh PAN card filing via NSDL/UTI with doorstep PVC card delivery." },
            { id: 7, name: "New Color PVC Digital Voter ID Card", category: "Voter ID", rate: "₹100 / High-Res", turnAround: "Same Day", description: "Convert old voter ID to high-quality digital color PVC card with QR code." },
            { id: 8, name: "Police Clearance Certificate (PCC) & Verification", category: "Police PCC", rate: "₹300 / Filing", turnAround: "1-2 Days", description: "Police verification form submission for Indian Passport & Overseas visa." }
        ];
    }

    const isRoman = (currentLang === 'roman');

    grid.innerHTML = globalServicesData.map(s => {
        let icon = '💼';
        const cat = (s.category || '').toLowerCase();
        let catColor = '#2563eb';

        if (cat.includes('passport')) { icon = '🛂'; catColor = '#2563eb'; }
        else if (cat.includes('scholarship')) { icon = '🎓'; catColor = '#10b981'; }
        else if (cat.includes('voter')) { icon = '💳'; catColor = '#6366f1'; }
        else if (cat.includes('pan')) { icon = '📄'; catColor = '#06b6d4'; }
        else if (cat.includes('police')) { icon = '👮'; catColor = '#8b5cf6'; }
        else if (cat.includes('affidavit') || cat.includes('legal')) { icon = '📑'; catColor = '#f59e0b'; }
        else if (cat.includes('visa')) { icon = '✈️'; catColor = '#ec4899'; }

        const cleanRate = s.rate && s.rate.toLowerCase().includes('call') ? (isRoman ? 'Call Karein' : 'Contact Us') : (s.rate || (isRoman ? 'Poochein' : 'Enquire'));
        const msg = encodeURIComponent("Namaste Hafiz Ramajan Sir! Main aapke portal par service dekh raha hu: \"" + s.name + "\". Mujhe is service ke baare me guidance aur booking karwani hai.");
        const bookText = isRoman ? "💬 WhatsApp Book" : "💬 Book on WhatsApp";

        return `
            <article class="modern-service-card animate-fade-in">
                <div class="service-card-top">
                    <span class="service-cat-badge" style="background: ${catColor}18; color: ${catColor}; border: 1px solid ${catColor}35;">
                        ${icon} ${s.category || 'Service'}
                    </span>
                    <span class="service-turnaround-badge">⏱️ ${s.turnAround || 'Same Day'}</span>
                </div>
                <h4 class="service-card-title">${s.name}</h4>
                <p class="service-card-desc">${s.description || ''}</p>
                <div class="service-card-bottom">
                    <span class="service-rate-pill">${cleanRate}</span>
                    <a href="https://wa.me/917849008882?text=${msg}" target="_blank" class="btn-service-book">
                        <span>${bookText}</span>
                    </a>
                </div>
            </article>
        `;
    }).join('');
}

// ==========================================================================
// EXCELLENCE SERVICES - NEWS, SCHEMES & BLOG MANAGER (REAL-TIME SYNC)
// ==========================================================================
let allNewsData = [];
let activeHomeCategory = 'all';
let currentHomeSearchQuery = '';
let activeNewsCategory = 'all';
let currentNewsSearchQuery = '';

// Helper to generate consistent, beautiful card HTML for both Home & Portal grids
function createBlogCardHtml(b, isRoman) {
    const hasImage = Boolean(b.image && typeof b.image === 'string' && b.image.trim() !== '' && !b.image.includes('passport-services-poster.jpg'));
    const readBtnText = isRoman ? "Puri Khabar Padhein" : "Read Full Article";
    const shareBtnText = isRoman ? "WhatsApp Share" : "Share on WhatsApp";
    const msg = encodeURIComponent("Namaste Hafiz Ramajan Sir! Maine aapke website par news/scheme dekhi: \"" + b.title + "\". Mujhe iske baare me jankari chahiye.");

    let catColor = '#2563eb';
    let catIcon = '📰';
    const cLower = ((b.category || '') + ' ' + (b.badge || '')).toLowerCase();
    if (cLower.includes('pass')) { catColor = '#2563eb'; catIcon = '🛂'; }
    else if (cLower.includes('schol')) { catColor = '#10b981'; catIcon = '🎓'; }
    else if (cLower.includes('vot')) { catColor = '#6366f1'; catIcon = '🗳️'; }
    else if (cLower.includes('pan')) { catColor = '#06b6d4'; catIcon = '💳'; }
    else if (cLower.includes('polic')) { catColor = '#8b5cf6'; catIcon = '👮'; }
    else if (cLower.includes('legal') || cLower.includes('aff')) { catColor = '#f59e0b'; catIcon = '📑'; }

    const mediaHtml = hasImage ? `
        <div class="portal-card-media" style="position: relative; height: 185px; overflow: hidden; background: #0f172a;">
            <img src="${b.image}" alt="${b.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" onerror="this.parentElement.style.display='none'">
            <span class="portal-media-badge" style="position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); color: ${catColor}; border: 1px solid ${catColor}50; padding: 4px 10px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                ${catIcon} ${b.category || b.badge || 'Govt Scheme'}
            </span>
            <span class="portal-date-tag" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.8); color: #e2e8f0; font-size: 0.74rem; font-weight: 600; padding: 3px 8px; border-radius: 6px;">
                🗓️ ${b.date || 'Active'}
            </span>
        </div>
    ` : `
        <div class="portal-card-no-media" style="padding: 16px 18px 4px 18px; display: flex; justify-content: space-between; align-items: center;">
            <span class="portal-media-badge" style="background: ${catColor}18; color: ${catColor}; border: 1px solid ${catColor}35; padding: 4px 12px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                ${catIcon} ${b.category || b.badge || 'Govt Scheme'}
            </span>
            <span class="portal-date-tag" style="color: var(--text-muted); font-size: 0.76rem; font-weight: 600;">
                🗓️ ${b.date || 'Active'}
            </span>
        </div>
    `;

    return `
        <article class="portal-news-card animate-fade-in" onclick="if(event.target.closest('a') || event.target.closest('button')) return; openArticleReader('${b.id}');">
            ${mediaHtml}
            <div class="portal-card-body" style="padding: 16px 18px; flex: 1; display: flex; flex-direction: column;">
                <h3 class="portal-card-title" style="margin: 0 0 8px 0; font-size: 1.05rem; font-weight: 800; color: var(--text-main); line-height: 1.4;">${b.title}</h3>
                <p class="portal-card-summary" style="margin: 0 0 14px 0; font-size: 0.86rem; color: var(--text-muted); line-height: 1.5; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${b.summary || ''}</p>
                <div class="portal-card-meta-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px; margin-bottom: 12px;">
                    <span class="portal-author-tag" style="color: #94a3b8; display: inline-flex; align-items: center; gap: 4px;">✍️ ${b.author || 'Hafiz Ramajan'}</span>
                    <span class="portal-status-verified" style="color: #34d399; font-weight: 700;">✓ Official</span>
                </div>
                <div class="portal-card-actions" style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openArticleReader('${b.id}')" style="flex: 1; font-weight: 700; font-size: 0.82rem; padding: 8px 10px;">
                        <span>📖 ${readBtnText}</span>
                    </button>
                    <a href="https://wa.me/917849008882?text=${msg}" target="_blank" class="btn btn-success btn-sm" title="Inquire on WhatsApp" style="flex: 1; font-weight: 700; font-size: 0.82rem; padding: 8px 10px; text-decoration: none; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>💬 ${shareBtnText}</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Master loader for Blogs & Schemes (Renders everywhere on website)
async function loadAndRenderBlogs() {
    try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
            allNewsData = await res.json();
        }
    } catch (e) {
        console.warn("Could not fetch /api/blogs, using fallback", e);
    }

    updateLiveAnnouncementTicker();
    renderHomeNewsGrid();
    renderPortalNewsGrid();
    setupHomeNewsInteractions();
    setupPortalNewsInteractions();
}

// Update Top Live Announcement Ticker Banner
function updateLiveAnnouncementTicker() {
    const ticker = document.getElementById('live-announcement-ticker');
    const tickerTitle = document.getElementById('ticker-post-title');
    const tickerViewBtn = document.getElementById('ticker-view-btn');
    if (!ticker || !tickerTitle) return;

    if (allNewsData && allNewsData.length > 0) {
        const latest = allNewsData[0];
        const cat = latest.category || latest.badge || 'Official Notice';
        tickerTitle.textContent = `[${cat}] ${latest.title}`;
        ticker.style.display = 'flex';
        if (tickerViewBtn) {
            tickerViewBtn.onclick = () => openArticleReader(latest.id);
        }
    } else {
        ticker.style.display = 'none';
    }
}

// Render Featured Updates on Website Front Page (#home-news-grid)
function renderHomeNewsGrid() {
    const grid = document.getElementById('home-news-grid');
    if (!grid) return;

    const q = (currentHomeSearchQuery || '').toLowerCase().trim();
    const cat = (activeHomeCategory || 'all').toLowerCase();

    let list = allNewsData || [];

    // Filter by Category
    if (cat !== 'all') {
        list = list.filter(b => {
            const bCat = (b.category || '').toLowerCase();
            const bBadge = (b.badge || '').toLowerCase();
            return bCat.includes(cat) || cat.includes(bCat) || bBadge.includes(cat);
        });
    }

    // Filter by Search Query
    if (q) {
        list = list.filter(b => 
            (b.title || '').toLowerCase().includes(q) ||
            (b.summary || '').toLowerCase().includes(q) ||
            (b.content || '').toLowerCase().includes(q) ||
            (b.category || '').toLowerCase().includes(q)
        );
    }

    if (list.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: rgba(255,255,255,0.02); border: 1px dashed var(--glass-border); border-radius: 14px;">
                <span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">📭</span>
                <strong style="color: var(--text-main); font-size: 1.05rem; display: block;">Koi news ya update nahi mila.</strong>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">Search query badal kar dekhein ya 'All Updates' category select karein.</p>
            </div>
        `;
        return;
    }

    const isRoman = (currentLang === 'roman');
    grid.innerHTML = list.map(b => createBlogCardHtml(b, isRoman)).join('');
}

// Render Updates in Dedicated News Portal Tab (#portal-news-grid)
function renderPortalNewsGrid() {
    const grid = document.getElementById('portal-news-grid');
    if (!grid) return;

    const q = (currentNewsSearchQuery || '').toLowerCase().trim();
    const cat = (activeNewsCategory || 'all').toLowerCase();

    let list = allNewsData || [];

    if (cat !== 'all') {
        list = list.filter(b => {
            const bCat = (b.category || '').toLowerCase();
            const bBadge = (b.badge || '').toLowerCase();
            return bCat.includes(cat) || cat.includes(bCat) || bBadge.includes(cat);
        });
    }

    if (q) {
        list = list.filter(b => 
            (b.title || '').toLowerCase().includes(q) ||
            (b.summary || '').toLowerCase().includes(q) ||
            (b.content || '').toLowerCase().includes(q) ||
            (b.category || '').toLowerCase().includes(q)
        );
    }

    if (list.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(255,255,255,0.02); border: 1px dashed var(--glass-border); border-radius: 14px;">
                <span style="font-size: 2.4rem; display: block; margin-bottom: 8px;">📭</span>
                <strong style="color: var(--text-main); font-size: 1.1rem; display: block;">Koi news ya update nahi mila.</strong>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">Search query badal kar dekhein ya 'All Updates' category select karein.</p>
            </div>
        `;
        return;
    }

    const isRoman = (currentLang === 'roman');
    grid.innerHTML = list.map(b => createBlogCardHtml(b, isRoman)).join('');
}

// Setup Event Listeners for Home Updates Section
function setupHomeNewsInteractions() {
    const searchInput = document.getElementById('home-news-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            currentHomeSearchQuery = e.target.value;
            renderHomeNewsGrid();
        };
    }

    const pills = document.querySelectorAll('#home-category-pills .cat-pill');
    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeHomeCategory = pill.dataset.category || 'all';
            renderHomeNewsGrid();
        };
    });
}

// Setup Event Listeners for Dedicated News Portal
function setupPortalNewsInteractions() {
    const searchInput = document.getElementById('portal-news-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            currentNewsSearchQuery = e.target.value;
            renderPortalNewsGrid();
        };
    }

    const pills = document.querySelectorAll('#news-category-pills .cat-pill');
    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeNewsCategory = pill.dataset.category || 'all';
            renderPortalNewsGrid();
        };
    });

    const closeBtn = document.getElementById('close-article-reader-modal');
    if (closeBtn) {
        closeBtn.onclick = closeArticleReader;
    }
    const modal = document.getElementById('article-reader-modal');
    if (modal) {
        modal.onclick = (e) => {
            if (e.target.id === 'article-reader-modal') closeArticleReader();
        };
    }
}

function openArticleReader(blogId) {
    const post = allNewsData.find(b => String(b.id) === String(blogId));
    if (!post) return;

    const modal = document.getElementById('article-reader-modal');
    if (!modal) return;

    const titleEl = document.getElementById('reader-title');
    const badgeEl = document.getElementById('reader-badge');
    const catCrumb = document.getElementById('reader-cat-crumb');
    const dateEl = document.getElementById('reader-date');
    const authorEl = document.getElementById('reader-author');
    const imgEl = document.getElementById('reader-featured-img');
    const sumEl = document.getElementById('reader-summary-text');
    const contentEl = document.getElementById('reader-content-text');
    const waCta = document.getElementById('reader-wa-cta');

    if (titleEl) titleEl.textContent = post.title;
    if (badgeEl) badgeEl.textContent = post.category || 'Notice';
    if (catCrumb) catCrumb.textContent = post.category || 'Government Scheme';
    if (dateEl) dateEl.textContent = post.date || 'Active';
    if (authorEl) authorEl.textContent = post.author || 'Hafiz Ramajan';
    
    const imgWrap = document.getElementById('reader-img-wrap');
    const hasImage = Boolean(post.image && typeof post.image === 'string' && post.image.trim() !== '' && !post.image.includes('passport-services-poster.jpg'));
    if (hasImage) {
        if (imgEl) imgEl.src = post.image;
        if (imgWrap) imgWrap.style.display = 'block';
    } else {
        if (imgWrap) imgWrap.style.display = 'none';
        if (imgEl) imgEl.src = '';
    }

    if (sumEl) sumEl.textContent = post.summary || '';

    if (contentEl) {
        const rawContent = post.content || post.summary || '';
        const paras = rawContent.split('\n').filter(p => p.trim() !== '');
        contentEl.innerHTML = paras.map(p => `<p style="margin-bottom: 12px; line-height: 1.6; font-size: 0.94rem;">${p}</p>`).join('');
    }

    if (waCta) {
        const msg = encodeURIComponent("Namaste Hafiz Ramajan Sir! Maine aapke portal par news/scheme dekhi: \"" + post.title + "\". Mujhe iske documents filing aur service ke baare me jankari chahiye.");
        waCta.href = "https://wa.me/917849008882?text=" + msg;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
}
window.openArticleReader = openArticleReader;

function closeArticleReader() {
    const modal = document.getElementById('article-reader-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
}
window.closeArticleReader = closeArticleReader;


// ==========================================================================
// EXCELLENCE SERVICES - ADMIN PORTAL (HAFIZ RAMAJAN DASHBOARD)
// ==========================================================================

function initAdminPortal() {
    const triggerBtn = document.getElementById('admin-portal-btn');
    const modal = document.getElementById('admin-portal-modal');
    const loginView = document.getElementById('admin-login-view');
    const dashView = document.getElementById('admin-dashboard-view');
    const closeBtn = document.getElementById('admin-close-modal-btn');
    const cancelLoginBtn = document.getElementById('admin-login-cancel-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const refreshBtn = document.getElementById('admin-refresh-btn');

    const openModal = () => {
        if (!modal) return;
        modal.classList.remove('hidden');
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            loginView.classList.add('hidden');
            dashView.classList.remove('hidden');
            loadAdminDashboard();
        } else {
            loginView.classList.remove('hidden');
            dashView.classList.add('hidden');
            document.getElementById('admin-passcode-input').value = '';
            document.getElementById('admin-passcode-input').focus();
        }
    };

    const closeModal = () => {
        if (modal) modal.classList.add('hidden');
    };

    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', closeModal);

    // Login Form Submit
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pass = document.getElementById('admin-passcode-input').value.trim();
            const errEl = document.getElementById('admin-login-error');

            try {
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: pass })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    sessionStorage.setItem('adminToken', data.token || 'auth-admin');
                    errEl.classList.add('hidden');
                    loginView.classList.add('hidden');
                    dashView.classList.remove('hidden');
                    loadAdminDashboard();
                } else {
                    errEl.textContent = data.error || "Password galat hai!";
                    errEl.classList.remove('hidden');
                }
            } catch (err) {
                // Fallback client password check
                errEl.textContent = 'Galat Password! Access Denied.'; errEl.classList.remove('hidden'); }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminToken');
            loginView.classList.remove('hidden');
            dashView.classList.add('hidden');
            document.getElementById('admin-passcode-input').value = '';
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAdminDashboard();
            loadAndRenderServices();
            loadAndRenderBlogs();
        });
    }

    // Tab Switcher
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            const targetEl = document.getElementById(targetTab);
            if (targetEl) targetEl.classList.add('active');
        });
    });

    setupAdminServicesCrud();
    setupAdminBlogsCrud();
    setupAdminLeadsCrm();
}

// Load KPIs and Dashboard Data
async function loadAdminDashboard() {
    try {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('kpi-total-verifications').textContent = stats.totalVerifications || 0;
            document.getElementById('kpi-total-mismatches').textContent = stats.totalMismatches || 0;
            document.getElementById('kpi-total-services').textContent = stats.totalServices || 0;
            document.getElementById('kpi-total-blogs').textContent = stats.totalBlogs || 0;
        }
    } catch (e) {
        console.warn("Could not fetch stats:", e);
    }

    loadAdminLeadsTable();
    loadAdminServicesTable();
    loadAdminBlogsTable();
}

// ==========================================================================
// TAB 1: USER VERIFICATION LEADS & CRM
// ==========================================================================

async function loadAdminLeadsTable() {
    const tbody = document.getElementById('admin-leads-table-body');
    if (!tbody) return;

    try {
        const res = await fetch('/api/logs');
        if (res.ok) {
            globalLeadsData = await res.json();
        }
    } catch (e) {
        console.warn("Error fetching logs:", e);
    }

    const countEl = document.getElementById('tab-leads-count');
    if (countEl) countEl.textContent = globalLeadsData.length;

    renderLeadsRows(globalLeadsData);
}

function renderLeadsRows(leads) {
    const tbody = document.getElementById('admin-leads-table-body');
    if (!tbody) return;

    if (!leads || leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Abhi tak koi user verification log nahi hai. Jab visitor website par verify karega, yahan lead dikhegi!</td></tr>';
        return;
    }

    tbody.innerHTML = leads.map(l => {
        const docsList = Array.isArray(l.documentsVerified) ? l.documentsVerified.join(', ') : (l.documentsVerified || 'Documents');
        const statusClass = l.hasMismatch ? 'mismatch' : 'match';
        const statusBadge = l.hasMismatch ? 
            `<span class="status-badge mismatch">⚠️ Mismatch (${l.mismatchCount || 1})</span>` : 
            `<span class="status-badge match">✓ 100% Match</span>`;

        // WhatsApp direct message to applicant
        const appName = l.applicantName || 'Sir/Madam';
        const waMsg = l.hasMismatch ? 
            encodeURIComponent(`Namaste ${appName}! Main Hafiz Ramajan (Excellence Services, Raibag) bol raha hu. Humne dekha aapka passport document verification me mismatch aaya tha. Agar aapko Name/DOB correction ya Annexure-D affidavit karwana hai to hum karke de sakte hain.`) :
            encodeURIComponent(`Namaste ${appName}! Main Hafiz Ramajan (Excellence Services, Raibag) bol raha hu. Aapke sabhi documents 100% match verify ho gaye the. Fresh ya Tatkaal Passport file apply karwane ke liye hum se sampark karein.`);

        return `
            <tr>
                <td><strong>${appName}</strong></td>
                <td style="font-size: 0.82rem; color: var(--text-muted);">${docsList}</td>
                <td>${statusBadge}</td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${l.timestamp || 'N/A'}</td>
                <td>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <a href="https://wa.me/917849008882?text=${waMsg}" target="_blank" class="btn btn-sm btn-success" style="padding: 5px 10px; font-size: 0.78rem;" title="Applicant ko WhatsApp par contact karein">
                            💬 WhatsApp Chat
                        </a>
                        <button onclick="deleteLeadLog('${l.id}')" class="btn btn-sm btn-danger" style="padding: 5px 8px; font-size: 0.78rem;" title="Log delete karein">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.deleteLeadLog = async function(id) {
    if (!confirm("Kya aap is verification lead ko delete karna chahte hain?")) return;
    try {
        await fetch('/api/logs/' + id, { method: 'DELETE' });
        loadAdminLeadsTable();
        loadAdminDashboard();
    } catch (e) {
        console.error("Delete error:", e);
    }
};

function setupAdminLeadsCrm() {
    const searchInput = document.getElementById('leads-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = globalLeadsData.filter(l => 
                (l.applicantName || '').toLowerCase().includes(q) ||
                (l.status || '').toLowerCase().includes(q)
            );
            renderLeadsRows(filtered);
        });
    }

    const clearAllBtn = document.getElementById('clear-all-leads-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', async () => {
            if (confirm("Kya aap saari verification history delete karna chahte hain?")) {
                await fetch('/api/logs/all', { method: 'DELETE' });
                loadAdminLeadsTable();
                loadAdminDashboard();
            }
        });
    }

    const exportCsvBtn = document.getElementById('export-leads-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            if (!globalLeadsData || globalLeadsData.length === 0) {
                alert("Koi lead data nahi hai export karne ke liye.");
                return;
            }
            let csv = "Applicant Name,Documents,Status,Timestamp\n";
            globalLeadsData.forEach(l => {
                const docs = Array.isArray(l.documentsVerified) ? l.documentsVerified.join('; ') : l.documentsVerified;
                csv += '"' + l.applicantName + '","' + docs + '","' + l.status + '","' + l.timestamp + '"\n';
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Excellence_Services_Verification_Leads_${Date.now()}.csv`;
            a.click();
        });
    }
}

// ==========================================================================
// TAB 2: SERVICES & RATES MANAGER
// ==========================================================================

async function loadAdminServicesTable() {
    const tbody = document.getElementById('admin-services-table-body');
    if (!tbody) return;

    try {
        const res = await fetch('/api/services');
        if (res.ok) {
            globalServicesData = await res.json();
        }
    } catch (e) {
        console.warn("Error fetching services:", e);
    }

    tbody.innerHTML = globalServicesData.map(s => {
        return `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td><span class="status-badge ignored">${s.category || 'General'}</span></td>
                <td><strong style="color: #34d399;">${s.rate || 'Enquire'}</strong></td>
                <td style="font-size: 0.82rem; color: var(--text-muted);">${s.turnAround || 'Normal'}</td>
                <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 250px;">${s.description || '--'}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="editServiceItem('${s.id}')" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 0.78rem;">✏️ Edit</button>
                        <button onclick="deleteServiceItem('${s.id}')" class="btn btn-sm btn-danger" style="padding: 4px 8px; font-size: 0.78rem;">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupAdminServicesCrud() {
    const openFormBtn = document.getElementById('open-add-service-form-btn');
    const formCard = document.getElementById('service-form-card');
    const cancelBtn = document.getElementById('service-form-cancel-btn');
    const saveBtn = document.getElementById('service-form-save-btn');

    if (openFormBtn) {
        openFormBtn.addEventListener('click', () => {
            document.getElementById('service-edit-id').value = '';
            document.getElementById('service-edit-name').value = '';
            document.getElementById('service-edit-category').value = '';
            document.getElementById('service-edit-rate').value = '';
            document.getElementById('service-edit-time').value = '';
            document.getElementById('service-edit-desc').value = '';
            document.getElementById('service-form-title').textContent = '➕ Add New Service to Rate Card';
            formCard.classList.remove('hidden');
            document.getElementById('service-edit-name').focus();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => formCard.classList.add('hidden'));
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const id = document.getElementById('service-edit-id').value;
            const name = document.getElementById('service-edit-name').value.trim();
            const category = document.getElementById('service-edit-category').value.trim();
            const rate = document.getElementById('service-edit-rate').value.trim();
            const turnAround = document.getElementById('service-edit-time').value.trim();
            const description = document.getElementById('service-edit-desc').value.trim();

            if (!name || !rate) {
                alert("Service Name aur Rate (Fees) likhna zaroori hai!");
                return;
            }

            try {
                const res = await fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name, category, rate, turnAround, description })
                });
                if (res.ok) {
                    formCard.classList.add('hidden');
                    loadAdminServicesTable();
                    loadAndRenderServices();
                    loadAdminDashboard();
                    alert("Service kamyabi se save ho gayi!");
                }
            } catch (e) {
                console.error("Save service error:", e);
            }
        });
    }
}

window.editServiceItem = function(id) {
    const s = globalServicesData.find(item => String(item.id) === String(id));
    if (!s) return;

    const formCard = document.getElementById('service-form-card');
    document.getElementById('service-edit-id').value = s.id;
    document.getElementById('service-edit-name').value = s.name || '';
    document.getElementById('service-edit-category').value = s.category || '';
    document.getElementById('service-edit-rate').value = s.rate || '';
    document.getElementById('service-edit-time').value = s.turnAround || '';
    document.getElementById('service-edit-desc').value = s.description || '';
    document.getElementById('service-form-title').textContent = '✏️ Edit Service: ' + s.name;
    formCard.classList.remove('hidden');
    formCard.scrollIntoView({ behavior: 'smooth' });
};

window.deleteServiceItem = async function(id) {
    if (!confirm("Kya aap is service ko delete karna chahte hain?")) return;
    try {
        await fetch('/api/services/' + id, { method: 'DELETE' });
        loadAdminServicesTable();
        loadAndRenderServices();
        loadAdminDashboard();
    } catch (e) {
        console.error("Delete error:", e);
    }
};

// ==========================================================================
// TAB 3: BLOG & UPDATES MANAGER
// ==========================================================================

async function loadAdminBlogsTable() {
    const tbody = document.getElementById('admin-blogs-table-body');
    if (!tbody) return;

    try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
            globalBlogsData = await res.json();
        }
    } catch (e) {
        console.warn("Error fetching blogs:", e);
    }

    tbody.innerHTML = globalBlogsData.map(b => {
        return `
            <tr>
                <td><strong>${b.title}</strong></td>
                <td><span class="status-badge ignored">${b.category || 'General'}</span></td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${b.date || 'Today'}</td>
                <td style="font-size: 0.82rem; color: var(--text-muted); max-width: 280px;">${b.summary || ''}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="editBlogItem('${b.id}')" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 0.78rem;">✏️ Edit</button>
                        <button onclick="deleteBlogItem('${b.id}')" class="btn btn-sm btn-danger" style="padding: 4px 8px; font-size: 0.78rem;">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupAdminBlogsCrud() {
    const openFormBtn = document.getElementById('open-add-blog-form-btn');
    const formCard = document.getElementById('blog-form-card');
    const cancelBtn = document.getElementById('blog-form-cancel-btn');
    const saveBtn = document.getElementById('blog-form-save-btn');

    if (openFormBtn) {
        openFormBtn.addEventListener('click', () => {
            document.getElementById('blog-edit-id').value = '';
            document.getElementById('blog-edit-title').value = '';
            document.getElementById('blog-edit-category').value = '';
            document.getElementById('blog-edit-summary').value = '';
            document.getElementById('blog-edit-content').value = '';
            document.getElementById('blog-form-title').textContent = '➕ Publish New Announcement / Blog Post';
            formCard.classList.remove('hidden');
            document.getElementById('blog-edit-title').focus();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => formCard.classList.add('hidden'));
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const id = document.getElementById('blog-edit-id').value;
            const title = document.getElementById('blog-edit-title').value.trim();
            const category = document.getElementById('blog-edit-category').value.trim();
            const summary = document.getElementById('blog-edit-summary').value.trim();
            const content = document.getElementById('blog-edit-content').value.trim();

            if (!title || !summary) {
                alert("Post Title aur Summary likhna zaroori hai!");
                return;
            }

            try {
                const res = await fetch('/api/blogs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, title, category, summary, content, author: 'Hafiz Ramajan' })
                });
                if (res.ok) {
                    formCard.classList.add('hidden');
                    loadAdminBlogsTable();
                    loadAndRenderBlogs();
                    loadAdminDashboard();
                    alert("Blog post kamyabi se publish ho gaya!");
                }
            } catch (e) {
                console.error("Save blog error:", e);
            }
        });
    }
}

window.editBlogItem = function(id) {
    const b = globalBlogsData.find(item => String(item.id) === String(id));
    if (!b) return;

    const formCard = document.getElementById('blog-form-card');
    document.getElementById('blog-edit-id').value = b.id;
    document.getElementById('blog-edit-title').value = b.title || '';
    document.getElementById('blog-edit-category').value = b.category || '';
    document.getElementById('blog-edit-summary').value = b.summary || '';
    document.getElementById('blog-edit-content').value = b.content || '';
    document.getElementById('blog-form-title').textContent = '✏️ Edit Post: ' + b.title;
    formCard.classList.remove('hidden');
    formCard.scrollIntoView({ behavior: 'smooth' });
};

window.deleteBlogItem = async function(id) {
    if (!confirm("Kya aap is blog post ko delete karna chahte hain?")) return;
    try {
        await fetch('/api/blogs/' + id, { method: 'DELETE' });
        loadAdminBlogsTable();
        loadAndRenderBlogs();
        loadAdminDashboard();
    } catch (e) {
        console.error("Delete blog error:", e);
    }
};

// Passport Document Verification System - Frontend App
// Enhanced with 10th Marksheet & Custom Docs support, Multi-Doc Name Spelling Diff, & Persistent PDF Download

// Configure PDF.js Worker
const pdfjsLib = window['pdfjs-dist/build/pdf'];
if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

// Multilingual Translations Dictionary
const translations = {
    roman: {
        title: "Passport Document Verification System",
        subtitle: "Aadhaar, PAN Card aur 10th Marksheet upload karke spelling mismatch, Date of Birth errors aur PSK appointment clearance check karein.",
        systemBadge: "AI KYC & PSK Verification Engine",
        
        // Navigation
        navVerify: "📋 Documents Verify",
        navNews: "Latest News & Schemes",
        navServices: "Services & Rates",
        navEligibility: "Eligibility Checker",
        navFaq: "FAQs",
        
        // Live Ticker
        tickerBadge: "LATEST UPDATES",
        tickerExplore: "View All 8 Updates",

        // Hero Trust & Stats
        heroTitle: "Instant AI Document Cross-Verification & Pre-Screening",
        heroSubtitle: "Aadhaar, PAN Card aur 10th Marksheet upload karke spelling mismatch, DOB galtiyan aur PSK rejection se bachein.",
        trust1Title: "100% PSK Compliance",
        trust1Desc: "MEA & RPO standards ke mutabiq certified pre-screening.",
        trust2Title: "Character-by-Character AI Match",
        trust2Desc: "Ek ek harf aur spelling discrepancy ki live checking.",
        trust3Title: "Zero Appointment Rejection",
        trust3Desc: "Pehle hi galti pakad kar Annexure-D affidavit guidance.",
        stat1Label: "100% Client Privacy",
        stat2Label: "Real-Time AI OCR",
        stat3Label: "0 Rejections at PSK",
        stat4Label: "Direct Expert Assistance",

        // Roadmap
        roadmapHeading: "Passport Clearance Roadmap: 4 Simple Steps to Guaranteed Approval",
        step1Title: "Step 1: Upload Documents",
        step1Desc: "Aadhaar Card, PAN Card aur 10th Marksheet ki clean photo ya PDF attach karein.",
        step2Title: "Step 2: AI Cross-Verification",
        step2Desc: "AI OCR Name, Gender, DOB aur Document ID ko extract karke cross-verify karega.",
        step3Title: "Step 3: Discrepancy Audit",
        step3Desc: "Spelling mismatch aur DOB difference ko red aur yellow badges me highlight kiya jayega.",
        step4Title: "Step 4: Audit Certificate",
        step4Desc: "Official audit report download karein aur zaroori ho to correction karwayen.",

        // Actions Bar
        addDoc: "Custom Document Add Karein",
        verify: "Verify Documents",
        reset: "Reset All",
        newsDrawerBtn: "Latest News & Updates",

        // Document Cards
        aadhaarTitle: "Aadhaar Card",
        panTitle: "PAN Card",
        marksheetTitle: "10th Marksheet",
        badgeMandatory: "Mandatory",
        badgeOptional: "Optional",
        uploadText: "File yaha drag karein ya click karke upload karein",
        uploadSubtext: "PNG, JPG, JPEG, PDF up to 15MB",
        statusTextPending: "Pending",
        statusTextUploaded: "File Uploaded / Ready",
        statusTextProcessing: "AI OCR processing...",
        statusTextDone: "Verification Complete",
        statusTextError: "Verification Failed",

        // Status Messages
        statusInitial: "Aadhaar aur PAN mandatory hain. 10th Marksheet aur Custom docs bhi upload kar sakte hain.",
        statusNeedMandatory: "Sabhi zaroori (mandatory) documents upload karna lazmi hai.",
        statusReady: "Verify button par click karke AI verification shuru karein.",
        verdictSuccess: "Sab documents kamyabi se match ho gaye hain! Ready for Passport.",
        verdictError: "Mismatch mila! Highlighted fields aur spelling difference ko check karein.",

        // Audit Report
        reportCertificateTitle: "OFFICIAL PASSPORT VERIFICATION AUDIT CERTIFICATE",
        reportMetaSubtitle: "Official Verification Certificate for Indian Passport Application & PSK Compliance",
        btnDownloadPdf: "Download PDF Report",
        btnPrintReport: "Print Report",
        topParJayein: "Top Par Jayein",
        viewFullReport: "View Full Report",
        field: "Field",
        statusCol: "Status",
        fieldName: "Name (Pura Naam)",
        fieldGender: "Gender (Jins / Sex)",
        fieldDob: "Date of Birth (DOB)",
        fieldFather: "Father's Name (Walid Ka Naam)",
        fieldDocNumber: "Document ID Number",

        // PSK Advisory
        pskAdvisoryTitle: "Passport Seva Kendra (PSK) Mandatory Verification Guidelines:",
        pskRuleName: "Name Spelling Rule: Aadhaar, PAN aur Marksheet me ek ek harf (letters) bilkul barabar hone chahiye. Thoda sa bhi farq hone par Annexure-D One & Same Person legal affidavit lazmi hoga.",
        pskRuleGender: "Gender Rule: Sabhi documents par Gender (Male / Female / Transgender) ek jaisa hona chahiye.",
        pskRuleDob: "Date of Birth Rule: Aadhaar me poori tareekh (DD/MM/YYYY) honi chahiye. Sirf saal (Year of Birth) hone par PSK application hold ho sakti hai.",

        // News & Portal
        portalBadge: "OFFICIAL ANNOUNCEMENTS & SCHEMES",
        portalTitle: "Latest Government Schemes & Passport Circulars",
        portalSubtitle: "Government schemes, scholarship deadlines, e-Passport rollout guidelines aur circulars ki authentic updates.",
        portalSearchPlaceholder: "Schemes, scholarship ya passport rules search karein...",
        filterAll: "Sabhi Updates (All)",
        filterPassport: "Passport Rules",
        filterScholarship: "SSP Scholarships",
        filterVoter: "Voter ID Cards",
        filterPan: "PAN Card Updates",
        filterPolice: "Police Verification",
        readMoreBtn: "Puri Khabar Padhein",
        shareBtn: "WhatsApp Share",

        // Services & Shop Section
        servicesTitle: "Hamari Sabhi Online Sevaen & Fees (Services & Price List):",
        promoTitle: "📋 Documents Me Galti Hai Ya Naye Documents Banwane Hain? Hum 100% Sahi Karke Denge!",
        promoSubtitle: "Passport, PAN Card, Voter ID, ya Marksheet me Name Spelling, DOB, ya Father's Name mismatch ho gaya hai? Ya naya Passport, Voter ID, Police Verification, ya SSP Scholarship karwana ho? Fikar mat karein! Aapka sabhi online kaam 100% legal, fast aur approved karwayen.",
        bookOnWhatsApp: "💬 WhatsApp Book",

        // Diagnostic Section
        diagTitle: "Quick Passport Eligibility & Category Diagnostic",
        diagSubtitle: "3 aasaan sawalon ke jawab dein aur janein ki aap Non-ECR ke eligible hain ya Annexure-D affidavit zaroori hai.",
        q1Title: "1. Kya aapne 10th Class (Matriculation / SSLC) pass kiya hai?",
        q1Sub: "10th Marksheet hone par aapko Non-ECR (Emigration Check Not Required) category milti hai.",
        q2Title: "2. Kya aapke documents me Name Spelling me koi mismatch hai?",
        q2Sub: "Agar haan, to PSK appointment se pehle Annexure-D legal affidavit banana hoga.",
        q3Title: "3. Kya aapke Aadhaar Card par Poori Date of Birth (DD/MM/YYYY) darj hai?",
        q3Sub: "Sirf Year of Birth hone par pehle Aadhaar update karwana zaroori hai.",

        // FAQ Section
        faqTitle: "Frequently Asked Questions (Aam Sawalat)",
        faqSubtitle: "Passport, Name spelling mismatch aur online documents ke bare me zaroori maloomat.",
        faqQ1: "Aadhaar aur PAN me Name Spelling me farq ho to Passport ban sakta hai?",
        faqA1: "Haan, ban sakta hai lekin PSK par rejection se bachne ke liye First-class Magistrate ya Notary se certified Annexure-D (One and the Same Person) Affidavit jama karna padega.",
        faqQ2: "Non-ECR Passport ke liye kaun se documents chahiye?",
        faqA2: "10th standard (SSLC/Matriculation) marksheet ya higher qualification certificate lagane par bina kisi immigration check ke Non-ECR passport issue hota hai.",
        faqQ3: "Tatkaal Passport kitne din me milta hai?",
        faqA3: "Tatkaal category me PSK verification ke baad aamtaur par 1 se 3 working days me passport print ho kar dispatch ho jata hai.",
        faqQ4: "Aadhaar Card me sirf saal (Year of Birth) likha hai to kya karein?",
        faqA4: "PSK rules ke mutabiq Aadhaar me Date, Month aur Year teeno darj hona zaroori hai. Aap hamare centre se pehle Aadhaar DOB update karwa sakte hain.",
        faqQ5: "SSP Scholarship ke liye kya eligibility hai?",
        faqA5: "Karnataka Post-Matric & Pre-Matric SSP Scholarship ke liye valid Caste & Income certificate, Aadhaar-linked bank account aur college admission receipt zaroori hai.",

        // Footer
        footerDesc: "AI KYC & PSK Compliance Engine dwara sanchalit. Indian Passport applicants aur digital service kendras ke liye banaya gaya hai.",
        footerPartner: "Excellence Services Raibag — Authorized Digital Government Assistance Partner.",
        floatingWhatsApp: "Need Help? WhatsApp Us",

        // Modals
        modalTitle: "Custom Document Add Karein",
        modalDocLabel: "Document Name (jaise Voter ID, Driving License, Passport)",
        modalMandatoryLabel: "Kya yeh document mandatory hai?",
        modalCancel: "Cancel",
        modalSubmit: "Add Document"
    },
    en: {
        title: "Passport Document Verification System",
        subtitle: "Upload Aadhaar, PAN Card & 10th Marksheet to detect spelling mismatches, Date of Birth errors, and ensure 100% PSK appointment clearance without delays.",
        systemBadge: "AI KYC & PSK Compliance Engine",
        
        // Navigation
        navVerify: "📋 Verify Docs",
        navNews: "Latest News & Schemes",
        navServices: "Services & Rates",
        navEligibility: "Eligibility Checker",
        navFaq: "FAQs",

        // Live Ticker
        tickerBadge: "LATEST UPDATES",
        tickerExplore: "View All 8 Updates",

        // Hero Trust & Stats
        heroTitle: "Instant AI Document Cross-Verification & Pre-Screening",
        heroSubtitle: "Upload Aadhaar, PAN Card & 10th Marksheet to detect spelling mismatches, Date of Birth errors, and ensure 100% PSK appointment clearance without delays.",
        trust1Title: "100% PSK Compliance",
        trust1Desc: "Pre-screened against official MEA & RPO standards.",
        trust2Title: "Character-by-Character AI Match",
        trust2Desc: "Detects exact character mismatches and spelling differences.",
        trust3Title: "Zero Appointment Rejection",
        trust3Desc: "Pre-identify errors with Annexure-D affidavit guidance.",
        stat1Label: "100% Client Privacy",
        stat2Label: "Real-Time AI OCR",
        stat3Label: "0 Rejections at PSK",
        stat4Label: "Direct Expert Assistance",

        // Roadmap
        roadmapHeading: "Passport Clearance Roadmap: 4 Simple Steps to Guaranteed Approval",
        step1Title: "Step 1: Upload Documents",
        step1Desc: "Attach clear scans or photos of Aadhaar Card, PAN Card, and 10th Marksheet.",
        step2Title: "Step 2: AI Cross-Verification",
        step2Desc: "AI OCR extracts and cross-verifies Full Name, Gender, Date of Birth, and ID Number.",
        step3Title: "Step 3: Instant Discrepancy Audit",
        step3Desc: "Spelling discrepancies and DOB mismatches are highlighted with alert badges.",
        step4Title: "Step 4: Audit Certificate",
        step4Desc: "Download official compliance certificate and resolve errors before your PSK slot.",

        // Actions Bar
        addDoc: "Add Custom Document",
        verify: "Verify Documents",
        reset: "Reset All",
        newsDrawerBtn: "Latest News & Updates",

        // Document Cards
        aadhaarTitle: "Aadhaar Card",
        panTitle: "PAN Card",
        marksheetTitle: "10th Marksheet",
        badgeMandatory: "Mandatory",
        badgeOptional: "Optional",
        uploadText: "Drag & drop file here or click to browse",
        uploadSubtext: "PNG, JPG, JPEG, PDF up to 15MB",
        statusTextPending: "Pending",
        statusTextUploaded: "File Uploaded / Ready",
        statusTextProcessing: "AI OCR processing...",
        statusTextDone: "Verification Complete",
        statusTextError: "Verification Failed",

        // Status Messages
        statusInitial: "Aadhaar and PAN Card are mandatory. 10th Marksheet and custom documents can also be verified.",
        statusNeedMandatory: "Please upload all mandatory documents before proceeding.",
        statusReady: "Click 'Verify Documents' button to start AI cross-verification.",
        verdictSuccess: "All documents successfully matched! Ready for Passport submission.",
        verdictError: "Discrepancy detected! Please review highlighted fields & spelling differences.",

        // Audit Report
        reportCertificateTitle: "OFFICIAL PASSPORT VERIFICATION AUDIT CERTIFICATE",
        reportMetaSubtitle: "Official Verification Certificate for Indian Passport Application & PSK Compliance",
        btnDownloadPdf: "Download PDF Report",
        btnPrintReport: "Print Report",
        topParJayein: "Go to Top",
        viewFullReport: "View Full Report",
        field: "Field",
        statusCol: "Status",
        fieldName: "Full Legal Name",
        fieldGender: "Gender (Sex)",
        fieldDob: "Date of Birth (DOB)",
        fieldFather: "Father's Full Name",
        fieldDocNumber: "Document ID Number",

        // PSK Advisory
        pskAdvisoryTitle: "Passport Seva Kendra (PSK) Mandatory Verification Guidelines:",
        pskRuleName: "Name Spelling Rule: Character-by-character spelling across Aadhaar, PAN, and Marksheet must match precisely. Any discrepancy requires an Annexure-D 'One and the Same Person' notarized affidavit.",
        pskRuleGender: "Gender Rule: Gender (Male / Female / Transgender) must match consistently across all submitted government proofs.",
        pskRuleDob: "Date of Birth Rule: Aadhaar must reflect full Date of Birth (DD/MM/YYYY). Year-only records lead to mandatory application hold at the PSK counter.",

        // News & Portal
        portalBadge: "OFFICIAL ANNOUNCEMENTS & SCHEMES",
        portalTitle: "Latest Government Schemes & Passport Circulars",
        portalSubtitle: "Stay updated with official deadlines, fee updates, e-Passport rollout guidelines, and student scholarship alerts.",
        portalSearchPlaceholder: "Search schemes, scholarships, passport rules...",
        filterAll: "All Announcements",
        filterPassport: "Passport Rules",
        filterScholarship: "SSP Scholarships",
        filterVoter: "Voter ID & ECI",
        filterPan: "PAN & Tax",
        filterPolice: "Police Verification",
        readMoreBtn: "Read Full Article",
        shareBtn: "WhatsApp Share",

        // Services & Shop Section
        servicesTitle: "Our Complete Online Government Services & Official Price List:",
        promoTitle: "📋 Document Errors or Need Fresh Documents? We Deliver 100% Accurate Online Services!",
        promoSubtitle: "Spelling, Date of Birth, or Father's Name mismatch in Passport, PAN, Voter ID, or Marksheet? Or need a fresh Passport, Voter ID, Police Verification, or SSP Scholarship? Don't worry! Get all legal government applications filed with guaranteed approval.",
        bookOnWhatsApp: "💬 Book on WhatsApp",

        // Diagnostic Section
        diagTitle: "Quick Passport Eligibility & Category Diagnostic",
        diagSubtitle: "Answer 3 quick questions to check if you qualify for Non-ECR or need Annexure-D affidavit.",
        q1Title: "1. Have you passed 10th Standard (Matriculation / SSLC)?",
        q1Sub: "Qualifies you for Non-ECR (Emigration Check Not Required) category.",
        q2Title: "2. Is there any Name Spelling Mismatch across your documents?",
        q2Sub: "Requires Annexure-D / Legal Notarized Affidavit before PSK appointment.",
        q3Title: "3. Does your Aadhaar have Full Date of Birth (DD/MM/YYYY)?",
        q3Sub: "Year-only Aadhaar requires mandatory DOB update before passport filing.",

        // FAQ Section
        faqTitle: "Frequently Asked Questions",
        faqSubtitle: "Important answers regarding Indian Passport applications, spelling mismatches, and online citizen services.",
        faqQ1: "Can I get a passport if my name spelling differs between Aadhaar and PAN?",
        faqA1: "Yes, you can apply. However, to prevent rejection at PSK, you must submit a notarized Annexure-D 'One and the Same Person' Affidavit certified by a First-Class Magistrate or Notary Public.",
        faqQ2: "What documents are required for Non-ECR (Emigration Check Not Required)?",
        faqA2: "Submitting a 10th Standard (SSLC/Matriculation) pass certificate or higher educational degree guarantees Non-ECR status without emigration clearances.",
        faqQ3: "How fast is Tatkaal Passport issued?",
        faqA3: "Under Tatkaal processing, once PSK biometric verification is cleared, the passport is typically printed and dispatched within 1 to 3 working days.",
        faqQ4: "My Aadhaar card shows only Year of Birth. Can I still apply for Passport?",
        faqA4: "No. PSK guidelines strictly require full Date of Birth (DD/MM/YYYY) on Aadhaar. You must update your Aadhaar DOB first, which we can expedite at our center.",
        faqQ5: "What is required for the Karnataka SSP Scholarship application?",
        faqA5: "You need a valid Caste & Income Certificate (RD Number), Aadhaar-linked NPCI active bank account, and the current academic year college admission fee receipt.",

        // Footer
        footerDesc: "Powered by AI KYC & PSK Compliance Engine. Designed for Indian Passport Applicants & Digital Service Kendras.",
        footerPartner: "Excellence Services Raibag — Authorized Digital Government Assistance Partner.",
        floatingWhatsApp: "Need Help? WhatsApp Us",

        // Modals
        modalTitle: "Add Custom Document",
        modalDocLabel: "Document Name (e.g., Voter ID, Driving License, Passport)",
        modalMandatoryLabel: "Is this document mandatory for verification?",
        modalCancel: "Cancel",
        modalSubmit: "Add Document"
    }
};

// Global App States
currentLang = localStorage.getItem('appLanguage') || 'en';
let activeTheme = localStorage.getItem('appTheme') || 'light';
let verificationPerformed = false;

// Application State (Document Structure with Gender)
let documents = [
    {
        id: 'aadhaar',
        title: 'Aadhaar Card',
        mandatory: true,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        gender: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    },
    {
        id: 'pan',
        title: 'PAN Card',
        mandatory: true,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        gender: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    },
    {
        id: 'marksheet',
        title: '10th Marksheet',
        mandatory: false,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        gender: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    }
];

// Initialize UI Elements & Translation System

// ==========================================================================
// MULTI-PAGE VIEW TAB SWITCHER (VERIFY, NEWS, SERVICES, ELIGIBILITY, FAQS)
// ==========================================================================
function switchPageTab(pageId) {
    if (pageId === 'page-eligibility') {
        switchPageTab('page-verification');
        return;
    }
    const pages = document.querySelectorAll('.app-page-view');
    const navLinks = document.querySelectorAll('#main-nav-tabs .nav-link');
    const bottomNavItems = document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item');

    pages.forEach(p => {
        if (p.id === pageId) {
            p.style.display = 'block';
            p.classList.add('active');
        } else {
            p.style.display = 'none';
            p.classList.remove('active');
        }
    });

    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    bottomNavItems.forEach(item => {
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const hashName = pageId.replace('page-', '');
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, '#' + hashName);
    }

    // Clear unread indicator dots whenever user opens news
    if (pageId === 'page-news') {
        const bellDot = document.getElementById('bell-unread-dot');
        if (bellDot) bellDot.classList.add('hidden');
        const bottomNewsDot = document.getElementById('bottom-news-dot');
        if (bottomNewsDot) bottomNewsDot.classList.add('hidden');
        if (typeof loadAndRenderBlogs === 'function') loadAndRenderBlogs();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchPageTab = switchPageTab;

function handleHashRoute() {
    const raw = (window.location.hash || '').replace('#', '').toLowerCase();
    if (raw.includes('news') || raw.includes('portal')) {
        switchPageTab('page-news');
    } else if (raw.includes('serv') || raw.includes('promo')) {
        switchPageTab('page-services');
    } else if (raw.includes('elig') || raw.includes('check')) {
        switchPageTab('page-verification');
    } else if (raw.includes('faq')) {
        switchPageTab('page-faqs');
    } else if (raw.includes('verif') || raw === '') {
        switchPageTab('page-verification');
    }
}
window.addEventListener('hashchange', handleHashRoute);


document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageSelector();
    initConsultantContact();
    applyTranslations();
    setupGlobalEventListeners();
    loadAndRenderServices();
    loadAndRenderBlogs();
    loadShopInfo();
    initLiveNotificationStream();
    handleHashRoute();
    setupPhoneCapture();
    setupPhonePromptModal();

    if (window.location.protocol === 'file:') {
        const banner = document.getElementById('global-status-message');
        if (banner) {
            banner.innerHTML = '<p style="color: #f59e0b; font-weight: 600;">⚠️ AI Document Verification chalane ke liye browser me <a href="http://localhost:8080" style="color: #60a5fa; text-decoration: underline; font-weight: 700;">http://localhost:8080</a> open karein!</p>';
        }
    }
});


// Excellence Services (Hafiz Ramajan - Raibag) Permanent Direct Contact Details
const EXCELLENCE_CONTACT = {
    primaryPhone: '+91 7849008882',
    primaryDigits: '917849008882',
    secondaryPhone: '+91 9620746029',
    secondaryDigits: '919620746029',
    email: 'ramajanraibag@gmail.com',
    qrLink: 'https://wa.me/qr/HTPXYYKJAOWWA1',
    shopName: 'EXCELLENCE SERVICES',
    ownerName: 'Hafiz Ramajan',
    location: 'Near Iqra School, Raibag, Belagavi, Karnataka'
};

function initConsultantContact() {
    updateConsultationAd(false, 0, 3);
}

function updateConsultationAd(hasMismatch, mismatchCount, totalDocs) {
    const titleEl = document.getElementById('promo-banner-title');
    const subEl = document.getElementById('promo-banner-subtitle');
    const waBtn = document.getElementById('whatsapp-consult-btn');
    const callPrimaryBtn = document.getElementById('call-primary-btn');
    const callSecondaryBtn = document.getElementById('call-secondary-btn');
    const emailBtn = document.getElementById('email-btn');

    let defaultMsg = '';
    if (hasMismatch) {
        if (titleEl) {
            titleEl.innerHTML = `⚠️ Documents Me ${mismatchCount} Galti/Mismatch Mila! Excellence Services 100% Sahi Karke Dega!`;
        }
        if (subEl) {
            subEl.innerHTML = `Aapke documents me <strong>${mismatchCount} discrepancy/galti</strong> mili hai. PSK me passport reject hone se pehle <strong>Hafiz Ramajan (Excellence Services, Raibag)</strong> se direct contact karein — Name Spelling, DOB, Father's Name correction, Annexure-D affidavit aur sabhi documents 100% legal karwa kar diye jaate hain!`;
        }
        defaultMsg = `Namaste Hafiz Ramajan Sir! Maine Passport Verification System par check kiya, mere documents me ${mismatchCount} mismatch aaya hai. Kripya mujhe documents sahi karwane aur Passport banwane me help karein. (Excellence Services Raibag)`;
    } else {
        if (titleEl) {
            titleEl.innerHTML = `✅ Documents 100% Match Hain! Fresh / Tatkaal Passport Hum Se Apply Karwayen!`;
        }
        if (subEl) {
            subEl.innerHTML = `Mubarak ho! Aapke sabhi ${totalDocs} documents ekdum sahi match hain. Ab bina kisi rukawat ke Fresh Passport, Tatkaal Passport, Police Verification, PAN Card, Voter ID, ya SSP Scholarship fast-track process karwayen. Visit: Near Iqra School, Raibag.`;
        }
        defaultMsg = `Namaste Hafiz Ramajan Sir! Maine Passport Verification System par check kiya, mere sabhi ${totalDocs} documents 100% match ho gaye hain. Mujhe Fresh/Tatkaal Passport apply karwana hai. Kripya meri application process kar dijiye.`;
    }

    if (waBtn) {
        // Direct WhatsApp with prefilled message
        waBtn.href = `https://wa.me/${EXCELLENCE_CONTACT.primaryDigits}?text=${encodeURIComponent(defaultMsg)}`;
    }
    if (callPrimaryBtn) {
        callPrimaryBtn.href = `tel:+${EXCELLENCE_CONTACT.primaryDigits}`;
    }
    if (callSecondaryBtn) {
        callSecondaryBtn.href = `tel:+${EXCELLENCE_CONTACT.secondaryDigits}`;
    }
    if (emailBtn) {
        emailBtn.href = `mailto:${EXCELLENCE_CONTACT.email}?subject=${encodeURIComponent('Passport & Documents Assistance - Excellence Services')}&body=${encodeURIComponent(defaultMsg)}`;
    }
}

// API Key is managed securely on server (.env)

// Setup Theme State on Startup
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (activeTheme === 'dark') {
        document.body.classList.remove('light-theme');
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        document.body.classList.add('light-theme');
        if (themeBtn) themeBtn.textContent = '🌙';
        activeTheme = 'light';
    }
    localStorage.setItem('appTheme', activeTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            if (document.body.classList.contains('light-theme')) {
                document.body.classList.remove('light-theme');
                themeBtn.textContent = '☀️';
                activeTheme = 'dark';
            } else {
                document.body.classList.add('light-theme');
                themeBtn.textContent = '🌙';
                activeTheme = 'light';
            }
            localStorage.setItem('appTheme', activeTheme);
        });
    }
}

// Setup Language Selector
function initLanguageSelector() {
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('appLanguage', currentLang);
            applyTranslations();
            if (typeof renderDocumentGrid === 'function') renderDocumentGrid();
            if (typeof loadAndRenderServices === 'function') loadAndRenderServices();
            if (typeof loadAndRenderBlogs === 'function') loadAndRenderBlogs();
            if (verificationPerformed && typeof compileVerificationResults === 'function') {
                compileVerificationResults();
            }
        });
    }
}

// Apply Translations to DOM Elements
function applyTranslations() {
    const isRoman = (currentLang === 'roman');
    const dict = translations[currentLang] || translations.roman;
    
    document.documentElement.dir = 'ltr';
    
    // Page Title & Header
    const pageTitle = document.getElementById('i18n-page-title');
    if (pageTitle) pageTitle.textContent = dict.title;
    const titleEl = document.getElementById('i18n-title');
    if (titleEl) titleEl.textContent = dict.title;
    const systemBadge = document.getElementById('i18n-system-badge');
    if (systemBadge) systemBadge.textContent = dict.systemBadge;
    
    // Navbar Links
    const navVerifyText = document.getElementById('nav-verify-text');
    if (navVerifyText) {
        navVerifyText.textContent = isRoman ? "Documents Verify" : "Verify Docs";
    } else {
        const navVerify = document.getElementById('nav-verify-link');
        if (navVerify) navVerify.textContent = dict.navVerify;
    }

    const backText = isRoman ? "Verification System Par Wapas Jayein" : "Back to Verification System";
    ['back-to-verify-news', 'back-to-verify-services', 'back-to-verify-elig', 'back-to-verify-faq'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = backText;
    });
    const navNews = document.getElementById('nav-news-text');
    if (navNews) navNews.textContent = dict.navNews;
    const navServices = document.getElementById('nav-services-text');
    if (navServices) navServices.textContent = dict.navServices;
    const navChecker = document.getElementById('nav-checker-text');
    if (navChecker) navChecker.textContent = dict.navEligibility;
    const navFaq = document.getElementById('nav-faq-text');
    if (navFaq) navFaq.textContent = dict.navFaq;

    // Live Ticker
    const tickerBadge = document.getElementById('ticker-badge-text');
    if (tickerBadge) tickerBadge.textContent = dict.tickerBadge;
    const tickerExplore = document.getElementById('ticker-explore-text');
    if (tickerExplore) tickerExplore.textContent = dict.tickerExplore;

    // Hero Section & Trust Badges
    const heroTitle = document.getElementById('hero-title-text');
    if (heroTitle) heroTitle.textContent = dict.heroTitle;
    const heroSub = document.getElementById('i18n-subtitle');
    if (heroSub) heroSub.textContent = dict.heroSubtitle;

    const t1Title = document.getElementById('trust-1-title');
    if (t1Title) t1Title.textContent = dict.trust1Title;
    const t1Desc = document.getElementById('trust-1-desc');
    if (t1Desc) t1Desc.textContent = dict.trust1Desc;
    const t2Title = document.getElementById('trust-2-title');
    if (t2Title) t2Title.textContent = dict.trust2Title;
    const t2Desc = document.getElementById('trust-2-desc');
    if (t2Desc) t2Desc.textContent = dict.trust2Desc;
    const t3Title = document.getElementById('trust-3-title');
    if (t3Title) t3Title.textContent = dict.trust3Title;
    const t3Desc = document.getElementById('trust-3-desc');
    if (t3Desc) t3Desc.textContent = dict.trust3Desc;

    // Hero Stats
    const s1 = document.getElementById('stat-1-label');
    if (s1) s1.textContent = dict.stat1Label;
    const s2 = document.getElementById('stat-2-label');
    if (s2) s2.textContent = dict.stat2Label;
    const s3 = document.getElementById('stat-3-label');
    if (s3) s3.textContent = dict.stat3Label;
    const s4 = document.getElementById('stat-4-label');
    if (s4) s4.textContent = dict.stat4Label;

    // Compliance Roadmap Strip
    const roadHead = document.getElementById('roadmap-heading');
    if (roadHead) roadHead.textContent = dict.roadmapHeading;
    const st1Title = document.getElementById('step-1-title');
    if (st1Title) st1Title.textContent = dict.step1Title;
    const st1Desc = document.getElementById('step-1-desc');
    if (st1Desc) st1Desc.textContent = dict.step1Desc;
    const st2Title = document.getElementById('step-2-title');
    if (st2Title) st2Title.textContent = dict.step2Title;
    const st2Desc = document.getElementById('step-2-desc');
    if (st2Desc) st2Desc.textContent = dict.step2Desc;
    const st3Title = document.getElementById('step-3-title');
    if (st3Title) st3Title.textContent = dict.step3Title;
    const st3Desc = document.getElementById('step-3-desc');
    if (st3Desc) st3Desc.textContent = dict.step3Desc;
    const st4Title = document.getElementById('step-4-title');
    if (st4Title) st4Title.textContent = dict.step4Title;
    const st4Desc = document.getElementById('step-4-desc');
    if (st4Desc) st4Desc.textContent = dict.step4Desc;

    // Actions Bar Buttons
    const addDocBtn = document.getElementById('i18n-add-doc');
    if (addDocBtn) addDocBtn.textContent = dict.addDoc;
    const verifyBtn = document.getElementById('i18n-verify');
    if (verifyBtn) verifyBtn.textContent = dict.verify;
    const resetBtn = document.getElementById('i18n-reset');
    if (resetBtn) resetBtn.textContent = dict.reset;

    const newsDrawerBtn = document.getElementById('btn-toggle-news-drawer');
    if (newsDrawerBtn) {
        const lastSpan = newsDrawerBtn.querySelector('span:last-child');
        if (lastSpan) lastSpan.textContent = dict.newsDrawerBtn;
    }

    // Report Actions & Headings
    const dlPdfBtn = document.getElementById('i18n-download-pdf');
    if (dlPdfBtn) dlPdfBtn.textContent = dict.btnDownloadPdf;
    const topDlBtn = document.getElementById('i18n-top-dl-pdf');
    if (topDlBtn) topDlBtn.textContent = dict.btnDownloadPdf;
    const topOpenBtn = document.getElementById('i18n-top-view-report');
    if (topOpenBtn) topOpenBtn.textContent = dict.viewFullReport;
    const printBtn = document.getElementById('i18n-print-report');
    if (printBtn) printBtn.textContent = dict.btnPrintReport;
    const topScrollBtn = document.getElementById('scroll-to-top-btn');
    if (topScrollBtn) {
        const sSpan = topScrollBtn.querySelector('span:last-child');
        if (sSpan) sSpan.textContent = dict.topParJayein;
    }
    const inlineTitle = document.getElementById('i18n-inline-report-title');
    if (inlineTitle) inlineTitle.textContent = dict.reportCertificateTitle;
    const reportSub = document.getElementById('report-timestamp-meta');
    if (reportSub) reportSub.textContent = dict.reportMetaSubtitle;

    // PSK Guidelines
    const pskTitle = document.getElementById('i18n-psk-title') || document.querySelector('.psk-advisory-box h4');
    if (pskTitle) pskTitle.textContent = dict.pskAdvisoryTitle;
    const pskList = document.getElementById('advisory-list-items');
    if (pskList) {
        pskList.innerHTML = `
            <li>${dict.pskRuleName}</li>
            <li>${dict.pskRuleGender}</li>
            <li>${dict.pskRuleDob}</li>
        `;
    }

    // News Portal Section
    const portalBadge = document.getElementById('portal-badge-text');
    if (portalBadge) portalBadge.textContent = dict.portalBadge;
    const portalTitle = document.getElementById('portal-title-text');
    if (portalTitle) portalTitle.textContent = dict.portalTitle;
    const portalSub = document.getElementById('portal-sub-text');
    if (portalSub) portalSub.textContent = dict.portalSubtitle;
    const portalInput = document.getElementById('portal-news-search-input');
    if (portalInput) portalInput.placeholder = dict.portalSearchPlaceholder;

    // Category Filter Buttons
    const catAll = document.getElementById('cat-all-btn');
    if (catAll) catAll.textContent = dict.filterAll;
    const catPass = document.getElementById('cat-passport-btn');
    if (catPass) catPass.textContent = dict.filterPassport;
    const catSch = document.getElementById('cat-scholarship-btn');
    if (catSch) catSch.textContent = dict.filterScholarship;
    const catVot = document.getElementById('cat-voter-btn');
    if (catVot) catVot.textContent = dict.filterVoter;
    const catPan = document.getElementById('cat-pan-btn');
    if (catPan) catPan.textContent = dict.filterPan;
    const catLeg = document.getElementById('cat-legal-btn');
    if (catLeg) catLeg.textContent = dict.filterPolice;

    // Services Promo Banner
    const promoTitle = document.getElementById('promo-banner-title');
    if (promoTitle) {
        promoTitle.textContent = isRoman ?
            "📋 Documents Me Galti Hai Ya Naye Documents Banwane Hain? Hum 100% Sahi Karke Denge!" :
            "📋 Discrepancy in Your Documents or Need Fresh Applications? We Guarantee 100% Approval!";
    }
    const promoSub = document.getElementById('promo-banner-subtitle');
    if (promoSub) {
        promoSub.textContent = isRoman ?
            "Passport, PAN Card, Voter ID, ya Marksheet me Name Spelling, DOB, ya Father's Name mismatch ho gaya hai? Ya naya Passport, Voter ID, Police Verification, ya SSP Scholarship karwana ho? Fikar mat karein! Aapka sabhi online kaam 100% legal, fast aur approved karwayen." :
            "Have spelling mismatches in Name, DOB, or Father's Name across Aadhaar, PAN Card, Voter ID, or Marksheet? Or need new Passport, Voter ID, Police Verification, or SSP Scholarship? Don't worry! We handle all online government applications with 100% legal clearance.";
    }

    // Services Section Heading
    const servCatTitle = document.getElementById('services-category-title-text');
    if (servCatTitle) {
        servCatTitle.innerHTML = `💼 <strong>${dict.servicesTitle}</strong>`;
    }

    // Eligibility Diagnostic Section
    const diagTitle = document.getElementById('diag-header-title');
    if (diagTitle) diagTitle.textContent = dict.diagTitle;
    const diagSub = document.getElementById('diag-header-sub');
    if (diagSub) diagSub.textContent = dict.diagSubtitle;
    const q1T = document.getElementById('q1-title');
    if (q1T) q1T.textContent = dict.q1Title;
    const q1S = document.getElementById('q1-sub');
    if (q1S) q1S.textContent = dict.q1Sub;
    const q2T = document.getElementById('q2-title');
    if (q2T) q2T.textContent = dict.q2Title;
    const q2S = document.getElementById('q2-sub');
    if (q2S) q2S.textContent = dict.q2Sub;
    const q3T = document.getElementById('q3-title');
    if (q3T) q3T.textContent = dict.q3Title;
    const q3S = document.getElementById('q3-sub');
    if (q3S) q3S.textContent = dict.q3Sub;

    // FAQ Section
    const faqMainTitle = document.getElementById('faq-main-title');
    if (faqMainTitle) faqMainTitle.textContent = dict.faqTitle;
    const faqMainSub = document.getElementById('faq-main-sub');
    if (faqMainSub) faqMainSub.textContent = dict.faqSubtitle;
    const fq1 = document.getElementById('faq-q1');
    if (fq1) fq1.textContent = dict.faqQ1;
    const fa1 = document.getElementById('faq-a1');
    if (fa1) fa1.textContent = dict.faqA1;
    const fq2 = document.getElementById('faq-q2');
    if (fq2) fq2.textContent = dict.faqQ2;
    const fa2 = document.getElementById('faq-a2');
    if (fa2) fa2.textContent = dict.faqA2;
    const fq3 = document.getElementById('faq-q3');
    if (fq3) fq3.textContent = dict.faqQ3;
    const fa3 = document.getElementById('faq-a3');
    if (fa3) fa3.textContent = dict.faqA3;
    const fq4 = document.getElementById('faq-q4');
    if (fq4) fq4.textContent = dict.faqQ4;
    const fa4 = document.getElementById('faq-a4');
    if (fa4) fa4.textContent = dict.faqA4;
    const fq5 = document.getElementById('faq-q5');
    if (fq5) fq5.textContent = dict.faqQ5;
    const fa5 = document.getElementById('faq-a5');
    if (fa5) fa5.textContent = dict.faqA5;

    // Footer
    const footDesc = document.getElementById('footer-desc-text');
    if (footDesc) footDesc.textContent = dict.footerDesc;
    const footPart = document.getElementById('footer-partner-text');
    if (footPart) footPart.textContent = dict.footerPartner;

    // Floating WhatsApp
    const floatWa = document.getElementById('floating-wa-text');
    if (floatWa) floatWa.textContent = dict.floatingWhatsApp;

    // Update in-memory document card titles
    if (documents[0]) documents[0].title = dict.aadhaarTitle;
    if (documents[1]) documents[1].title = dict.panTitle;
    if (documents[2]) documents[2].title = dict.marksheetTitle;

    // Re-render UI components
    updateGlobalStatus();
    renderDocumentGrid();
    loadAndRenderServices();
    loadShopInfo();

    // Re-run diagnostic if exists
    if (typeof runEligibilityDiagnostic === 'function') {
        runEligibilityDiagnostic();
    }

    // Only re-compile report if verification has already been performed
    if (verificationPerformed) {
        const reportSec = document.getElementById('verification-report-section');
        if (reportSec && !reportSec.classList.contains('hidden') && reportSec.style.display !== 'none') {
            compileVerificationResults();
        }
    }
}

// Setup Main Event Listeners
function setupGlobalEventListeners() {
    // Navigation Tab Switching
    document.querySelectorAll('#main-nav-tabs .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.dataset.page;
            if (targetPage) switchPageTab(targetPage);
        });
    });

    const tickerBtn = document.getElementById('ticker-view-all-btn');
    if (tickerBtn) {
        tickerBtn.addEventListener('click', () => switchPageTab('page-news'));
    }
    const newsDrawerBtn = document.getElementById('btn-toggle-news-drawer');
    if (newsDrawerBtn) {
        newsDrawerBtn.addEventListener('click', () => switchPageTab('page-news'));
    }
    const addDocBtn = document.getElementById('add-doc-btn'); if (addDocBtn) addDocBtn.addEventListener('click', openModal);
    document.getElementById('reset-all-btn').addEventListener('click', resetAll);
    document.getElementById('verify-all-btn').addEventListener('click', handleVerifyClick);

    // Close Report Modal Button
    const closeReportBtn = document.getElementById('close-report-btn');
    if (closeReportBtn) {
        closeReportBtn.addEventListener('click', () => {
            const reportModal = document.getElementById('verification-report-section');
            if (reportModal) reportModal.classList.add('hidden');
        });
    }

    // Click outside report modal to close
    const reportModal = document.getElementById('verification-report-section');
    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target.id === 'verification-report-section') {
                reportModal.classList.add('hidden');
            }
        });
    }

    // PDF Export Event Listeners
    const dlPdfBtn = document.getElementById('download-pdf-btn');
    if (dlPdfBtn) dlPdfBtn.addEventListener('click', generatePdfReport);

    const topDlBtn = document.getElementById('top-download-pdf-btn');
    if (topDlBtn) topDlBtn.addEventListener('click', generatePdfReport);

    // Top View Report Button: Smooth Scroll to Inline Report Section
    const topOpenBtn = document.getElementById('top-open-report-btn');
    if (topOpenBtn) {
        topOpenBtn.addEventListener('click', () => {
            verificationPerformed = true;
            compileVerificationResults();
            const reportSec = document.getElementById('verification-report-section');
            if (reportSec) {
                reportSec.classList.remove('hidden');
                reportSec.style.removeProperty('display');
                reportSec.style.display = 'block';
                reportSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Scroll to Top Button inside Inline Report
    const scrollTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Print Report
    const printBtn = document.getElementById('print-report-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            preparePrintablePdfTemplate();
            window.print();
        });
    }

    // Toggle Raw Text
    document.getElementById('toggle-raw-text-btn').addEventListener('click', () => {
        const rawTextSec = document.getElementById('raw-text-section');
        const toggleBtn = document.getElementById('toggle-raw-text-btn');
        const dict = translations[currentLang] || translations.roman;
        
        if (rawTextSec.classList.contains('hidden')) {
            rawTextSec.classList.remove('hidden');
            toggleBtn.textContent = dict.btnHideRaw;
        } else {
            rawTextSec.classList.add('hidden');
            toggleBtn.textContent = dict.btnShowRaw;
        }
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-submit-btn').addEventListener('click', handleAddCustomDoc);
    
    document.getElementById('custom-doc-modal').addEventListener('click', (e) => {
        if (e.target.id === 'custom-doc-modal') closeModal();
    });
}

// Render the grid containing document cards
function renderDocumentGrid() {
    const grid = document.getElementById('document-grid');
    grid.innerHTML = '';
    const dict = translations[currentLang] || translations.roman;

    documents.forEach((doc) => {
        const card = document.createElement('article');
        card.className = `doc-card animate-fade-in ${doc.status === 'done' ? 'completed' : ''} ${doc.status === 'processing' ? 'processing' : ''}`;
        card.id = `card-${doc.id}`;

        // Header Section
        const header = document.createElement('div');
        header.className = 'doc-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'doc-title';
        let translatedTitle = doc.title;
        if (doc.id === 'aadhaar') translatedTitle = dict.aadhaarTitle || doc.title;
        else if (doc.id === 'pan') translatedTitle = dict.panTitle || doc.title;
        else if (doc.id === 'marksheet') translatedTitle = dict.marksheetTitle || doc.title;
        titleSpan.textContent = translatedTitle;

        const badge = document.createElement('span');
        badge.className = `badge ${doc.mandatory ? 'badge-mandatory' : 'badge-optional'}`;
        badge.textContent = doc.mandatory ? dict.badgeMandatory : dict.badgeOptional;

        const rightSideHeader = document.createElement('div');
        rightSideHeader.style.display = 'flex';
        rightSideHeader.style.alignItems = 'center';
        rightSideHeader.style.gap = '8px';
        rightSideHeader.appendChild(badge);

        if (doc.id !== 'aadhaar' && doc.id !== 'pan' && doc.id !== 'marksheet') {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove-doc';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove Document';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeDocument(doc.id);
            });
            rightSideHeader.appendChild(removeBtn);
        }

        header.appendChild(titleSpan);
        header.appendChild(rightSideHeader);
        card.appendChild(header);

        // Body Section (Upload Zone / File Details)
        if (!doc.file) {
            const uploadZone = document.createElement('div');
            uploadZone.className = 'upload-zone';
            uploadZone.innerHTML = `
                <div class="upload-icon">📁</div>
                <div class="upload-text">${dict.uploadText}</div>
                <div class="upload-subtext">${dict.uploadSubtext}</div>
            `;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.className = 'file-input';
            fileInput.accept = '.png,.jpg,.jpeg,.pdf';
            
            uploadZone.addEventListener('click', () => fileInput.click());
            
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });
            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('dragover');
            });
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    handleFileSelect(doc.id, e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileSelect(doc.id, e.target.files[0]);
                }
            });

            card.appendChild(uploadZone);
            card.appendChild(fileInput);
        } else {
            const fileDisplay = document.createElement('div');
            fileDisplay.className = 'file-display';

            // Preview Thumbnail Box
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-container';
            previewContainer.id = `preview-${doc.id}`;
            previewContainer.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">Generating preview...</span>`;
            fileDisplay.appendChild(previewContainer);

            // File Info
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';

            const fileIcon = document.createElement('span');
            fileIcon.className = 'icon-file';
            fileIcon.textContent = doc.file.type === 'application/pdf' ? '📄' : '🖼️';

            const fileMeta = document.createElement('div');
            fileMeta.className = 'file-meta';
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = doc.file.name;
            fileName.title = doc.file.name;

            const fileSize = document.createElement('div');
            fileSize.className = 'file-size';
            fileSize.textContent = formatBytes(doc.file.size);

            fileMeta.appendChild(fileName);
            fileMeta.appendChild(fileSize);

            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn-clear-file';
            clearBtn.innerHTML = '🗑️';
            clearBtn.title = 'Clear File';
            clearBtn.addEventListener('click', () => {
                clearFile(doc.id);
            });

            fileInfo.appendChild(fileIcon);
            fileInfo.appendChild(fileMeta);
            fileInfo.appendChild(clearBtn);
            fileDisplay.appendChild(fileInfo);

            // Status indicator
            const progressWrapper = document.createElement('div');
            progressWrapper.className = 'progress-wrapper';

            const statusIndicator = document.createElement('div');
            statusIndicator.className = `status-indicator status-${doc.status}`;
            
            let statusText = dict.statusTextPending;
            if (doc.status === 'uploaded') statusText = dict.statusTextUploaded;
            if (doc.status === 'processing') statusText = dict.statusTextProcessing;
            if (doc.status === 'done') statusText = dict.statusTextDone;
            if (doc.status === 'error') statusText = dict.statusTextError;

            statusIndicator.innerHTML = `<span class="dot"></span> <span>${statusText}</span>`;
            progressWrapper.appendChild(statusIndicator);

            if (doc.status === 'processing') {
                const barContainer = document.createElement('div');
                barContainer.className = 'progress-bar-container';
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.width = '100%';
                progressBar.style.animation = 'blink 1.2s infinite ease-in-out';
                barContainer.appendChild(progressBar);
                progressWrapper.appendChild(barContainer);
            }

            fileDisplay.appendChild(progressWrapper);

            // Parsed Fields Display: ONLY SHOW AFTER AUTOMATIC FETCH IS COMPLETED (doc.status === 'done')
            if (doc.status === 'done') {
                const parsedFieldsDiv = document.createElement('div');
                parsedFieldsDiv.className = 'parsed-fields-mini animate-fade-in';

            parsedFieldsDiv.className = 'parsed-fields-mini';

            // 1. Name input row
            const nameRow = document.createElement('div');
            nameRow.className = 'parsed-field-row-input';
            nameRow.innerHTML = `
                <span class="parsed-label">${dict.fieldName}:</span>
                <input type="text" class="parsed-input" id="input-name-${doc.id}" value="${doc.name === 'N/A' ? '' : doc.name}" placeholder="${dict.inputPlaceholderName}">
            `;
            const nameInput = nameRow.querySelector('input');
            nameInput.addEventListener('input', (e) => {
                doc.name = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(nameRow);

            // 2. Gender row (Selector buttons + custom indicator)
            const genderRow = document.createElement('div');
            genderRow.className = 'parsed-field-row-input';
            const curGender = (doc.gender || 'N/A').toLowerCase();
            genderRow.innerHTML = `
                <span class="parsed-label">${dict.fieldGender}:</span>
                <div class="gender-btn-group" id="gender-group-${doc.id}">
                    <button type="button" class="gender-btn ${curGender === 'male' ? 'active male' : ''}" data-val="Male">👨 Male</button>
                    <button type="button" class="gender-btn ${curGender === 'female' ? 'active female' : ''}" data-val="Female">👩 Female</button>
                    <button type="button" class="gender-btn ${curGender === 'other' ? 'active other' : ''}" data-val="Other">⚧ Other</button>
                </div>
            `;
            const genderButtons = genderRow.querySelectorAll('.gender-btn');
            genderButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chosenVal = btn.getAttribute('data-val');
                    doc.gender = (doc.gender === chosenVal) ? 'N/A' : chosenVal;
                    renderDocumentGrid();
                    compileVerificationResults();
                });
            });
            parsedFieldsDiv.appendChild(genderRow);

            // 3. DOB input row
            const dobRow = document.createElement('div');
            dobRow.className = 'parsed-field-row-input';
            dobRow.innerHTML = `
                <span class="parsed-label">${dict.fieldDob}:</span>
                <input type="text" class="parsed-input" id="input-dob-${doc.id}" value="${doc.dob === 'N/A' ? '' : doc.dob}" placeholder="${dict.inputPlaceholderDob}">
            `;
            const dobInput = dobRow.querySelector('input');
            dobInput.addEventListener('input', (e) => {
                doc.dob = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(dobRow);

            // 4. Father's Name input row
            const fatherRow = document.createElement('div');
            fatherRow.className = 'parsed-field-row-input';
            fatherRow.innerHTML = `
                <span class="parsed-label">${dict.fieldFather}:</span>
                <input type="text" class="parsed-input" id="input-father-${doc.id}" value="${doc.fatherName === 'N/A' ? '' : doc.fatherName}" placeholder="${dict.inputPlaceholderFather}">
            `;
            const fatherInput = fatherRow.querySelector('input');
            fatherInput.addEventListener('input', (e) => {
                doc.fatherName = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(fatherRow);

            // 5. Document Number input row
            const docNumberRow = document.createElement('div');
            docNumberRow.className = 'parsed-field-row-input';
            docNumberRow.innerHTML = `
                <span class="parsed-label">${dict.fieldDocNumber}:</span>
                <input type="text" class="parsed-input" id="input-docnumber-${doc.id}" value="${doc.documentNumber === 'N/A' ? '' : doc.documentNumber}" placeholder="${dict.inputPlaceholderDocNumber}">
            `;
            const docNumberInput = docNumberRow.querySelector('input');
            docNumberInput.addEventListener('input', (e) => {
                doc.documentNumber = e.target.value.trim() || 'N/A';
                compileVerificationResults();
            });
            parsedFieldsDiv.appendChild(docNumberRow);
            
                fileDisplay.appendChild(parsedFieldsDiv);
            }
            card.appendChild(fileDisplay);

            setTimeout(() => generateThumbnail(doc), 50);
        }

        grid.appendChild(card);
    });

    // 4th Card: Add Custom Document Box (Right Next to 10th Marksheet)
    const addCard = document.createElement('article');
    addCard.className = 'doc-card add-custom-doc-card animate-fade-in';
    addCard.id = 'card-add-custom-doc';
    addCard.setAttribute('role', 'button');
    addCard.setAttribute('tabindex', '0');
    addCard.title = dict.modalTitle || 'Custom Document Add Karein';

    addCard.innerHTML = `
        <div class="doc-header">
            <span class="doc-title">➕ ${dict.addDoc || 'Custom Document'}</span>
            <span class="badge badge-optional">${dict.badgeOptional || 'Optional'}</span>
        </div>
        <div class="add-custom-box-inner">
            <div class="add-custom-icon">📑</div>
            <strong class="add-custom-title">${dict.addDoc || 'Custom Document Add Karein'}</strong>
            <p class="add-custom-desc">Voter ID, Driving License, Passport etc.</p>
            <span class="btn btn-secondary btn-sm add-custom-btn">
                <span>➕ Add Document</span>
            </span>
        </div>
    `;
    addCard.addEventListener('click', openModal);
    addCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });
    grid.appendChild(addCard);
}

// Compress and resize image files to lightweight JPEGs
function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => resolve(file);
            img.src = event.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

// Handling File Drop/Select
async function handleFileSelect(docId, file) {
    const limit = 15 * 1024 * 1024;
    if (file.size > limit) {
        alert("File size 15MB se kam honi chahiye!");
        return;
    }

    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        alert("Faqat PNG, JPG, JPEG, aur PDF support hote hain!");
        return;
    }

    let finalFile = file;
    if (file.type.startsWith('image/')) {
        finalFile = await compressImage(file);
    }

    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        documents[docIndex].file = finalFile;
        documents[docIndex].processedBlob = null;
        documents[docIndex].status = 'uploaded';
        documents[docIndex].progress = 0;
        documents[docIndex].rawText = '';
        documents[docIndex].name = 'N/A';
        documents[docIndex].gender = 'N/A';
        documents[docIndex].dob = 'N/A';
        documents[docIndex].fatherName = 'N/A';
        documents[docIndex].documentNumber = 'N/A';
        
        renderDocumentGrid();
        updateGlobalStatus();
        
        document.getElementById('raw-text-section').classList.add('hidden');
        
        const reportModal = document.getElementById('verification-report-section');
        if (reportModal) {
            reportModal.classList.add('hidden');
            reportModal.style.display = 'none';
        }

        if (finalFile.type === 'application/pdf') {
            generatePdfBlob(documents[docIndex]);
        }
        // Verification will only start when user clicks "Verify Documents"
    }
}

// Generate PDF Page 1 image blob on frontend side
async function generatePdfBlob(doc) {
    if (!pdfjsLib) return;
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            try {
                const typedarray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                const page = await pdf.getPage(1);
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: 1.5 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                canvas.toBlob((blob) => {
                    doc.processedBlob = blob;
                }, 'image/jpeg', 0.85);

            } catch (e) {
                console.error("PDF Blob generation failed", e);
            }
        };
        fileReader.readAsArrayBuffer(doc.file);
    } catch (err) {
        console.error(err);
    }
}

// Generate thumbnail previews for PDF/Images
async function generateThumbnail(doc) {
    const previewContainer = document.getElementById(`preview-${doc.id}`);
    if (!previewContainer) return;

    try {
        if (doc.file.type === 'application/pdf') {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    const page = await pdf.getPage(1);
                    
                    const canvas = document.createElement('canvas');
                    canvas.className = 'preview-canvas';
                    const context = canvas.getContext('2d');
                    
                    const viewport = page.getViewport({ scale: 0.6 });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(canvas);
                } catch (pdfErr) {
                    console.error("PDF thumbnail generation failed", pdfErr);
                    previewContainer.innerHTML = `<span style="color: var(--error); font-size: 0.8rem;">PDF render failed</span>`;
                }
            };
            fileReader.readAsArrayBuffer(doc.file);
        } else {
            const img = document.createElement('img');
            img.className = 'preview-image';
            img.src = URL.createObjectURL(doc.file);
            img.onload = () => {
                previewContainer.innerHTML = '';
                previewContainer.appendChild(img);
            };
            img.onerror = () => {
                previewContainer.innerHTML = `<span style="color: var(--error); font-size: 0.8rem;">Image load failed</span>`;
            };
        }
    } catch (e) {
        console.error(e);
        previewContainer.innerHTML = `<span style="color: var(--error); font-size: 0.8rem;">Preview failed</span>`;
    }
}

// Clear loaded file from document
function clearFile(docId) {
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        documents[docIndex].file = null;
        documents[docIndex].processedBlob = null;
        documents[docIndex].status = 'pending';
        documents[docIndex].progress = 0;
        documents[docIndex].rawText = '';
        documents[docIndex].name = 'N/A';
        documents[docIndex].gender = 'N/A';
        documents[docIndex].dob = 'N/A';
        documents[docIndex].fatherName = 'N/A';
        documents[docIndex].documentNumber = 'N/A';
        
        renderDocumentGrid();
        updateGlobalStatus();
        
        document.getElementById('raw-text-section').classList.add('hidden');
        
        const reportModal = document.getElementById('verification-report-section');
        if (reportModal) reportModal.classList.add('hidden');
    }
}

// Remove custom document fully
function removeDocument(docId) {
    documents = documents.filter(d => d.id !== docId);
    renderDocumentGrid();
    updateGlobalStatus();
    
    document.getElementById('raw-text-section').classList.add('hidden');
    
    const reportModal = document.getElementById('verification-report-section');
    if (reportModal) reportModal.classList.add('hidden');
}

// Global Status message updates & Button state toggles
function updateGlobalStatus() {
    const statusText = document.getElementById('global-status-text');
    const verifyBtn = document.getElementById('verify-all-btn');
    const dict = translations[currentLang] || translations.roman;

    const mandatoryDocs = documents.filter(d => d.mandatory);
    const mandatoryUploaded = mandatoryDocs.every(d => d.file !== null);
    const anyUploaded = documents.some(d => d.file !== null);

    if (!anyUploaded) {
        if (statusText) statusText.textContent = dict.statusInitial;
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.classList.remove('pulse-ready');
        }
    } else if (!mandatoryUploaded) {
        if (statusText) statusText.textContent = dict.statusNeedMandatory;
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.classList.remove('pulse-ready');
        }
    } else {
        if (statusText) statusText.textContent = dict.statusReady;
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.classList.add('pulse-ready');
        }
    }
}

function clearFile(docId) {
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        documents[docIndex].file = null;
        documents[docIndex].processedBlob = null;
        documents[docIndex].status = 'pending';
        documents[docIndex].progress = 0;
        documents[docIndex].rawText = '';
        documents[docIndex].name = 'N/A';
        documents[docIndex].gender = 'N/A';
        documents[docIndex].dob = 'N/A';
        documents[docIndex].fatherName = 'N/A';
        documents[docIndex].documentNumber = 'N/A';
        
        renderDocumentGrid();
        updateGlobalStatus();
        
        document.getElementById('raw-text-section').classList.add('hidden');
        
        const reportModal = document.getElementById('verification-report-section');
        if (reportModal) reportModal.classList.add('hidden');
    }
}

// Remove custom document fully
function removeDocument(docId) {
    documents = documents.filter(d => d.id !== docId);
    renderDocumentGrid();
    updateGlobalStatus();
    
    document.getElementById('raw-text-section').classList.add('hidden');
    
    const reportModal = document.getElementById('verification-report-section');
    if (reportModal) reportModal.classList.add('hidden');
}

// Global Status message updates & Button state toggles
function updateGlobalStatus() {
    const aadhaarUploaded = documents.find(d => d.id === 'aadhaar')?.file !== null;
    const panUploaded = documents.find(d => d.id === 'pan')?.file !== null;
    const verifyBtn = document.getElementById('verify-all-btn');
    const dict = translations[currentLang] || translations.roman;

    const mandatoryDocs = documents.filter(d => d.mandatory);
    const allMandatoryUploaded = mandatoryDocs.every(d => d.file !== null);

    if (!aadhaarUploaded || !panUploaded) {
        showGlobalMessage(dict.statusInitial, "info");
        verifyBtn.disabled = true;
    } else if (!allMandatoryUploaded) {
        showGlobalMessage(dict.statusNeedMandatory, "info");
        verifyBtn.disabled = true;
    } else {
        showGlobalMessage(dict.statusReady, "success");
        verifyBtn.disabled = false;
    }
}

// Reset application state
function resetAll() {
    documents.forEach((doc, idx) => {
        documents[idx].file = null;
        documents[idx].processedBlob = null;
        documents[idx].status = 'pending';
        documents[idx].progress = 0;
        documents[idx].rawText = '';
        documents[idx].name = 'N/A';
        documents[idx].gender = 'N/A';
        documents[idx].dob = 'N/A';
        documents[idx].fatherName = 'N/A';
        documents[idx].documentNumber = 'N/A';
    });

    documents = documents.slice(0, 3);
    renderDocumentGrid();
    updateGlobalStatus();

    document.getElementById('raw-text-section').classList.add('hidden');
    
    const reportModal = document.getElementById('verification-report-section');
    if (reportModal) reportModal.classList.add('hidden');

    // Hide top and bottom persistent action bars
    const topDl = document.getElementById('top-download-pdf-btn');
    if (topDl) topDl.classList.add('hidden');
    const topOpen = document.getElementById('top-open-report-btn');
    if (topOpen) topOpen.classList.add('hidden');
    // No persistent-bottom-bar needed
}

// Display messages in status banner
function showGlobalMessage(msg, type) {
    const banner = document.getElementById('global-status-message');
    const textEl = document.getElementById('global-status-text');
    if (!banner || !textEl) return;
    textEl.textContent = msg;

    banner.className = 'info-banner';
    if (type === 'success') banner.classList.add('success');
    if (type === 'error') banner.classList.add('error');
}

// Modal handling logic
function openModal() {
    const modal = document.getElementById('custom-doc-modal');
    if (!modal) {
        console.error("custom-doc-modal element not found in DOM");
        return;
    }
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
    
    const input = document.getElementById('custom-doc-title');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 60);
    }
    const chk = document.getElementById('custom-doc-mandatory');
    if (chk) chk.checked = false;
}
window.openModal = openModal;

function closeModal() {
    const modal = document.getElementById('custom-doc-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
}
window.closeModal = closeModal;

function handleAddCustomDoc() {
    const titleVal = document.getElementById('custom-doc-title').value.trim();
    const isMandatory = document.getElementById('custom-doc-mandatory').checked;

    if (!titleVal) {
        alert("Kripya document ka naam enter karein!");
        return;
    }

    const cleanId = 'custom-' + titleVal.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (documents.some(d => d.id === cleanId)) {
        alert("Yeh document pehle se majood hai!");
        return;
    }

    documents.push({
        id: cleanId,
        title: titleVal,
        mandatory: isMandatory,
        file: null,
        processedBlob: null,
        status: 'pending',
        progress: 0,
        rawText: '',
        name: 'N/A',
        gender: 'N/A',
        dob: 'N/A',
        fatherName: 'N/A',
        documentNumber: 'N/A'
    });

    closeModal();
    renderDocumentGrid();
    updateGlobalStatus();
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper to wait until PDF rendering finishes generating the image blob
function waitForBlob(doc) {
    return new Promise((resolve) => {
        if (doc.processedBlob) return resolve(doc.processedBlob);
        
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (doc.processedBlob) {
                clearInterval(interval);
                return resolve(doc.processedBlob);
            }
            if (attempts > 30) {
                clearInterval(interval);
                return resolve(doc.file);
            }
        }, 100);
    });
}

// MAIN PROCESS FLOW: Verification Loop calling Node.js Express Backend
async function performVerification() {
    verificationPerformed = true;
    const verifyBtn = document.getElementById('verify-all-btn');
    verifyBtn.disabled = true;
    
    // Process ALL documents that have files attached (Aadhaar, PAN, 10th Marksheet & any Custom docs)
    const docsToProcess = documents.filter(d => d.file !== null);

    try {
        const promises = docsToProcess.map(async (doc) => {
            doc.status = 'processing';
            renderDocumentGrid();

            const formData = new FormData();
            
            if (doc.file.type === 'application/pdf') {
                const pdfBlob = await waitForBlob(doc);
                formData.append('document', pdfBlob, `${doc.id}.jpg`);
            } else {
                formData.append('document', doc.file);
            }

            const headers = {};
            // Backend server automatically uses active Gemini API key from .env

            const response = await fetch('/api/verify-document', {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `${doc.title} verification failed.`);
            }

            const data = await response.json();

            doc.rawText = data.rawText;
            doc.name = data.name;
            doc.gender = data.gender || 'N/A';
            doc.dob = data.dob;
            doc.fatherName = data.fatherName;
            doc.documentNumber = data.documentNumber;
            doc.status = 'done';
            
            renderDocumentGrid();
        });

        await Promise.all(promises);
        compileVerificationResults();

    } catch (err) {
        console.error("AI Verification failed", err);
        let errorMsg = err.message || "Unknown error";
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            errorMsg = "Verification server is offline or unreachable! Make sure server.js is running on http://localhost:8080.";
        } else if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('too many requests')) {
            errorMsg = "Gemini API Key limit hit! Page ke top-right controls me apni personal Gemini API Key enter karein aur fir se verify karein.";
        }
        alert(`Verification error: ${errorMsg}`);
    } finally {
        verifyBtn.disabled = false;
        updateGlobalStatus();
    }
}

// STRING NORMALIZATION HELPERS
function normalizeString(str) {
    if (!str || str === 'N/A') return '';
    return str.toLowerCase()
              .replace(/[^a-z0-9]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
}

// Levenshtein Distance for spelling similarity
function calculateLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function calculateStringSimilarity(strA, strB) {
    const s1 = (strA || '').toUpperCase().trim();
    const s2 = (strB || '').toUpperCase().trim();
    if (s1 === s2) return 100;
    if (!s1 || !s2) return 0;
    
    const maxLen = Math.max(s1.length, s2.length);
    const dist = calculateLevenshteinDistance(s1, s2);
    const score = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
    return score;
}

// Character Alignment for Visual Diff (Highlights matching and differing letters)
function generateCharacterDiff(nameA, nameB) {
    const str1 = (nameA || '').toUpperCase().trim();
    const str2 = (nameB || '').toUpperCase().trim();
    
    const chars1 = [];
    const chars2 = [];
    
    let i = 0, j = 0;

    while (i < str1.length || j < str2.length) {
        const c1 = str1[i] || '';
        const c2 = str2[j] || '';

        if (c1 === c2) {
            chars1.push({ char: c1, type: 'match' });
            chars2.push({ char: c2, type: 'match' });
            i++; j++;
        } else {
            if (i + 1 < str1.length && str1[i + 1] === c2) {
                chars1.push({ char: c1, type: 'diff' });
                chars2.push({ char: ' ', type: 'missing' });
                i++;
            } else if (j + 1 < str2.length && str2[j + 1] === c1) {
                chars1.push({ char: ' ', type: 'missing' });
                chars2.push({ char: c2, type: 'diff' });
                j++;
            } else {
                chars1.push({ char: c1, type: 'diff' });
                chars2.push({ char: c2, type: 'diff' });
                i++; j++;
            }
        }
    }

    return { diffA: chars1, diffB: chars2 };
}

// Helper: build HTML character badges from diff array
function renderLetterBadgesHtml(diffList) {
    return diffList.map(item => {
        if (item.char === ' ') return '<span class="char-box char-space">&nbsp;</span>';
        let cls = 'char-box';
        if (item.type === 'match') cls += ' char-match';
        else if (item.type === 'diff') cls += ' char-diff';
        else if (item.type === 'missing') cls += ' char-missing';
        return `<span class="${cls}" title="${item.type === 'diff' ? 'Letter discrepancy' : ''}">${item.char}</span>`;
    }).join('');
}

// Compile extracted data, compare ALL documents (Aadhaar, PAN, 10th Marksheet, Custom), & activate Persistent Options
function compileVerificationResults() {
    if (!verificationPerformed) return;
    // Collect all documents that have been verified OR have data entered
    const activeDocs = documents.filter(d => 
        (d.file !== null && d.status === 'done') || 
        (d.name && d.name !== 'N/A' && d.name.trim() !== '') ||
        (d.status === 'done')
    );

    const dict = translations[currentLang] || translations.roman;
    const reportModal = document.getElementById('verification-report-section');
    if (!reportModal) return;

    if (activeDocs.length === 0) {
        reportModal.classList.add('hidden');
        return;
    }

    // ACTIVATE TOP DOWNLOAD & VIEW BUTTONS
    const topDl = document.getElementById('top-download-pdf-btn');
    if (topDl) topDl.classList.remove('hidden');

    const topOpen = document.getElementById('top-open-report-btn');
    if (topOpen) topOpen.classList.remove('hidden');

    // Set Report Timestamp
    const timeMeta = document.getElementById('report-timestamp-meta');
    if (timeMeta) {
        const now = new Date();
        timeMeta.textContent = `Audited on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} | Documents Verified: ${activeDocs.length}`;
    }

    // Dynamic Headers for Table (Columns for EVERY verified document)
    const inlineHeaderRow = document.getElementById('inline-report-table-header');
    const headersHtml = [`<th>${dict.field}</th>`];
    activeDocs.forEach(doc => {
        let translatedTitle = doc.title;
        if (doc.id === 'aadhaar') translatedTitle = dict.aadhaarTitle || doc.title;
        else if (doc.id === 'pan') translatedTitle = dict.panTitle || doc.title;
        else if (doc.id === 'marksheet') translatedTitle = dict.marksheetTitle || doc.title;
        headersHtml.push(`<th>${translatedTitle}</th>`);
    });
    headersHtml.push(`<th>${dict.statusCol}</th>`);
    if (inlineHeaderRow) inlineHeaderRow.innerHTML = headersHtml.join('');

    // Fields to compare (Includes GENDER!)
    const fields = [
        { label: dict.fieldName, key: 'name', type: 'name' },
        { label: dict.fieldGender, key: 'gender', type: 'gender' },
        { label: dict.fieldDob, key: 'dob', type: 'dob' },
        { label: dict.fieldFather, key: 'fatherName', type: 'name' },
        { label: dict.fieldDocNumber, key: 'documentNumber', noCompare: true }
    ];

    const inlineTbody = document.getElementById('inline-comparison-table-body');
    if (inlineTbody) inlineTbody.innerHTML = '';

    let totalMismatches = 0;
    let nameComparisonData = [];
    let genderComparisonData = [];

    fields.forEach(field => {
        const row = document.createElement('tr');
        
        // Field Label column
        const labelTd = document.createElement('td');
        labelTd.className = 'field-name-col';
        labelTd.innerHTML = `<strong>${field.label}</strong>`;
        row.appendChild(labelTd);

        // Document values columns
        const values = [];
        activeDocs.forEach(doc => {
            const valTd = document.createElement('td');
            const rawVal = doc[field.key] || 'N/A';
            
            if (field.type === 'gender') {
                if (rawVal !== 'N/A') {
                    const gLow = rawVal.toLowerCase();
                    let icon = '⚧';
                    if (gLow === 'male') icon = '👨';
                    if (gLow === 'female') icon = '👩';
                    valTd.innerHTML = `<span class="gender-badge ${gLow}">${icon} ${rawVal}</span>`;
                } else {
                    valTd.innerHTML = `<span class="gender-badge na" style="opacity: 0.7;">⚠️ Not Specified</span>`;
                }
            } else {
                valTd.textContent = rawVal;
            }
            row.appendChild(valTd);

            if (rawVal && rawVal !== 'N/A') {
                values.push({
                    docId: doc.id,
                    docTitle: doc.title,
                    val: rawVal.toUpperCase().trim()
                });
            }
        });

        // Status column logic
        const statusTd = document.createElement('td');
        let statusHtml = '';

        if (field.noCompare) {
            statusHtml = `<span class="status-badge ignored">${dict.infoOnly}</span>`;
        } else if (values.length < 2) {
            statusHtml = `<span class="status-badge ignored">${dict.ignoredBadge}</span>`;
        } else {
            if (field.type === 'name' || field.key === 'fatherName') {
                if (field.key === 'fatherName') {
                    // Father comparison data
                } else {
                    nameComparisonData = values;
                }
                // Check all pairs against the first document
                const firstVal = values[0].val;
                const allNamesMatch = values.every(v => v.val === firstVal);

                if (allNamesMatch) {
                    statusHtml = `<span class="status-badge match">✓ 100% Match</span>`;
                } else {
                    // Calculate minimum similarity among documents
                    const minSim = Math.min(...values.slice(1).map(v => calculateStringSimilarity(firstVal, v.val)));
                    if (minSim >= 80) {
                        statusHtml = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">⚠️ ${minSim}% (Spelling Typo)</span>`;
                    } else {
                        statusHtml = `<span class="status-badge mismatch">✗ ${minSim}% Mismatch</span>`;
                    }
                    totalMismatches++;
                }
            } else if (field.type === 'gender') {
                genderComparisonData = values;
                const firstG = values[0].val.toLowerCase();
                const isGenderMatch = values.every(v => v.val.toLowerCase() === firstG);
                if (isGenderMatch) {
                    statusHtml = `<span class="status-badge match">✓ ${dict.genderMatch}</span>`;
                } else {
                    statusHtml = `<span class="status-badge mismatch">✗ ${dict.genderMismatch}</span>`;
                    totalMismatches++;
                }
            } else {
                const norm0 = normalizeString(values[0].val);
                const isMatch = values.every(v => normalizeString(v.val) === norm0);
                if (isMatch) {
                    statusHtml = `<span class="status-badge match">${dict.matchBadge}</span>`;
                } else {
                    statusHtml = `<span class="status-badge mismatch">${dict.mismatchBadge}</span>`;
                    totalMismatches++;
                }
            }
        }

        statusTd.innerHTML = statusHtml;
        row.appendChild(statusTd);
        if (inlineTbody) inlineTbody.appendChild(row);
    });

    // Render Verdict Banner & Update Bottom Bar Status
    const inlineVerdictBanner = document.getElementById('inline-verdict-banner');
    if (inlineVerdictBanner) {
        inlineVerdictBanner.className = 'verdict-banner';
        if (totalMismatches > 0) {
            inlineVerdictBanner.classList.add('verdict-error');
            inlineVerdictBanner.innerHTML = `⚠️ <strong>${dict.verdictError}</strong> (${totalMismatches} Discrepancy Found across ${activeDocs.length} documents)`;
            // Mismatch verdict handled
        } else {
            inlineVerdictBanner.classList.add('verdict-success');
            inlineVerdictBanner.innerHTML = `✅ <strong>${dict.verdictSuccess}</strong> (All ${activeDocs.length} Documents 100% PSK Compliant)`;
            // Match verdict handled
        }
    }

    // Render Smart Name & Spelling Analysis Box (Supports Aadhaar, PAN, 10th Marksheet & Custom Docs)
    renderSmartNameAnalysis(nameComparisonData);

    // Render Gender Analysis Box
    renderGenderAnalysis(genderComparisonData);

    // Render Raw Text logs
    const rawContainer = document.getElementById('raw-text-container');
    if (rawContainer) {
        rawContainer.innerHTML = '';
        activeDocs.forEach(doc => {
            const rawCard = document.createElement('div');
            rawCard.className = 'raw-text-card';
            rawCard.innerHTML = `
                <h4>${doc.title}</h4>
                <div class="raw-text-content">${doc.rawText || 'No text extracted.'}</div>
            `;
            rawContainer.appendChild(rawCard);
        });
    }

    // Update Consultant Ad Banner based on verification results (whether match or mismatch)
    updateConsultationAd(totalMismatches > 0, totalMismatches, activeDocs.length);

    
    // Auto-Log Verification Session to Admin Portal CRM with Applicant Mobile Number
    const userPhone = (document.getElementById('applicant-phone-input')?.value || localStorage.getItem('applicantPhone') || '').trim();
    try {
        fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                applicantName: activeDocs[0]?.name || 'Unknown Applicant',
                applicantPhone: userPhone,
                documentsVerified: activeDocs.map(d => d.title),
                status: totalMismatches > 0 ? `⚠️ ${totalMismatches} Discrepancies` : '✓ 100% Match',
                hasMismatch: totalMismatches > 0,
                mismatchCount: totalMismatches,
                notes: totalMismatches > 0 ? 'Document discrepancy detected across records' : 'All documents verified & PSK compliant'
            })
        }).catch(() => {});
    } catch (logErr) {}

    // Show the Inline Report Section & Smoothly Scroll down to it!
    reportModal.classList.remove('hidden');
    reportModal.style.removeProperty('display');
    reportModal.style.display = 'block';
    setTimeout(() => {
        reportModal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
}

// Render the interactive Smart Name & Spelling Difference Analysis Box across ALL verified documents
function renderSmartNameAnalysis(nameData) {
    const box = document.getElementById('smart-name-analysis-box');
    if (!box) return;

    if (!nameData || nameData.length < 2) {
        box.classList.add('hidden');
        return;
    }

    box.classList.remove('hidden');
    const primaryDoc = nameData[0]; // Primary reference (e.g. Aadhaar Card)

    // Calculate overall match status across all documents
    let minSim = 100;
    let anyMismatch = false;

    // Build diff cards for EVERY document
    let cardsHtml = '';

    // 1. Primary document card
    const primaryChars = primaryDoc.val.split('').map(c => ({ char: c, type: 'match' }));
    cardsHtml += `
        <div class="diff-doc-card">
            <div class="diff-doc-name">
                <span>📄 <strong>${primaryDoc.docTitle}</strong></span>
                <span class="diff-doc-badge-status match">Primary Source</span>
            </div>
            <div class="diff-letters-row">${renderLetterBadgesHtml(primaryChars)}</div>
        </div>
    `;

    // 2. Subsequent document cards (PAN, 10th Marksheet, Custom docs)
    const discrepancyNotes = [];

    for (let k = 1; k < nameData.length; k++) {
        const compareDoc = nameData[k];
        const sim = calculateStringSimilarity(primaryDoc.val, compareDoc.val);
        if (sim < minSim) minSim = sim;
        if (sim < 100) anyMismatch = true;

        const { diffA, diffB } = generateCharacterDiff(primaryDoc.val, compareDoc.val);
        const isMatch = sim === 100;

        cardsHtml += `
            <div class="diff-doc-card">
                <div class="diff-doc-name">
                    <span>📄 <strong>${compareDoc.docTitle}</strong></span>
                    <span class="diff-doc-badge-status ${isMatch ? 'match' : 'diff'}">${isMatch ? '100% Match' : `${sim}% Match`}</span>
                </div>
                <div class="diff-letters-row">${renderLetterBadgesHtml(diffB)}</div>
            </div>
        `;

        if (!isMatch) {
            discrepancyNotes.push(`
                <li><strong>${compareDoc.docTitle}</strong> vs <strong>${primaryDoc.docTitle}</strong>: ${sim}% similarity ("${compareDoc.val}" vs "${primaryDoc.val}").</li>
            `);
        }
    }

    let meterClass = 'high';
    let badgeText = `Exact Match (100% across all ${nameData.length} documents)`;
    if (minSim < 100 && minSim >= 75) {
        meterClass = 'medium';
        badgeText = `Minor Spelling Typo (${minSim}% Similarity)`;
    } else if (minSim < 75) {
        meterClass = 'low';
        badgeText = `Critical Name Mismatch (${minSim}% Similarity)`;
    }

    let explanationHtml = '';
    if (!anyMismatch) {
        explanationHtml = `
            <div class="diff-callout diff-success">
                <div class="diff-callout-title">✓ Sabhi documents me naam 100% bilkul identical match ho raha hai!</div>
                <div class="diff-callout-desc">
                    ${nameData.map(d => `<strong>${d.docTitle}</strong>`).join(', ')} me applicant ka naam ekdum same hai (<strong>${primaryDoc.val}</strong>). Koi spelling galti nahi hai.
                </div>
                <div class="diff-psk-action">✓ Passport Seva Kendra (PSK) me koi affidavit ki zaroorat nahi hogi. Application ready hai!</div>
            </div>
        `;
    } else if (minSim >= 75) {
        explanationHtml = `
            <div class="diff-callout">
                <div class="diff-callout-title">⚠️ Documents ke beech spelling me farq (Typo) paya gaya hai!</div>
                <div class="diff-callout-desc">
                    <ul style="padding-left: 18px; margin: 6px 0;">
                        ${discrepancyNotes.join('')}
                    </ul>
                    Upar highlight kiye gaye red character(s) par dhyan dein.
                </div>
                <div class="diff-psk-action">
                    📌 <strong>Passport Seva Kendra (PSK) Advisory:</strong> Passport application me exact spelling mangte hain. Agar 10th Marksheet aur Aadhaar/PAN me 1-2 letters ka farq hai to <em>Annexure-D One and the Same Person Affidavit</em> lag sakta hai, ya fir document update karwana behtar hoga.
                </div>
            </div>
        `;
    } else {
        explanationHtml = `
            <div class="diff-callout diff-danger">
                <div class="diff-callout-title">🚨 Bada Naam Mismatch Payi Gayi Hai!</div>
                <div class="diff-callout-desc">
                    <ul style="padding-left: 18px; margin: 6px 0;">
                        ${discrepancyNotes.join('')}
                    </ul>
                    Documents me alag-alag vyaktiyon ka naam darj hai (Faqat <strong>${minSim}% minimum match</strong>)!
                </div>
                <div class="diff-psk-action">
                    ❌ <strong>Action Required:</strong> Aise case me Passport application foran reject ho jayegi. Kripya ek hi vyakti ke valid documents upload karein.
                </div>
            </div>
        `;
    }

    box.innerHTML = `
        <div class="smart-analysis-header">
            <div class="smart-analysis-title">
                <span>🔍</span> Smart Name Spelling Analysis (Letter-by-Letter Diff across ${nameData.length} Docs)
            </div>
            <div class="similarity-badge ${meterClass}">
                ${badgeText}
            </div>
        </div>

        <div class="similarity-meter-wrap">
            <div class="meter-labels">
                <span>Overall Spelling Match Accuracy</span>
                <span><strong>${minSim}%</strong></span>
            </div>
            <div class="meter-track">
                <div class="meter-fill ${meterClass}" style="width: ${minSim}%"></div>
            </div>
        </div>

        <div class="diff-documents-grid">
            ${cardsHtml}
        </div>

        ${explanationHtml}
    `;
}

// Render Gender Analysis Box
function renderGenderAnalysis(genderData) {
    const box = document.getElementById('gender-analysis-box');
    if (!box) return;

    if (!genderData || genderData.length < 2) {
        box.classList.add('hidden');
        return;
    }

    box.classList.remove('hidden');
    const firstG = genderData[0].val.toLowerCase();
    const isGenderMatch = genderData.every(v => v.val.toLowerCase() === firstG);

    let docBadges = genderData.map(g => {
        const gl = g.val.toLowerCase();
        let icon = (gl === 'female') ? '👩' : (gl === 'male' ? '👨' : '⚧');
        return `<span class="gender-badge ${gl}">${g.docTitle}: ${icon} ${g.val}</span>`;
    }).join(' ');

    if (isGenderMatch) {
        box.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2rem;">🧑‍💼</span>
                <div>
                    <strong style="color: #34d399;">Gender Verification Passed:</strong>
                    <span style="font-size: 0.85rem; color: var(--text-main); margin-left: 6px;">Sabhi ${genderData.length} documents me Gender consistent hai.</span>
                </div>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">${docBadges}</div>
        `;
    } else {
        box.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2rem;">⚠️</span>
                <div>
                    <strong style="color: #f87171;">Gender Mismatch Alert:</strong>
                    <span style="font-size: 0.85rem; color: var(--text-main); margin-left: 6px;">Documents ke beech alag-alag Gender darj hai!</span>
                </div>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">${docBadges}</div>
        `;
    }
}

// Prepare Printable PDF Template across ALL verified documents (Aadhaar, PAN, 10th Marksheet, Custom)
// Helper function: Render Smart Spelling Diff matrix inside printable PDF
function renderPdfSpellingDiffSection(activeDocs) {
    if (!activeDocs || activeDocs.length < 2) return '';

    const primaryDoc = activeDocs[0];
    const pName = (primaryDoc.name || '').toUpperCase().trim();
    if (!pName || pName === 'N/A') return '';

    let diffHtml = `
        <div class="pdf-section-title">Smart Spelling Analysis (Letter-by-Letter Diff across Documents)</div>
        <div class="pdf-diff-container">
            <div class="pdf-diff-doc-row">
                <div class="pdf-diff-doc-title">
                    <strong>📄 ${primaryDoc.title} (Primary Source Reference):</strong>
                </div>
                <div class="pdf-letter-boxes-wrap">
                    ${pName.split('').map(c => {
                        if (c === ' ') return '<span class="pdf-letter-chip chip-space">&nbsp;</span>';
                        return `<span class="pdf-letter-chip chip-match">${c}</span>`;
                    }).join('')}
                </div>
            </div>
    `;

    for (let i = 1; i < activeDocs.length; i++) {
        const doc = activeDocs[i];
        const cName = (doc.name || '').toUpperCase().trim();
        if (!cName || cName === 'N/A') continue;

        const sim = calculateStringSimilarity(pName, cName);
        const { diffA, diffB } = generateCharacterDiff(pName, cName);

        diffHtml += `
            <div class="pdf-diff-doc-row" style="margin-top: 10px;">
                <div class="pdf-diff-doc-title" style="display: flex; justify-content: space-between;">
                    <span><strong>📄 ${doc.title}:</strong></span>
                    <span style="font-weight: 700; color: ${sim === 100 ? '#15803d' : (sim >= 80 ? '#d97706' : '#b91c1c')}; font-size: 0.78rem;">
                        ${sim === 100 ? '✓ 100% Exact Match' : `⚠️ ${sim}% Match (${100 - sim}% Discrepancy)`}
                    </span>
                </div>
                <div class="pdf-letter-boxes-wrap">
                    ${diffB.map(item => {
                        if (item.char === ' ') return '<span class="pdf-letter-chip chip-space">&nbsp;</span>';
                        const cls = item.type === 'match' ? 'chip-match' : 'chip-diff';
                        return `<span class="pdf-letter-chip ${cls}">${item.char}</span>`;
                    }).join('')}
                </div>
                ${sim < 100 ? `<div style="font-size: 0.75rem; color: #b91c1c; margin-top: 4px; font-weight: 600;">⚠️ Discrepancy: "${cName}" vs "${pName}" (${sim}% similarity). Green = Matched, Red = Discrepant.</div>` : ''}
            </div>
        `;
    }

    // Also check Father's Name mismatch across documents
    const f1 = (primaryDoc.fatherName || '').toUpperCase().trim();
    const otherWithFather = activeDocs.slice(1).find(d => d.fatherName && d.fatherName !== 'N/A');
    if (otherWithFather && f1 && f1 !== 'N/A') {
        const f2 = (otherWithFather.fatherName || '').toUpperCase().trim();
        if (f1 !== f2) {
            const fSim = calculateStringSimilarity(f1, f2);
            const { diffB: fDiffB } = generateCharacterDiff(f1, f2);
            diffHtml += `
                <div class="pdf-diff-doc-row" style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                    <div class="pdf-diff-doc-title" style="display: flex; justify-content: space-between;">
                        <span><strong>👨 Father's Name Diff (${primaryDoc.title} vs ${otherWithFather.title}):</strong></span>
                        <span style="font-weight: 700; color: #b91c1c; font-size: 0.78rem;">⚠️ ${fSim}% Match</span>
                    </div>
                    <div class="pdf-letter-boxes-wrap">
                        ${fDiffB.map(item => {
                            if (item.char === ' ') return '<span class="pdf-letter-chip chip-space">&nbsp;</span>';
                            const cls = item.type === 'match' ? 'chip-match' : 'chip-diff';
                            return `<span class="pdf-letter-chip ${cls}">${item.char}</span>`;
                        }).join('')}
                    </div>
                    <div style="font-size: 0.75rem; color: #b91c1c; margin-top: 4px; font-weight: 600;">⚠️ Father Name Mismatch: "${f2}" vs "${f1}". Requires Annexure Affidavit or standard correction before passport filing.</div>
                </div>
            `;
        }
    }

    diffHtml += `</div>`;
    return diffHtml;
}

function preparePrintablePdfTemplate() {
    const activeDocs = documents.filter(d => 
        (d.file !== null && d.status === 'done') || 
        (d.name && d.name !== 'N/A' && d.name.trim() !== '') ||
        (d.status === 'done')
    );

    const pdfContainer = document.getElementById('pdf-report-content');
    if (!pdfContainer) return;

    const applicantDoc = activeDocs[0] || {};
    const applicantName = applicantDoc.name || 'APPLICANT';
    const applicantGender = applicantDoc.gender || 'N/A';
    const applicantDob = applicantDoc.dob || 'N/A';

    // Calculate overall status
    let totalMismatches = 0;
    const names = activeDocs.map(d => (d.name || '').toUpperCase().trim()).filter(n => n && n !== 'N/A');
    const genders = activeDocs.map(d => (d.gender || '').toUpperCase().trim()).filter(g => g && g !== 'N/A');
    const dobs = activeDocs.map(d => (d.dob || '').trim()).filter(d => d && d !== 'N/A');
    const fathers = activeDocs.map(d => (d.fatherName || '').toUpperCase().trim()).filter(f => f && f !== 'N/A');

    const nameMatch = names.length >= 2 ? names.every(n => n === names[0]) : true;
    const genderMatch = genders.length >= 2 ? genders.every(g => g === genders[0]) : true;
    const dobMatch = dobs.length >= 2 ? dobs.every(d => d === dobs[0]) : true;
    const fatherMatch = fathers.length >= 2 ? fathers.every(f => normalizeString(f) === normalizeString(fathers[0])) : true;

    if (!nameMatch && names.length >= 2) totalMismatches++;
    if (!genderMatch && genders.length >= 2) totalMismatches++;
    if (!dobMatch && dobs.length >= 2) totalMismatches++;
    if (!fatherMatch && fathers.length >= 2) totalMismatches++;

    let stampClass = 'pass';
    let stampText = 'PASSED & APPROVED';
    if (totalMismatches > 0) {
        if (!nameMatch && names.length >= 2 && calculateStringSimilarity(names[0], names[1]) >= 75) {
            stampClass = 'review';
            stampText = 'REVIEW: SPELLING DISCREPANCY';
        } else {
            stampClass = 'fail';
            stampText = 'FAILED: CRITICAL MISMATCH';
        }
    }

    const refNo = 'PSK-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Comparison column status formatting
    let nameAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">N/A</span></td>';
    if (names.length >= 2) {
        if (nameMatch) {
            nameAuditTd = '<td style="text-align: center;"><strong style="color: #15803d;">MATCH</strong></td>';
        } else {
            const nSim = calculateStringSimilarity(names[0], names[1]);
            nameAuditTd = `<td style="text-align: center;"><strong style="color: #b91c1c; white-space: nowrap;">MISMATCH (${nSim}%)</strong></td>`;
        }
    } else if (names.length === 1) {
        nameAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">Single Record</span></td>';
    }

    let genderAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">Not Specified</span></td>';
    if (genders.length >= 2) {
        genderAuditTd = genderMatch ? '<td style="text-align: center;"><strong style="color: #15803d;">MATCH</strong></td>' : '<td style="text-align: center;"><strong style="color: #b91c1c;">MISMATCH</strong></td>';
    } else if (genders.length === 1) {
        genderAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">Info Only</span></td>';
    }

    let dobAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">Not Specified</span></td>';
    if (dobs.length >= 2) {
        dobAuditTd = dobMatch ? '<td style="text-align: center;"><strong style="color: #15803d;">MATCH</strong></td>' : '<td style="text-align: center;"><strong style="color: #b91c1c;">MISMATCH</strong></td>';
    } else if (dobs.length === 1) {
        dobAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">Info Only</span></td>';
    }

    let fatherAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">Not Specified</span></td>';
    if (fathers.length >= 2) {
        if (fatherMatch) {
            fatherAuditTd = '<td style="text-align: center;"><strong style="color: #15803d;">MATCH</strong></td>';
        } else {
            const fSim = calculateStringSimilarity(fathers[0], fathers[1]);
            fatherAuditTd = `<td style="text-align: center;"><strong style="color: #b91c1c; white-space: nowrap;">MISMATCH (${fSim}%)</strong></td>`;
        }
    } else if (fathers.length === 1) {
        fatherAuditTd = '<td style="text-align: center;"><span style="color: #64748b;">Single Record</span></td>';
    }

    const docColWidth = Math.floor(54 / Math.max(activeDocs.length, 1));
    const rowsHtml = [
        `<tr><td><strong>Applicant Name</strong></td>${activeDocs.map(d => `<td>${d.name || 'N/A'}</td>`).join('')}${nameAuditTd}</tr>`,
        `<tr><td><strong>Gender (Sex)</strong></td>${activeDocs.map(d => `<td>${d.gender || 'N/A'}</td>`).join('')}${genderAuditTd}</tr>`,
        `<tr><td><strong>Date of Birth (DOB)</strong></td>${activeDocs.map(d => `<td>${d.dob || 'N/A'}</td>`).join('')}${dobAuditTd}</tr>`,
        `<tr><td><strong>Father\'s Name</strong></td>${activeDocs.map(d => `<td>${d.fatherName || 'N/A'}</td>`).join('')}${fatherAuditTd}</tr>`,
        `<tr><td><strong>Document ID / Number</strong></td>${activeDocs.map(d => `<td>${d.documentNumber || 'N/A'}</td>`).join('')}<td style="text-align: center;"><span style="color: #64748b;">-- (Document IDs)</span></td></tr>`
    ].join('');

    pdfContainer.innerHTML = `
        <div class="pdf-header-band">
            <div class="pdf-logo-area">
                <span class="pdf-emblem">🛂</span>
                <div class="pdf-header-text">
                    <div class="pdf-shop-branding">EXCELLENCE SERVICES &bull; PASSPORT VERIFICATION AUDIT DESK</div>
                    <h1>PASSPORT DOCUMENT CROSS-VERIFICATION AUDIT REPORT</h1>
                    <p>Official Verification Certificate for Indian Passport Application</p>
                    <div class="pdf-shop-contact">📞 Helpline / Contact: <strong>7849008882</strong> &bull; <strong>9620746029</strong></div>
                </div>
            </div>
            <div class="pdf-status-stamp">
                <span class="pdf-stamp-badge ${stampClass}">${stampText}</span>
            </div>
        </div>

        <table class="pdf-meta-table">
            <tr>
                <td class="meta-label">Audit Ref ID:</td>
                <td class="meta-value">${refNo}</td>
                <td class="meta-label">Audit Date:</td>
                <td class="meta-value">${dateStr}</td>
            </tr>
            <tr>
                <td class="meta-label">Applicant Name:</td>
                <td class="meta-value">${applicantName}</td>
                <td class="meta-label">Gender / DOB:</td>
                <td class="meta-value">${applicantGender} | ${applicantDob}</td>
            </tr>
        </table>

        <div class="pdf-section-title">Verified Documents Cross-Comparison Matrix (${activeDocs.length} Documents)</div>
        <table class="pdf-data-table">
            <thead>
                <tr>
                    <th style="width: 24%;">Field Description</th>
                    ${activeDocs.map(d => `<th style="width: ${docColWidth}%;">${d.title}</th>`).join('')}
                    <th style="width: 22%; text-align: center;">Audit Status</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        ${renderPdfSpellingDiffSection(activeDocs)}

        <div class="pdf-section-title">Spelling & PSK Compliance Findings</div>
        <div class="pdf-audit-notes">
            <p style="margin: 0 0 3px 0;"><strong>Name Spelling Verification:</strong> ${nameMatch ? `All ${activeDocs.length} documents contain identical matching name spelling.` : `Discrepancy detected across records. In accordance with Passport Seva guidelines, any minor spelling variation requires Annexure-D One & Same Person affidavit before submission.`}</p>
            <p style="margin: 0 0 3px 0;"><strong>Father's Name Verification:</strong> ${fathers.length >= 2 ? (fatherMatch ? 'Father\'s name is consistent across all provided documents.' : `Discrepancy detected in Father's Name ("${fathers.join('" vs "')}"). Correction or Annexure-D affidavit required.`) : 'Father\'s name recorded for verification.'}</p>
            <p style="margin: 0 0 3px 0;"><strong>Gender Consistency:</strong> ${genderMatch ? 'Gender is consistent across provided documents.' : 'Gender mismatch observed between records. Correction required.'}</p>
            <p style="margin: 0;"><strong>DOB Standard:</strong> Verified against records. 10th Marksheet/Birth Certificate takes precedence for official passport issuance.</p>
        </div>

        <div class="pdf-footer-band">
            <div style="font-size: 0.72rem; color: #64748b; max-width: 440px; line-height: 1.35;">
                <em>This audit report is generated automatically by AI KYC OCR Engine for Passport Document pre-screening verification at Excellence Services.</em>
            </div>
            <div class="pdf-sign-box">
                <div class="pdf-sign-line">Authorized Verifier / Stamp</div>
            </div>
        </div>
    `;
}

let isGeneratingPdf = false;
async function generatePdfReport() {
    if (isGeneratingPdf) {
        console.log("PDF generation already in progress, ignoring duplicate click");
        return;
    }
    isGeneratingPdf = true;

    preparePrintablePdfTemplate();
    const pdfContentEl = document.getElementById('pdf-report-content');
    const wrapper = document.getElementById('printable-pdf-container');
    
    if (!pdfContentEl || !wrapper) {
        alert("Report container not found!");
        isGeneratingPdf = false;
        return;
    }

    const activeDocs = documents.filter(d => 
        (d.file !== null && d.status === 'done') || 
        (d.name && d.name !== 'N/A' && d.name.trim() !== '') ||
        (d.status === 'done')
    );
    const applicantName = (activeDocs[0]?.name || 'Applicant').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Passport_Verification_Report_${applicantName}_${Date.now()}.pdf`;

    wrapper.style.display = 'block';

    const opt = {
        margin: [8, 8, 8, 8],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#ffffff',
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            width: 700,
            windowWidth: 700
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const dlBtn = document.getElementById('download-pdf-btn');
    const topDlBtn = document.getElementById('top-download-pdf-btn');
    if (dlBtn) dlBtn.innerHTML = '<span>⏳</span> Preparing PDF...';
    if (topDlBtn) topDlBtn.innerHTML = '<span>⏳</span> Preparing PDF...';

    try {
        if (window.html2pdf) {
            const worker = html2pdf().set(opt).from(pdfContentEl);
            const pdfBase64 = await worker.outputPdf('datauristring');

            let downloaded = false;

            // 1. Android APK Native Bridge (Direct save to phone Downloads)
            if (window.AndroidBridge && typeof window.AndroidBridge.downloadPdf === 'function') {
                try {
                    window.AndroidBridge.downloadPdf(pdfBase64, fileName);
                    downloaded = true;
                } catch (bridgeErr) {
                    console.warn("AndroidBridge downloadPdf error:", bridgeErr);
                }
            } else if (window.AndroidBridge && typeof window.AndroidBridge.saveAndSharePdf === 'function') {
                try {
                    window.AndroidBridge.saveAndSharePdf(pdfBase64, fileName);
                    downloaded = true;
                } catch (bridgeErr) {
                    console.warn("AndroidBridge saveAndSharePdf error:", bridgeErr);
                }
            }

            // 2. Background server archival (Saves copy on server without duplicate client download)
            fetch('/api/save-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfBase64, filename: fileName })
            }).catch(e => console.warn("Background server save:", e));

            // 3. Client Download (EXACTLY ONCE)
            if (!downloaded) {
                await worker.save();
                downloaded = true;
            }
        } else {
            window.print();
        }
    } catch (err) {
        console.error("PDF generation failed:", err);
        window.print();
    } finally {
        wrapper.style.display = 'none';
        if (dlBtn) dlBtn.innerHTML = '<span>📥</span> <span id="i18n-download-pdf">Download PDF Report</span>';
        if (topDlBtn) topDlBtn.innerHTML = '<span>📥</span> <span id="i18n-top-dl-pdf">Download PDF Report</span>';
        setTimeout(() => {
            isGeneratingPdf = false;
        }, 1500);
    }
}

// Self-clearing Service Worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let r of registrations) { r.unregister(); }
    });
}


// ==========================================================================
// autoFetch removed to avoid premature verification

// ==========================================================================
// DYNAMIC SHOP & CONTACT PROFILE LOADER (From /api/shop-info)
// ==========================================================================
async function loadShopInfo() {
    try {
        const res = await fetch('/api/shop-info');
        if (!res.ok) return;
        const info = await res.json();

        const dynamicContainer = document.getElementById('shop-info-dynamic-container');
        const badgeWrapper = document.getElementById('promo-badge-wrapper');
        const shopBadge = document.getElementById('promo-shop-badge');
        const shopLocation = document.getElementById('promo-shop-location');
        const bannerTitle = document.getElementById('promo-banner-title');
        const bannerSub = document.getElementById('promo-banner-subtitle');
        const authorTag = document.getElementById('shop-author-tag');

        if (!info || info.enabled === false) {
            if (dynamicContainer) dynamicContainer.innerHTML = '';
            if (badgeWrapper) badgeWrapper.style.display = 'none';
            if (authorTag) authorTag.style.display = 'none';
            return;
        }

        if (info.phone1) {
            EXCELLENCE_CONTACT.primaryPhone = info.phone1;
            EXCELLENCE_CONTACT.primaryDigits = info.phone1.replace(/[^0-9]/g, '');
        }
        if (info.phone2) {
            EXCELLENCE_CONTACT.secondaryPhone = info.phone2;
            EXCELLENCE_CONTACT.secondaryDigits = info.phone2.replace(/[^0-9]/g, '');
        }
        if (info.shopName) EXCELLENCE_CONTACT.shopName = info.shopName;
        if (info.ownerName) EXCELLENCE_CONTACT.ownerName = info.ownerName;
        if (info.address) EXCELLENCE_CONTACT.location = info.address;
        if (info.email) EXCELLENCE_CONTACT.email = info.email;

        const isRoman = (currentLang === 'roman');

        // Dynamic Headings & Subtitles with clean Roman / English
        if (bannerTitle) {
            bannerTitle.innerHTML = isRoman ?
                "📋 Documents Me Galti Hai Ya Naye Documents Banwane Hain? Hum 100% Sahi Karke Denge!" :
                "📋 Document Errors or Need Fresh Documents? We Deliver 100% Accurate Online Services!";
        }
        if (bannerSub) {
            bannerSub.innerHTML = isRoman ?
                "Passport, PAN Card, Voter ID, ya Marksheet me Name Spelling, DOB, ya Father's Name mismatch ho gaya hai? Ya naya Passport, Voter ID, Police Verification, ya SSP Scholarship karwana ho? Fikar mat karein! Aapka sabhi online kaam 100% legal, fast aur approved karwayen." :
                "Spelling, Date of Birth, or Father's Name mismatch in Passport, PAN, Voter ID, or Marksheet? Or need a fresh Passport, Voter ID, Police Verification, or SSP Scholarship? Don't worry! Get all legal government applications filed with guaranteed approval.";
        }

        if (shopBadge && info.shopName) {
            shopBadge.textContent = info.shopName;
            if (shopLocation) shopLocation.textContent = info.ownerName ? "By " + info.ownerName : '';
            if (badgeWrapper) badgeWrapper.style.display = 'inline-flex';
        }

        if (authorTag && (info.shopName || info.ownerName)) {
            authorTag.textContent = `${info.shopName || ''} | ${info.ownerName || ''}`.trim();
            authorTag.style.display = 'inline-block';
        }

        if (!dynamicContainer) return;

        const waUrl = info.whatsapp && info.whatsapp.startsWith('http') ?
            info.whatsapp :
            "https://wa.me/917849008882?text=Namaste%20Ramajan%20Sir!%20Mujhe%20Excellence%20Services%20ke%20baare%20me%20baat%20karni%20hai.";

        dynamicContainer.innerHTML = `
            <div class="shop-executive-card glass-card animate-fade-in" style="margin-top: 28px; padding: 24px 28px; border-radius: 18px;">
                <div class="shop-profile-header" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px;">
                    <div class="shop-brand-col">
                        <div class="shop-official-badge" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(37,99,235,0.18); color: #60a5fa; border: 1px solid rgba(59,130,246,0.35); padding: 4px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                            <span>🏛️ OFFICIAL SEVA PARTNER</span>
                        </div>
                        <h3 class="shop-title-large" style="margin: 0; font-size: 1.6rem; font-weight: 800; color: #f8fafc; letter-spacing: -0.01em;">${info.shopName || 'EXCELLENCE SERVICES'}</h3>
                        <span class="shop-owner-subtitle" style="color: #94a3b8; font-size: 0.95rem; font-weight: 600;">Proprietor: ${info.ownerName || 'Hafiz Ramajan'}</span>
                    </div>
                    <div class="shop-timing-badge" style="background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); padding: 8px 16px; border-radius: 12px; font-size: 0.92rem; font-weight: 700;">
                        <span>🕒 ${info.timing || '9:00 AM - 9:00 PM (Monday to Sunday)'}</span>
                    </div>
                </div>

                <div class="shop-grid-meta" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 22px;">
                    <div class="shop-meta-item" style="display: flex; gap: 12px; align-items: flex-start;">
                        <span style="font-size: 1.3rem;">📍</span>
                        <div>
                            <strong style="color: #e2e8f0; font-size: 0.88rem; display: block; margin-bottom: 2px;">Office Address:</strong>
                            <p style="margin: 0; color: #94a3b8; font-size: 0.92rem; line-height: 1.45;">${info.address || 'Near Iqra School, Raibag, Dist. Belagavi, Karnataka'}</p>
                        </div>
                    </div>
                    <div class="shop-meta-item" style="display: flex; gap: 12px; align-items: flex-start;">
                        <span style="font-size: 1.3rem;">✉️</span>
                        <div>
                            <strong style="color: #e2e8f0; font-size: 0.88rem; display: block; margin-bottom: 2px;">Official Email:</strong>
                            <p style="margin: 0;"><a href="mailto:${info.email || 'ramajanraibag@gmail.com'}" style="color: #60a5fa; text-decoration: underline; font-weight: 600; font-size: 0.92rem;">${info.email || 'ramajanraibag@gmail.com'}</a></p>
                        </div>
                    </div>
                    <div class="shop-meta-item" style="display: flex; gap: 12px; align-items: flex-start;">
                        <span style="font-size: 1.3rem;">📞</span>
                        <div>
                            <strong style="color: #e2e8f0; font-size: 0.88rem; display: block; margin-bottom: 2px;">Direct Helpline Numbers:</strong>
                            <p style="margin: 0;">
                                <a href="tel:${info.phone1 || '7849008882'}" style="color: #34d399; font-weight: 700; font-size: 0.94rem;">+91 ${info.phone1 || '7849008882'}</a> &bull; 
                                <a href="tel:${info.phone2 || '9620746029'}" style="color: #34d399; font-weight: 700; font-size: 0.94rem;">+91 ${info.phone2 || '9620746029'}</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="shop-action-buttons-strip" style="display: flex; flex-wrap: wrap; gap: 12px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08);">
                    <a href="${waUrl}" target="_blank" class="btn btn-success" style="font-weight: 800; padding: 11px 22px; font-size: 0.95rem; border-radius: 10px;">
                        <span>💬 Chat on WhatsApp (+91 7849008882)</span>
                    </a>
                    <a href="tel:${info.phone1 || '7849008882'}" class="btn btn-secondary" style="font-weight: 700; padding: 11px 18px; font-size: 0.92rem; border-radius: 10px;">
                        <span>📞 Call: ${info.phone1 || '7849008882'}</span>
                    </a>
                    <a href="tel:${info.phone2 || '9620746029'}" class="btn btn-secondary" style="font-weight: 700; padding: 11px 18px; font-size: 0.92rem; border-radius: 10px;">
                        <span>📞 Call: ${info.phone2 || '9620746029'}</span>
                    </a>
                </div>
            </div>
        `;
    } catch (e) {
        console.warn("Could not load shop info:", e);
    }
}

// ==========================================================================
// APPLICANT PHONE NUMBER CAPTURE & NEWS SIDEBAR TOGGLE
// ==========================================================================
function setupPhoneCapture() {
    const phoneInput = document.getElementById('applicant-phone-input');
    const saveBtn = document.getElementById('btn-save-phone');

    if (phoneInput) {
        const saved = localStorage.getItem('applicantPhone');
        if (saved) phoneInput.value = saved;

        phoneInput.addEventListener('input', (e) => {
            const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
            e.target.value = clean;
            if (clean.length === 10) {
                localStorage.setItem('applicantPhone', clean);
            }
        });
    }

    if (saveBtn && phoneInput) {
        saveBtn.addEventListener('click', () => {
            const raw = phoneInput.value.trim().replace(/[^0-9]/g, '');
            if (raw.length < 10) {
                alert("Kripya apna 10-digit mobile / WhatsApp number darj karein!");
                phoneInput.focus();
                return;
            }
            localStorage.setItem('applicantPhone', raw.slice(-10));
            saveBtn.textContent = '✅ Saved!';
            saveBtn.style.background = '#10b981';
            saveBtn.style.borderColor = '#059669';

            setTimeout(() => {
                saveBtn.textContent = '💾 Save Number';
                saveBtn.style.background = '';
                saveBtn.style.borderColor = '';
            }, 2500);

            // Re-sync CRM log if documents are already verified
            const activeDocs = documents.filter(d => d.file !== null && d.status === 'done');
            if (activeDocs.length > 0) {
                compileVerificationResults();
            }
        });
    }

    // Toggle / Jump to News Sidebar button
    const newsBtn = document.getElementById('btn-toggle-news-drawer');
    if (newsBtn) {
        newsBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar-news-section');
            if (sidebar) {
                sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
                sidebar.style.transition = 'box-shadow 0.4s ease';
                sidebar.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.5)';
                setTimeout(() => sidebar.style.boxShadow = '', 1500);
            }
        });
    }
}


// ==========================================================================
// OPTIONAL MOBILE NUMBER PROMPT ON "VERIFY DOCUMENTS"
// ==========================================================================
function handleVerifyClick() {
    const savedPhone = (localStorage.getItem('applicantPhone') || document.getElementById('applicant-phone-input')?.value || '').trim();
    if (savedPhone && savedPhone.length === 10) {
        // Phone number is already known, perform verification directly!
        performVerification();
        return;
    }

    const modal = document.getElementById('phone-prompt-modal');
    const input = document.getElementById('modal-phone-input');
    if (modal) {
        modal.classList.remove('hidden');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 150);
        }
    } else {
        performVerification();
    }
}

function setupPhonePromptModal() {
    const modal = document.getElementById('phone-prompt-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('btn-close-phone-modal');
    const skipBtn = document.getElementById('btn-skip-phone-modal');
    const submitBtn = document.getElementById('btn-submit-phone-modal');
    const input = document.getElementById('modal-phone-input');

    const closeModalAndVerify = () => {
        modal.classList.add('hidden');
        performVerification();
    };

    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.preventDefault();
            closeModalAndVerify();
        };
    }

    if (skipBtn) {
        skipBtn.onclick = (e) => {
            e.preventDefault();
            closeModalAndVerify();
        };
    }

    if (submitBtn) {
        submitBtn.onclick = (e) => {
            e.preventDefault();
            const raw = (input?.value || '').replace(/[^0-9]/g, '');
            if (raw.length === 10) {
                localStorage.setItem('applicantPhone', raw);
                const mainInput = document.getElementById('applicant-phone-input');
                if (mainInput) mainInput.value = raw;
            } else if (raw.length > 0 && raw.length !== 10) {
                alert("Baraye meherbani 10-digit mobile number enter karein ya 'Skip' dabayein.");
                return;
            }
            closeModalAndVerify();
        };
    }

    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitBtn.click();
            }
        };
    }

    modal.onclick = (e) => {
        if (e.target.id === 'phone-prompt-modal') {
            closeModalAndVerify();
        }
    };
}


// ==========================================================================
// REAL-TIME BLOG & SCHEME NOTIFICATION ENGINE (ADMIN POST BROADCAST)
// ==========================================================================
let knownBlogIds = new Set();
let isFirstBlogLoad = true;
let currentToastPostId = null;

function showLiveBlogToast(post) {
    const container = document.getElementById('live-blog-toast-container');
    const titleEl = document.getElementById('toast-post-title');
    const descEl = document.getElementById('toast-post-desc');
    const readBtn = document.getElementById('toast-read-btn');
    if (!container || !titleEl) return;

    currentToastPostId = post.id;
    titleEl.textContent = post.title || 'New Announcement';
    if (descEl) descEl.textContent = post.summary || 'Click karein pura update padhne ke liye.';

    if (readBtn) {
        readBtn.onclick = () => {
            dismissLiveToast();
            openArticleReader(post.id);
        };
    }

    container.classList.remove('hidden');

    // Trigger Native Browser Web Notification if permitted
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            try {
                new Notification('📢 Nayi Update: ' + (post.title || 'Official Announcement'), {
                    body: post.summary || 'Excellence Services dwara naya update post kiya gaya hai.',
                    icon: post.image || '/assets/passport-services-poster.jpg'
                });
            } catch (err) {
                console.log("Notification trigger notice:", err);
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    // Auto dismiss after 12 seconds
    setTimeout(() => {
        if (currentToastPostId === post.id) dismissLiveToast();
    }, 12000);
}

function dismissLiveToast() {
    const container = document.getElementById('live-blog-toast-container');
    if (container) container.classList.add('hidden');
}
window.dismissLiveToast = dismissLiveToast;

// Polling interval to check for new posts every 4 seconds
setInterval(async () => {
    try {
        const res = await fetch('/api/blogs');
        if (!res.ok) return;
        const freshList = await res.json();
        if (!Array.isArray(freshList)) return;

        let hasNew = false;
        let latestNewPost = null;

        freshList.forEach(b => {
            const strId = String(b.id);
            if (!knownBlogIds.has(strId)) {
                if (!isFirstBlogLoad && !hasNew) {
                    hasNew = true;
                    latestNewPost = b;
                }
                knownBlogIds.add(strId);
            }
        });

        if (isFirstBlogLoad) {
            isFirstBlogLoad = false;
        } else if (hasNew && latestNewPost) {
            allNewsData = freshList;
            renderHomeNewsGrid(); renderPortalNewsGrid(); updateLiveAnnouncementTicker(); showLiveBlogToast(latestNewPost);
            const dot = document.getElementById('bell-unread-dot');
            if (dot) dot.classList.remove('hidden');
            if ('vibrate' in navigator) { try { navigator.vibrate([150, 75, 150]); } catch(e){} }
        }
    } catch (e) {
        // Silent fail on network blip
    }
}, 4000);


// ==========================================================================
// REAL-TIME NOTIFICATION SYSTEM (SSE LISTENER FOR ADMIN POSTS)
// ==========================================================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function initLiveNotificationStream() {
    if (!window.EventSource) return;

    try {
        const evtSource = new EventSource('/api/live-stream');

        evtSource.onmessage = function (event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'new_announcement' && data.post) {
                    showLiveAnnouncementToast(data.post);
                    playChimeSound();
                    if (navigator.vibrate) {
                        try { navigator.vibrate([100, 60, 120]); } catch (e) {}
                    }
                    // Update badges
                    const bellDot = document.getElementById('bell-unread-dot');
                    if (bellDot) bellDot.classList.remove('hidden');
                    const bottomNewsDot = document.getElementById('bottom-news-dot');
                    if (bottomNewsDot) bottomNewsDot.classList.remove('hidden');

                    // Refresh blog content in background
                    if (typeof loadAndRenderBlogs === 'function') {
                        loadAndRenderBlogs();
                    }
                }
            } catch (err) {
                console.warn("Error parsing live stream message:", err);
            }
        };

        evtSource.onerror = function () {
            // EventSource will auto-reconnect
        };
    } catch (e) {
        console.warn("SSE connection error:", e);
    }
}

function playChimeSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = ctx.currentTime + (idx * 0.1);
            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.38);
        });
    } catch (e) {}
}

function showLiveAnnouncementToast(post) {
    const container = document.getElementById('live-blog-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'live-announcement-toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <span class="live-toast-icon">📢</span>
        <div class="live-toast-content">
            <div class="live-toast-header">
                <span class="live-toast-badge">${post.badge || 'New Scheme'}</span>
                <span class="live-toast-time">Just Now</span>
            </div>
            <h4 class="live-toast-title">${escapeHtml(post.title || 'New Announcement')}</h4>
            <p class="live-toast-summary">${escapeHtml(post.summary || '')}</p>
            <span class="live-toast-action">👉 Tap to View Details & Official Notification</span>
        </div>
        <button type="button" class="live-toast-close" title="Dismiss">&times;</button>
    `;

    // Clicking anywhere on toast switches to News tab and reads article
    toast.addEventListener('click', (e) => {
        if (e.target.classList.contains('live-toast-close')) {
            e.stopPropagation();
            toast.remove();
            return;
        }
        switchPageTab('page-news');
        if (typeof openArticleReader === 'function') {
            openArticleReader(post.id);
        }
        toast.remove();
    });

    container.appendChild(toast);

    // Auto dismiss after 8 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 8000);
}
