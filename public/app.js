
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
            { name: "SSP Scholarship Online Application", category: "Scholarship", rate: "₹50", description: "Applicable for 1st-10th, PUC, Degree" },
            { name: "Fresh Indian Passport Application", category: "Passport", rate: "₹500", description: "Online filing & PSK appointment" },
            { name: "New Color PVC Voter ID Card", category: "Voter ID", rate: "₹100", description: "Old card to digital PVC card" },
            { name: "New PAN Card (Instant/Regular)", category: "PAN Card", rate: "₹150", description: "NSDL/UTI filing with doorstep delivery" }
        ];
    }

    grid.innerHTML = globalServicesData.map(s => {
        let icon = '📌';
        const cat = (s.category || '').toLowerCase();
        if (cat.includes('passport')) icon = '🛂';
        else if (cat.includes('scholarship')) icon = '🎓';
        else if (cat.includes('voter')) icon = '🗳️';
        else if (cat.includes('pan')) icon = '💳';
        else if (cat.includes('police')) icon = '👮';
        else if (cat.includes('affidavit')) icon = '📑';
        else if (cat.includes('visa')) icon = '✈️';

        return `
            <div class="service-highlight-pill" title="${s.description || ''}">
                <span>${icon}</span>
                <span style="flex-grow: 1;"><strong>${s.name}</strong></span>
                <span class="service-rate-badge">${s.rate || 'Enquire'}</span>
            </div>
        `;
    }).join('');
}


// ==========================================================================
// EXCELLENCE SERVICES - NEWS, SCHEMES & BLOG MANAGER
// ==========================================================================
let allNewsData = [];

async function loadAndRenderBlogs() {
    const grid = document.getElementById('public-blogs-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
            allNewsData = await res.json();
        }
    } catch (e) {
        console.warn("Could not fetch /api/blogs, using fallback", e);
    }

    if (!allNewsData || allNewsData.length === 0) {
        allNewsData = [
            {
                id: 'ssp-1',
                title: "SSP Scholarship 2026-27 Applications Open - Fees Only ₹50!",
                category: "Scholarship",
                date: "Today",
                summary: "Karnataka SSP scholarship forms 1st to 10th & Degree UG/PG ke liye online process ho rahe hain.",
                badge: "SSP Scholarship",
                tagColor: "#10b981",
                author: "Hafiz Ramajan"
            },
            {
                id: 'voter-2',
                title: "New Color PVC Digital Voter ID Card Service Started",
                category: "Voter ID",
                date: "Updated",
                summary: "Purana black & white voter card naye high quality PVC color card me convert karwayen.",
                badge: "Voter ID",
                tagColor: "#3b82f6",
                author: "Hafiz Ramajan"
            },
            {
                id: 'passport-3',
                title: "Passport Seva Kendra: Name Spelling Discrepancy Policy",
                category: "Passport",
                date: "Important Alert",
                summary: "Aadhaar Card aur 10th Marksheet me 1 letter ka farak hone par Annexure-D affidavit zaroori hai.",
                badge: "Passport Alert",
                tagColor: "#f59e0b",
                author: "Hafiz Ramajan"
            },
            {
                id: 'pan-4',
                title: "Instant e-PAN Card & Aadhaar-PAN Linking Service",
                category: "PAN Card",
                date: "Active",
                summary: "Income tax portal par instant PAN allotment aur biometric correction available hai.",
                badge: "PAN Card",
                tagColor: "#6366f1",
                author: "Hafiz Ramajan"
            },
            {
                id: 'police-5',
                title: "Police Verification Certificate (PCC) Online Application",
                category: "Police PCC",
                date: "New",
                summary: "Gulf visa aur international jobs ke liye Police Clearance Certificate (PCC) tayyar karwayen.",
                badge: "PCC Clearance",
                tagColor: "#8b5cf6",
                author: "Hafiz Ramajan"
            },
            {
                id: 'ration-6',
                title: "Karnataka Ration Card BPL/APL Name Addition & Split",
                category: "Govt Scheme",
                date: "Recent",
                summary: "Ahara portal par naye parivar sadasya ka naam jodne ke forms submit ho rahe hain.",
                badge: "Ration Card",
                tagColor: "#ec4899",
                author: "Hafiz Ramajan"
            }
        ];
    }

    renderNewsSidebarFeed('');
    setupNewsSearchAndModal();
}

function renderNewsSidebarFeed(filterQuery = '') {
    const grid = document.getElementById('public-blogs-grid');
    const viewAllBtn = document.getElementById('btn-view-all-news');
    const totalCountEl = document.getElementById('total-news-count');
    if (!grid) return;

    const q = filterQuery.toLowerCase().trim();
    let displayList = allNewsData;

    if (q) {
        displayList = allNewsData.filter(b => 
            (b.title || '').toLowerCase().includes(q) ||
            (b.summary || '').toLowerCase().includes(q) ||
            (b.category || '').toLowerCase().includes(q) ||
            (b.badge || '').toLowerCase().includes(q)
        );
    } else {
        // Show ONLY Last 5 posts in the sidebar!
        displayList = allNewsData.slice(0, 5);
    }

    if (totalCountEl) totalCountEl.textContent = allNewsData.length;
    if (viewAllBtn) {
        viewAllBtn.style.display = (allNewsData.length > 5 && !q) ? 'flex' : 'none';
    }

    if (displayList.length === 0) {
        grid.innerHTML = '<div style="text-align:center; color: var(--text-muted); padding: 16px; font-size: 0.85rem;">Koi news ya scheme nahi mili.</div>';
        return;
    }

    grid.innerHTML = displayList.map(b => {
        const msg = encodeURIComponent(`Namaste Hafiz Ramajan Sir! Maine aapke website par blog dekha: "${b.title}". Mujhe is service ke baare me baat karni hai.`);
        return `
            <article class="blog-post-card animate-fade-in">
                <div>
                    <div class="blog-post-header">
                        <span class="blog-badge" style="background: ${b.tagColor ? b.tagColor + '20' : 'rgba(16,185,129,0.15)'}; color: ${b.tagColor || '#10b981'};">${b.badge || b.category || 'Update'}</span>
                        <span class="blog-date">${b.date || 'Recent'}</span>
                    </div>
                    <h5 class="blog-post-title">${b.title}</h5>
                    <p class="blog-post-summary">${b.summary || ''}</p>
                </div>
                <div class="blog-cta-row">
                    <span style="font-size: 0.74rem; color: var(--text-muted);">👤 ${b.author || 'Hafiz Ramajan'}</span>
                    <a href="https://wa.me/917849008882?text=${msg}" target="_blank" class="btn-blog-action">
                        <span>💬 Apply via WhatsApp</span>
                    </a>
                </div>
            </article>
        `;
    }).join('');
}

function setupNewsSearchAndModal() {
    const searchInput = document.getElementById('news-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            renderNewsSidebarFeed(e.target.value);
        };
    }

    const viewAllBtn = document.getElementById('btn-view-all-news');
    const modal = document.getElementById('all-news-modal');
    const closeModalBtn = document.getElementById('close-all-news-modal');
    const modalGrid = document.getElementById('all-news-grid');
    const modalSearchInput = document.getElementById('modal-news-search-input');

    const renderModalItems = (q = '') => {
        if (!modalGrid) return;
        const query = q.toLowerCase().trim();
        const filtered = query ? allNewsData.filter(b => 
            (b.title || '').toLowerCase().includes(query) ||
            (b.summary || '').toLowerCase().includes(query) ||
            (b.category || '').toLowerCase().includes(query)
        ) : allNewsData;

        modalGrid.innerHTML = filtered.map(b => {
            const msg = encodeURIComponent(`Namaste Hafiz Ramajan Sir! Maine aapke portal par dekha: "${b.title}". Is baare me jankari chahiye.`);
            return `
                <article class="blog-post-card" style="margin-bottom: 0;">
                    <div class="blog-post-header">
                        <span class="blog-badge">${b.badge || b.category || 'Update'}</span>
                        <span class="blog-date">${b.date || 'Recent'}</span>
                    </div>
                    <h4 style="margin: 4px 0 6px 0; font-size: 1.05rem; font-family: var(--font-heading); color: var(--text-main);">${b.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 10px 0;">${b.summary || ''}</p>
                    <div class="blog-cta-row">
                        <span style="font-size: 0.76rem; color: var(--text-muted);">👤 ${b.author || 'Hafiz Ramajan'}</span>
                        <a href="https://wa.me/917849008882?text=${msg}" target="_blank" class="btn-blog-action">
                            <span>💬 Apply / Contact on WhatsApp</span>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    };

    if (viewAllBtn && modal) {
        viewAllBtn.onclick = () => {
            modal.classList.remove('hidden');
            if (modalSearchInput) modalSearchInput.value = '';
            renderModalItems('');
        };
    }

    if (closeModalBtn && modal) {
        closeModalBtn.onclick = () => {
            modal.classList.add('hidden');
        };
    }

    if (modal) {
        modal.onclick = (e) => {
            if (e.target.id === 'all-news-modal') {
                modal.classList.add('hidden');
            }
        };
    }

    if (modalSearchInput) {
        modalSearchInput.oninput = (e) => {
            renderModalItems(e.target.value);
        };
    }
}


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
                if (pass === 'admin123' || pass === '7849008882' || pass === 'ramajan') {
                    sessionStorage.setItem('adminToken', 'auth-admin-offline');
                    errEl.classList.add('hidden');
                    loginView.classList.add('hidden');
                    dashView.classList.remove('hidden');
                    loadAdminDashboard();
                } else {
                    errEl.textContent = "Galat Password! (Default: admin123)";
                    errEl.classList.remove('hidden');
                }
            }
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
        subtitle: "Aadhaar, PAN, 10th Marksheet aur Custom documents ko upload karke passport ke liye cross-verify karein.",
        addDoc: "Custom Document Add Karein",
        verify: "Verify Documents",
        reset: "Reset All",
        statusInitial: "Aadhaar aur PAN mandatory hain. 10th Marksheet aur Custom docs bhi upload kar sakte hain.",
        statusNeedMandatory: "Sab mandatory documents upload karna lazmi hai.",
        statusReady: "Verify button par click karke AI verification shuru karein.",
        verdictSuccess: "Sab documents kamyabi se match ho gaye hain! Ready for Passport.",
        verdictError: "Mismatch mila! Highlighted fields aur spelling ko check karein.",
        field: "Field",
        statusCol: "Status",
        fieldName: "Name (Pura Naam)",
        fieldGender: "Gender (Jins / Sex)",
        fieldDob: "Date of Birth (DOB)",
        fieldFather: "Father's Name (Walid Ka Naam)",
        fieldDocNumber: "Document ID Number",
        btnShowRaw: "Show Raw Extracted Text",
        btnHideRaw: "Hide Raw Extracted Text",
        btnDownloadPdf: "Download PDF Report",
        btnPrintReport: "Print Report",
        topParJayein: "Top Par Jayein",
        viewFullReport: "View Full Report",
        modalTitle: "Custom Document Add Karein",
        modalDocLabel: "Document Name (jaise Voter ID, Driving License, Passport)",
        modalMandatoryLabel: "Kya yeh document mandatory hai?",
        modalCancel: "Cancel",
        modalSubmit: "Add Document",
        badgeMandatory: "Mandatory",
        badgeOptional: "Optional",
        uploadText: "File yaha drag karein ya click karke upload karein",
        uploadSubtext: "PNG, JPG, JPEG, PDF up to 15MB",
        statusTextPending: "Pending",
        statusTextUploaded: "File Uploaded / Ready",
        statusTextProcessing: "AI OCR processing...",
        statusTextDone: "Verification Complete",
        statusTextError: "Verification Failed",
        inputPlaceholderName: "Naam likhein...",
        inputPlaceholderDob: "DD/MM/YYYY",
        inputPlaceholderFather: "Walid/Pita ka naam likhein...",
        inputPlaceholderDocNumber: "Document number likhein...",
        matchBadge: "Match",
        mismatchBadge: "Mismatch",
        ignoredBadge: "Ignored (Need 2+ docs)",
        infoOnly: "Document ID",
        rawLogsTitle: "Raw Extracted Text Logs",
        aadhaarTitle: "Aadhaar Card",
        panTitle: "PAN Card",
        marksheetTitle: "10th Marksheet",
        closeReport: "Close Report",
        spellingTitle: "Name Spelling Analysis (Spelling Ki Jaanch)",
        genderMatch: "Gender Match",
        genderMismatch: "Gender Mismatch",
        male: "Male",
        female: "Female",
        other: "Other",
        notSpecified: "Not Specified / N/A",
        reportCertificateTitle: "OFFICIAL DOCUMENT VERIFICATION AUDIT CERTIFICATE",
        newsDrawerBtn: "Latest News & Schemes",
        newsSidebarTitle: "Latest News & Schemes",
        newsSidebarSubtitle: "Govt Schemes & Daily Alerts",
        newsSearchPlaceholder: "News ya schemes search karein...",
        phoneCaptureTitle: "Applicant WhatsApp / Mobile Number (Zaroori):",
        phoneCaptureDesc: "Apna 10-digit WhatsApp number darj karein taake verification report aur customer assistance direct mil sake.",
        phoneCaptureSave: "Save Number",
        pskAdvisoryTitle: "ℹ️ Passport Seva Kendra (PSK) Verification Guidelines:",
        pskRuleName: "Name Spelling: Name 100% match hona chahiye Aadhaar, PAN aur Marksheet me.",
        pskRuleGender: "Gender (Male/Female): Sabhi documents me Gender ek jaisa hona chahiye.",
        pskRuleDob: "Date of Birth (DOB): 10th Marksheet / Birth Certificate official passport ke liye valid hota hai.",
        phoneModalTitle: "Apna Mobile / WhatsApp Number Dein",
        phoneModalOptional: "(Optional • Fikar na karein, ye bilkul zaroori nahi)",
        phoneModalDesc: "Agar documents me koi spelling ya DOB galti nikalti hai, to Excellence Services ki team aapse direct rabta (contact) karke aapka affidavit aur passport documents theek karwa sakti hai.",
        phoneModalSkip: "✖ Skip (Bina Number Verify)",
        phoneModalSubmit: "⚡ Save & Verify Karein",
        viewAllNews: "View All News & Schemes",
        allNewsModalTitle: "All Latest News, Government Schemes & Service Blog"
    },
    en: {
        title: "Passport Document Verification System",
        subtitle: "Upload and cross-verify documents locally using secure client-side PDF rendering & AI OCR.",
        addDoc: "Add Custom Document",
        verify: "Verify Documents",
        reset: "Reset All",
        statusInitial: "Aadhaar and PAN are mandatory. 10th Marksheet and custom documents can also be uploaded.",
        statusNeedMandatory: "Please upload all mandatory documents first.",
        statusReady: "Click 'Verify Documents' button to start AI cross-verification.",
        verdictSuccess: "All documents successfully matched! Ready for Passport submission.",
        verdictError: "Discrepancy detected! Please review highlighted fields & spelling differences.",
        field: "Field",
        statusCol: "Status",
        fieldName: "Full Name",
        fieldGender: "Gender (Sex)",
        fieldDob: "Date of Birth (DOB)",
        fieldFather: "Father's Name",
        fieldDocNumber: "Document ID Number",
        btnShowRaw: "Show Raw Extracted Text",
        btnHideRaw: "Hide Raw Extracted Text",
        btnDownloadPdf: "Download PDF Report",
        btnPrintReport: "Print Report",
        topParJayein: "Go to Top",
        viewFullReport: "View Full Report",
        modalTitle: "Add Custom Document",
        modalDocLabel: "Document Name (e.g., Voter ID, Driving License)",
        modalMandatoryLabel: "Is this document mandatory?",
        modalCancel: "Cancel",
        modalSubmit: "Add Document",
        badgeMandatory: "Mandatory",
        badgeOptional: "Optional",
        uploadText: "Drag & drop your file here, or click to browse",
        uploadSubtext: "Supports PNG, JPG, JPEG, PDF up to 15MB",
        statusTextPending: "Pending",
        statusTextUploaded: "File Uploaded / Ready",
        statusTextProcessing: "AI OCR processing...",
        statusTextDone: "Verification Complete",
        statusTextError: "Verification Failed",
        inputPlaceholderName: "Type name...",
        inputPlaceholderDob: "DD/MM/YYYY",
        inputPlaceholderFather: "Type father's name...",
        inputPlaceholderDocNumber: "Type document number...",
        matchBadge: "Match",
        mismatchBadge: "Mismatch",
        ignoredBadge: "Ignored (Need 2+ docs)",
        infoOnly: "Document ID",
        rawLogsTitle: "Raw Extracted Text Logs",
        aadhaarTitle: "Aadhaar Card",
        panTitle: "PAN Card",
        marksheetTitle: "10th Marksheet",
        closeReport: "Close Report",
        spellingTitle: "Smart Name & Spelling Verification Analysis",
        genderMatch: "Gender Match",
        genderMismatch: "Gender Mismatch",
        male: "Male",
        female: "Female",
        other: "Other",
        notSpecified: "Not Specified / N/A",
        reportCertificateTitle: "OFFICIAL PASSPORT VERIFICATION AUDIT CERTIFICATE",
        newsDrawerBtn: "Latest News & Govt Schemes",
        newsSidebarTitle: "Latest News & Govt Schemes",
        newsSidebarSubtitle: "Govt Schemes & Daily Alerts",
        newsSearchPlaceholder: "Search news & schemes...",
        phoneCaptureTitle: "Applicant WhatsApp / Mobile Number (Optional):",
        phoneCaptureDesc: "Enter your 10-digit WhatsApp number to receive official verification report & quick consultation.",
        phoneCaptureSave: "Save Number",
        pskAdvisoryTitle: "ℹ️ Passport Seva Kendra (PSK) Verification Guidelines:",
        pskRuleName: "Name Spelling: Name must match 100% across Aadhaar, PAN, and 10th Marksheet.",
        pskRuleGender: "Gender (Male/Female): Gender must be strictly consistent across identity records.",
        pskRuleDob: "Date of Birth (DOB): 10th Marksheet / Birth Certificate takes precedence for official passport issuance.",
        phoneModalTitle: "Provide Mobile / WhatsApp Number",
        phoneModalOptional: "(Optional • Don't worry, completely optional)",
        phoneModalDesc: "If any spelling discrepancy or DOB mismatch is found, Excellence Services team can directly assist you with Annexure affidavit & correction.",
        phoneModalSkip: "✖ Skip (Verify without Number)",
        phoneModalSubmit: "⚡ Save & Verify Now",
        viewAllNews: "View All News & Schemes",
        allNewsModalTitle: "All Latest News, Government Schemes & Service Blog"
    },
    hi: {
        title: "पासपोर्ट दस्तावेज़ सत्यापन प्रणाली",
        subtitle: "पासपोर्ट आवेदन के लिए आधार, पैन, 10वीं मार्कशीट और अन्य दस्तावेज़ों का एआई आधारित सत्यापन करें।",
        addDoc: "कस्टम दस्तावेज़ जोड़ें",
        verify: "दस्तावेज़ सत्यापित करें",
        reset: "रीसेट करें",
        statusInitial: "आधार और पैन अनिवार्य हैं। 10वीं मार्कशीट व अन्य दस्तावेज़ भी जोड़ सकते हैं।",
        statusNeedMandatory: "सभी अनिवार्य दस्तावेज़ अपलोड करना आवश्यक है।",
        statusReady: "सत्यापन प्रक्रिया शुरू करने के लिए 'दस्तावेज़ सत्यापित करें' पर क्लिक करें।",
        verdictSuccess: "सभी दस्तावेज़ सफलतापूर्वक मेल खाते हैं! पासपोर्ट के लिए तैयार।",
        verdictError: "अंतर मिला! कृपया नाम की स्पेलिंग और अन्य विवरण की जाँच करें।",
        field: "विवरण",
        statusCol: "स्थिति",
        fieldName: "पूरा नाम",
        fieldGender: "लिंग (Gender)",
        fieldDob: "जन्म तिथि (DOB)",
        fieldFather: "पिता का नाम",
        fieldDocNumber: "दस्तावेज़ संख्या (ID)",
        btnShowRaw: "मूल टेक्स्ट देखें",
        btnHideRaw: "मूल टेक्स्ट छिपाएं",
        btnDownloadPdf: "पीडीएफ रिपोर्ट डाउनलोड करें",
        btnPrintReport: "प्रिंट रिपोर्ट",
        topParJayein: "ऊपर जाएं",
        viewFullReport: "पूरी रिपोर्ट देखें",
        modalTitle: "कस्टम दस्तावेज़ जोड़ें",
        modalDocLabel: "दस्तावेज़ का नाम (जैसे वोटर आईडी, ड्राइविंग लाइसेंस)",
        modalMandatoryLabel: "क्या यह दस्तावेज़ अनिवार्य है?",
        modalCancel: "रद्द करें",
        modalSubmit: "जोड़ें",
        badgeMandatory: "अनिवार्य",
        badgeOptional: "वैकल्पिक",
        uploadText: "फ़ाइल यहाँ खींचें या अपलोड करने के लिए क्लिक करें",
        uploadSubtext: "PNG, JPG, JPEG, PDF (अधिकतम 15MB)",
        statusTextPending: "प्रतीक्षारत",
        statusTextUploaded: "फ़ाइल अपलोड / तैयार",
        statusTextProcessing: "एआई ओसीआर चल रहा है...",
        statusTextDone: "सत्यापन संपन्न",
        statusTextError: "सत्यापन विफल",
        inputPlaceholderName: "नाम लिखें...",
        inputPlaceholderDob: "दिन/माह/वर्ष",
        inputPlaceholderFather: "पिता का नाम लिखें...",
        inputPlaceholderDocNumber: "दस्तावेज़ नंबर लिखें...",
        matchBadge: "समान (Match)",
        mismatchBadge: "असमान (Mismatch)",
        ignoredBadge: "अमान्य (2+ दस्तावेज़ चाहिए)",
        infoOnly: "दस्तावेज़ ID",
        rawLogsTitle: "मूल एक्सट्रैक्टेड टेक्स्ट लॉग्स",
        aadhaarTitle: "आधार कार्ड",
        panTitle: "पैन कार्ड",
        marksheetTitle: "10वीं की मार्कशीट",
        closeReport: "रिपोर्ट बंद करें",
        spellingTitle: "स्मार्ट नाम व स्पेलिंग अंतर विश्लेषण",
        genderMatch: "लिंग मिलान सफल",
        genderMismatch: "लिंग में अंतर",
        male: "पुरुष (Male)",
        female: "महिला (Female)",
        other: "अन्य (Other)",
        notSpecified: "उल्लेखित नहीं / N/A",
        reportCertificateTitle: "पासपोर्ट दस्तावेज़ सत्यापन ऑडिट प्रमाण-पत्र",
        newsDrawerBtn: "नवीनतम समाचार और योजनाएं",
        newsSidebarTitle: "ताज़ा ख़बरें और सरकारी योजनाएं",
        newsSidebarSubtitle: "सरकारी योजनाएं और दैनिक अलर्ट",
        newsSearchPlaceholder: "योजना या समाचार खोजें...",
        phoneCaptureTitle: "आवेदक का व्हाट्सएप / मोबाइल नंबर (आवश्यक):",
        phoneCaptureDesc: "अपना 10-अंकों का नंबर दर्ज करें ताकि सत्यापन रिपोर्ट और ग्राहक सहायता सीधे मिल सके।",
        phoneCaptureSave: "नंबर सेव करें",
        pskAdvisoryTitle: "ℹ️ पासपोर्ट सेवा केंद्र (PSK) सत्यापन दिशानिर्देश:",
        pskRuleName: "नाम स्पेलिंग: आधार, पैन और मार्कशीट में 100% नाम मिलना चाहिए।",
        pskRuleGender: "लिंग (Gender): सभी पहचान पत्रों में लिंग समान होना चाहिए।",
        pskRuleDob: "जन्म तिथि (DOB): 10वीं मार्कशीट/जन्म प्रमाण पत्र पासपोर्ट के लिए मान्य होता है।",
        phoneModalTitle: "अपना मोबाइल / व्हाट्सएप नंबर दर्ज करें",
        phoneModalOptional: "(वैकल्पिक • चिंता न करें, यह अनिवार्य नहीं है)",
        phoneModalDesc: "यदि दस्तावेज़ों में कोई स्पेलिंग या जन्मतिथि त्रुटि पाई जाती है, तो हमारी टीम सीधे संपर्क करके शपथ पत्र (Affidavit) बनवाने में सहायता करेगी।",
        phoneModalSkip: "✖ छोड़ें (बिना नंबर सत्यापित करें)",
        phoneModalSubmit: "⚡ सेव करें और सत्यापित करें",
        viewAllNews: "सभी समाचार और योजनाएं देखें",
        allNewsModalTitle: "सभी नवीनतम समाचार, सरकारी योजनाएं और सेवा ब्लॉग"
    },
    ur: {
        title: "پاسپورٹ دستاویز تصدیقی نظام",
        subtitle: "محفوظ کلائنٹ سائیڈ پی ڈی ایف رینڈرنگ اور اے آئی او سی آر سے دستاویزات کی تصدیق کریں۔",
        addDoc: "اپنی مرضی کی دستاویز شامل کریں",
        verify: "دستاویزات کی تصدیق کریں",
        reset: "سب ری سیٹ کریں",
        statusInitial: "آدھار اور پین کارڈ لازمی ہیں۔ دسویں کی مارک شیٹ بھی اپ لوڈ کر سکتے ہیں۔",
        statusNeedMandatory: "تمام لازمی دستاویزات اپ لوڈ کرنا ضروری ہیں۔",
        statusReady: "تصدیق کا عمل شروع کرنے کے لیے بٹن پر کلک کریں۔",
        verdictSuccess: "تمام دستاویزات کامیابی کے ساتھ مطابقت رکھتی ہیں!",
        verdictError: "تضاد پایا گیا! برائے کرم نمایاں کردہ خانے اور ہجے درست کریں۔",
        field: "فیلڈ",
        statusCol: "حیثیت",
        fieldName: "پورا نام",
        fieldGender: "جنس (Gender)",
        fieldDob: "تاریخ پیدائش (DOB)",
        fieldFather: "والد کا نام",
        fieldDocNumber: "دستاویز نمبر",
        btnShowRaw: "نکالا گیا متن دیکھیں",
        btnHideRaw: "نکالا گیا متن چھپائیں",
        btnDownloadPdf: "پی ڈی ایف رپورٹ ڈاؤن لوڈ کریں",
        btnPrintReport: "پرنٹ رپورٹ",
        topParJayein: "اوپر جائیں",
        viewFullReport: "مکمل رپورٹ دیکھیں",
        modalTitle: "اپنی مرضی کی دستاویز شامل کریں",
        modalDocLabel: "دستاویز کا نام (جیسے ووٹر کارڈ، لائسنس)",
        modalMandatoryLabel: "کیا یہ دستاویز لازمی ہے؟",
        modalCancel: "منسوخ کریں",
        modalSubmit: "شامل کریں",
        badgeMandatory: "لازمی",
        badgeOptional: "اختیاری",
        uploadText: "فائل یہاں ڈراپ کریں یا کلک کر کے منتخب کریں",
        uploadSubtext: "PNG، JPG، JPEG، PDF (زیادہ سے زیادہ 15MB)",
        statusTextPending: "زیر التواء",
        statusTextUploaded: "فائل اپ لوڈ / تیار",
        statusTextProcessing: "اے آئی تصدیق جاری ہے...",
        statusTextDone: "تصدیق مکمل",
        statusTextError: "تصدیق ناکام",
        inputPlaceholderName: "نام درج کریں...",
        inputPlaceholderDob: "دن/ماہ/سال",
        inputPlaceholderFather: "والد کا نام درج کریں...",
        inputPlaceholderDocNumber: "دستاویز نمبر درج کریں...",
        matchBadge: "مطابقت",
        mismatchBadge: "تضاد",
        ignoredBadge: "نظر انداز (2+ دستاویزات درکار)",
        infoOnly: "دستاویز ID",
        rawLogsTitle: "نکالے گئے متن کا لاگ",
        aadhaarTitle: "آدھار کارڈ",
        panTitle: "پین کارڈ",
        marksheetTitle: "دسویں کی مارک شیٹ",
        closeReport: "رپورٹ بند کریں",
        spellingTitle: "نام کے ہجے کا تجزیہ",
        genderMatch: "جنس کی مطابقت",
        genderMismatch: "جنس میں تضاد",
        male: "مرد (Male)",
        female: "عورت (Female)",
        other: "دیگر (Other)",
        notSpecified: "درج نہیں / N/A",
        reportCertificateTitle: "پاسپورٹ دستاویزات کی تصدیق کا آڈٹ سرٹیفکیٹ",
        newsDrawerBtn: "تازہ ترین خبریں اور اسکیمیں",
        newsSidebarTitle: "تازہ ترین خبریں اور سرکاری اسکیمیں",
        newsSidebarSubtitle: "سرکاری اسکیمیں اور روزانہ کے الرٹس",
        newsSearchPlaceholder: "خبریں یا اسکیمیں تلاش کریں...",
        phoneCaptureTitle: "درخواست گزار کا واٹس ایپ / موبائل نمبر (ضروری):",
        phoneCaptureDesc: "اپنا 10 ہندسوں کا نمبر درج کریں تاکہ رپورٹ اور کسٹمر سپورٹ مل سکے۔",
        phoneCaptureSave: "نمبر محفوظ کریں",
        pskAdvisoryTitle: "ℹ️ پاسپورٹ سیوا کیندر (PSK) تصدیقی ہدایات:",
        pskRuleName: "نام کے ہجے: آدھار، پین اور مارک شیٹ میں نام 100% مطابقت رکھنا چاہیے۔",
        pskRuleGender: "جنس: تمام شناختی کارڈز میں جنس ایک جیسی ہونی چاہیے۔",
        pskRuleDob: "تاریخ پیدائش: دسویں کی مارک شیٹ یا پیدائش کا سرٹیفکیٹ ترجیحی مانا جاتا ہے۔",
        phoneModalTitle: "اپنا موبائل / واٹس ایپ نمبر درج کریں",
        phoneModalOptional: "(اختیاری • فکر نہ کریں، یہ لازمی نہیں)",
        phoneModalDesc: "اگر دستاویز میں کوئی غلطی ہو تو ہماری ٹیم آپ سے رابطہ کر کے درست کروا سکتی ہے۔",
        phoneModalSkip: "✖ چھوڑیں (بغیر نمبر تصدیق کریں)",
        phoneModalSubmit: "⚡ محفوظ کریں اور تصدیق کریں",
        viewAllNews: "تمام خبریں اور اسکیمیں دیکھیں",
        allNewsModalTitle: "تمام تازہ ترین خبریں، سرکاری اسکیمیں اور بلاگ"
    }
};

// Global App States
let currentLang = localStorage.getItem('appLanguage') || 'roman';
let activeTheme = localStorage.getItem('appTheme') || 'dark';
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
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageSelector();
    initConsultantContact();
    applyTranslations();
    setupGlobalEventListeners();
    loadAndRenderServices();
    loadAndRenderBlogs();
    loadShopInfo();
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
    if (activeTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        if (themeBtn) themeBtn.textContent = '🌙';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            if (document.body.classList.contains('light-theme')) {
                document.body.classList.remove('light-theme');
                themeBtn.textContent = '🌙';
                activeTheme = 'dark';
            } else {
                document.body.classList.add('light-theme');
                themeBtn.textContent = '☀️';
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
        });
    }
}

// Apply Translations to DOM Elements
function applyTranslations() {
    const dict = translations[currentLang] || translations.roman;
    
    document.documentElement.dir = (currentLang === 'ur') ? 'rtl' : 'ltr';
    
    // Page Title & Header
    const pageTitle = document.getElementById('i18n-page-title');
    if (pageTitle) pageTitle.textContent = dict.title;
    const titleEl = document.getElementById('i18n-title');
    if (titleEl) titleEl.textContent = dict.title;
    const subtitleEl = document.getElementById('i18n-subtitle');
    if (subtitleEl) subtitleEl.textContent = dict.subtitle;
    
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

    // Phone Capture Bar
    const phoneCapTitle = document.getElementById('phone-capture-title');
    if (phoneCapTitle) phoneCapTitle.textContent = dict.phoneCaptureTitle;
    const phoneCapDesc = document.getElementById('phone-capture-desc');
    if (phoneCapDesc) phoneCapDesc.textContent = dict.phoneCaptureDesc;
    const savePhoneBtn = document.getElementById('i18n-save-phone');
    if (savePhoneBtn) savePhoneBtn.textContent = '💾 ' + dict.phoneCaptureSave;

    // Report Header Title
    const inlineTitle = document.getElementById('i18n-inline-report-title');
    if (inlineTitle) inlineTitle.textContent = dict.reportCertificateTitle;

    // PSK Guidelines Title & Items
    const pskTitle = document.getElementById('i18n-psk-title');
    if (pskTitle) pskTitle.textContent = dict.pskAdvisoryTitle;
    const pskList = document.getElementById('advisory-list-items');
    if (pskList) {
        pskList.innerHTML = `
            <li>${dict.pskRuleName}</li>
            <li>${dict.pskRuleGender}</li>
            <li>${dict.pskRuleDob}</li>
        `;
    }

    // Sidebar News & Search
    const newsTitle = document.getElementById('sidebar-news-title');
    if (newsTitle) newsTitle.textContent = dict.newsSidebarTitle;
    const newsSub = document.getElementById('sidebar-news-sub');
    if (newsSub) newsSub.textContent = dict.newsSidebarSubtitle;
    const newsInput = document.getElementById('news-search-input');
    if (newsInput) newsInput.placeholder = dict.newsSearchPlaceholder;
    const viewAllNewsText = document.getElementById('i18n-view-all-news');
    if (viewAllNewsText) viewAllNewsText.textContent = dict.viewAllNews;
    const allNewsModalTitle = document.getElementById('all-news-modal-title');
    if (allNewsModalTitle) allNewsModalTitle.textContent = dict.allNewsModalTitle;

    // Phone Prompt Modal
    const pModalTitle = document.querySelector('#phone-prompt-modal .phone-modal-title');
    if (pModalTitle) pModalTitle.textContent = dict.phoneModalTitle;
    const pModalOpt = document.querySelector('#phone-prompt-modal .phone-modal-optional');
    if (pModalOpt) pModalOpt.textContent = dict.phoneModalOptional;
    const pModalDesc = document.querySelector('#phone-prompt-modal .phone-modal-desc');
    if (pModalDesc) pModalDesc.textContent = dict.phoneModalDesc;
    const pModalSkip = document.querySelector('#btn-skip-phone-modal span');
    if (pModalSkip) pModalSkip.textContent = dict.phoneModalSkip;
    const pModalSubmit = document.querySelector('#btn-submit-phone-modal span');
    if (pModalSubmit) pModalSubmit.textContent = dict.phoneModalSubmit;

    // Update In-Memory Document Titles
    if (documents[0]) documents[0].title = dict.aadhaarTitle;
    if (documents[1]) documents[1].title = dict.panTitle;
    if (documents[2]) documents[2].title = dict.marksheetTitle;

    // Re-render UI
    updateGlobalStatus();
    renderDocumentGrid();
    
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
    document.getElementById('add-doc-btn').addEventListener('click', openModal);
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
            const reportSec = document.getElementById('verification-report-section');
            if (reportSec) {
                reportSec.classList.remove('hidden');
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
    document.getElementById('custom-doc-modal').classList.remove('hidden');
    document.getElementById('custom-doc-title').value = '';
    document.getElementById('custom-doc-mandatory').checked = false;
    document.getElementById('custom-doc-title').focus();
}

function closeModal() {
    document.getElementById('custom-doc-modal').classList.add('hidden');
}

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

async function generatePdfReport() {
    preparePrintablePdfTemplate();
    const pdfContentEl = document.getElementById('pdf-report-content');
    const wrapper = document.getElementById('printable-pdf-container');
    
    if (!pdfContentEl || !wrapper) {
        alert("Report container not found!");
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
            width: 740,
            windowWidth: 800
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        if (window.html2pdf) {
            await html2pdf().set(opt).from(pdfContentEl).save();
        } else {
            window.print();
        }
    } catch (err) {
        console.error("PDF generation failed:", err);
        window.print();
    } finally {
        wrapper.style.display = 'none';
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

        // Update in-memory contact object for dynamic consultation message generator
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
        if (info.whatsapp) EXCELLENCE_CONTACT.qrLink = info.whatsapp;

        // Dynamic Headings & Subtitles
        if (bannerTitle && info.bannerTitle) bannerTitle.innerHTML = `📄 ${info.bannerTitle}`;
        if (bannerSub && info.bannerSubtitle) bannerSub.innerHTML = info.bannerSubtitle;

        if (shopBadge && info.shopName) {
            shopBadge.textContent = info.shopName;
            if (shopLocation) shopLocation.textContent = info.ownerName ? ` — (By ${info.ownerName})` : '';
            if (badgeWrapper) badgeWrapper.style.display = 'inline-flex';
        }

        if (authorTag && (info.shopName || info.ownerName)) {
            authorTag.textContent = `${info.shopName || ''} | ${info.ownerName || ''}`.trim();
            authorTag.style.display = 'inline-block';
        }

        if (!dynamicContainer) return;

        // Build Shop Details Box
        let itemsHtml = '';
        if (info.shopName) {
            itemsHtml += `
                <div class="shop-item">
                    <span class="shop-icon">🏬</span>
                    <div><strong>Shop Name:</strong> ${info.shopName} ${info.ownerName ? `(By ${info.ownerName})` : ''}</div>
                </div>`;
        }
        if (info.address) {
            itemsHtml += `
                <div class="shop-item">
                    <span class="shop-icon">📍</span>
                    <div><strong>Address:</strong> ${info.address}</div>
                </div>`;
        }
        if (info.timing) {
            itemsHtml += `
                <div class="shop-item">
                    <span class="shop-icon">⏰</span>
                    <div><strong>Timing:</strong> ${info.timing}</div>
                </div>`;
        }
        if (info.instagram) {
            itemsHtml += `
                <div class="shop-item">
                    <span class="shop-icon">📸</span>
                    <div><strong>Instagram:</strong> <a href="${info.instagram}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${info.instagramHandle || info.instagram}</a></div>
                </div>`;
        }
        if (info.email) {
            itemsHtml += `
                <div class="shop-item">
                    <span class="shop-icon">✉️</span>
                    <div><strong>Email:</strong> <a href="mailto:${info.email}" style="color: #60a5fa; text-decoration: underline;">${info.email}</a></div>
                </div>`;
        }

        let qrHtml = '';
        if (info.qrImage) {
            const waLink = info.whatsapp ? (info.whatsapp.startsWith('http') ? info.whatsapp : `https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`) : '#';
            qrHtml = `
                <div class="shop-qr-box">
                    <a href="${waLink}" target="_blank" title="Click karke WhatsApp par direct chat karein">
                        <img src="${info.qrImage}" alt="${info.ownerName || info.shopName} WhatsApp QR Code" class="whatsapp-qr-img" onerror="this.parentElement.style.display='none'">
                    </a>
                    <div class="qr-caption">
                        <strong>${info.ownerName || info.shopName}</strong><br>
                        <span>📱 Scan QR using WhatsApp camera</span>
                    </div>
                </div>`;
        }

        let ctaButtonsHtml = '';
        if (info.whatsapp) {
            const waLink = info.whatsapp.startsWith('http') ? info.whatsapp : `https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`;
            ctaButtonsHtml += `
                <a id="whatsapp-consult-btn" href="${waLink}" target="_blank" class="btn-whatsapp">
                    <span style="font-size: 1.3rem;">💬</span> <span>WhatsApp Direct Chat Karein</span>
                </a>`;
        }
        if (info.phone1) {
            ctaButtonsHtml += `
                <a id="call-primary-btn" href="tel:${info.phone1}" class="btn-call">
                    <span style="font-size: 1.15rem;">📞</span> <span>Call: ${info.phone1}</span>
                </a>`;
        }
        if (info.phone2) {
            ctaButtonsHtml += `
                <a id="call-secondary-btn" href="tel:${info.phone2}" class="btn-call btn-call-alt">
                    <span style="font-size: 1.15rem;">📞</span> <span>Call: ${info.phone2}</span>
                </a>`;
        }
        if (info.email) {
            ctaButtonsHtml += `
                <a id="email-btn" href="mailto:${info.email}" class="btn-email">
                    <span style="font-size: 1.15rem;">✉️</span> <span>${info.email}</span>
                </a>`;
        }

        dynamicContainer.innerHTML = `
            <div class="shop-info-banner">
                <div class="shop-details-left">
                    ${itemsHtml}
                </div>
                ${qrHtml}
            </div>
            ${ctaButtonsHtml ? `<div class="promo-cta-group">${ctaButtonsHtml}</div>` : ''}
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
