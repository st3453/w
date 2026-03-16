  const _sb = supabase.createClient('https://nlwfmersznyaglxcpgds.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd2ZtZXJzem55YWdseGNwZ2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjgyNzksImV4cCI6MjA4ODYwNDI3OX0.8Yd96WPdScG4Fp4PD3DjIRQSS7qIDdkmUm_1y1HTbEE');
    const ADMIN_WA = "94707763739";

    function showTab(t) {
        document.getElementById('tab-post').style.display = t=='post'?'block':'none';
        document.getElementById('tab-status').style.display = t=='status'?'block':'none';
        document.getElementById('btn-post').className = t=='post'?'active':'';
        document.getElementById('btn-status').className = t=='status'?'active':'';
    }

    function toggleVisibility(id) {
        const input = document.getElementById(id);
        const svg = document.getElementById('eye-' + id);
        if (input.type === "password") {
            input.type = "text";
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />';
        } else {
            input.type = "password";
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12.013a3 3 0 11-6 0 3 3 0 016 0z" />';
        }
    }

    function loadPreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => { 
                document.getElementById('poster-img').src = reader.result;
                document.getElementById('poster-img').style.display = 'block';
                document.getElementById('placeholder-text').style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    }

    document.getElementById('desc').oninput = function() {
        let count = this.value.trim().split(/\s+/).filter(w=>w.length>0).length;
        document.getElementById('words').innerText = count + " / 100 words";
        document.getElementById('subBtn').disabled = count < 100;
        document.getElementById('words').style.color = count >= 100 ? "var(--success)" : "var(--error)";
    };

    async function submitAd() {
        const btn = document.getElementById('subBtn');
        const file = document.getElementById('file-input').files[0];
        
        const compulsoryFields = ['name', 'subject', 'contact', 'whatsapp', 'loc', 'grades', 'email', 'pw', 'fee', 'desc'];
        for(let id of compulsoryFields) {
            if(!document.getElementById(id).value.trim()) {
                alert("Please fill all fields marked with *");
                return;
            }
        }
        if(!file) return alert("Please upload a poster");

        btn.disabled = true;
        btn.innerText = "Uploading...";

        let finalUrl = "";
        if(file) {
            const fileName = `${Date.now()}_${file.name}`;
            const { data } = await _sb.storage.from('ads').upload(`posters/${fileName}`, file);
            if(data) finalUrl = _sb.storage.from('ads').getPublicUrl(`posters/${fileName}`).data.publicUrl;
        }

        const { error } = await _sb.from('pending_ads').insert([{
            name: document.getElementById('name').value, 
            subject: document.getElementById('subject').value,
            contact: document.getElementById('contact').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            view_password: document.getElementById('pw').value,
            location: document.getElementById('loc').value,
            grades: document.getElementById('grades').value,
            fee: document.getElementById('fee').value,
            details: document.getElementById('desc').value,
            type: document.getElementById('type').value,
            img_url: finalUrl
        }]);

        if(error) { alert(error.message); btn.disabled = false; }
        else { 
            document.getElementById('user-ui').style.display = 'none';
            document.getElementById('success-overlay').style.display = 'flex'; 
        }
    }

    async function checkStatus() {
        const email = document.getElementById('logEmail').value;
        const pw = document.getElementById('logPw').value;
        if(!email || !pw) return alert("Enter credentials");

        const { data, error } = await _sb.from('pending_ads')
            .select('*')
            .eq('email', email)
            .eq('view_password', pw)
            .order('created_at', { ascending: false });

        const resultsDiv = document.getElementById('status-results');
        const list = document.getElementById('status-list');
        list.innerHTML = "";

        if(data && data.length > 0) {
            resultsDiv.style.display = 'block';
            data.forEach(ad => {
                const isApproved = ad.status.toLowerCase() === 'approved';
                const card = document.createElement('div');
                card.className = "status-card";
                
                let note = (ad.admin_notes && !ad.admin_notes.includes("under review")) 
                    ? `<b>Admin:</b> ${ad.admin_notes}` 
                    : "Under review by our team.";

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                        <h4 style="margin:0; color:var(--primary);">${ad.subject}</h4>
                        <span style="font-size:10px; color:var(--text-muted);">${new Date(ad.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style="font-size:13px; margin-bottom:10px;">
                        Status: <b style="color:${isApproved ? 'var(--success)' : '#b45309'}">${ad.status.toUpperCase()}</b>
                    </div>
                    <div style="background:#fff; padding:10px; border-radius:8px; font-size:12px; border:1px solid var(--border);">
                        ${note}
                    </div>
                    ${isApproved ? `<button class="btn-del" onclick="contactAdmin('delete', 'Subject: ${ad.subject}\\nEmail: ${ad.email}')"><span>🗑️</span> Request Deletion</button>` : ''}
                `;
                list.appendChild(card);
            });
        } else {
            alert("No ads found.");
        }
    }

    function contactAdmin(reason, details = "") {
        let msg = "";
        if(reason === 'recovery') {
            msg = "Hi Admin, I forgot my login credentials for ASWClassFinder. Can you help me recover my ad status?";
        } else if(reason === 'delete') {
            msg = `Hi Admin, I want to delete my ad:\n\n${details}`;
        }
        window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank');
    }