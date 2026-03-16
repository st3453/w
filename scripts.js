  const SUPABASE_URL = 'https://nlwfmersznyaglxcpgds.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd2ZtZXJzem55YWdseGNwZ2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjgyNzksImV4cCI6MjA4ODYwNDI3OX0.8Yd96WPdScG4Fp4PD3DjIRQSS7qIDdkmUm_1y1HTbEE';
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        async function syncReviewData(adId, countElementId, starElementId) {
            try {
                const { data, count, error } = await client
                    .from('reviews')
                    .select('rating', { count: 'exact' })
                    .eq('ad_id', adId);

                const countEl = document.getElementById(countElementId);
                const starEl = document.getElementById(starElementId);
                if (!countEl || !starEl) return;

                if (error) throw error;

                if (data && count > 0) {
                    const avgRating = data.reduce((acc, item) => acc + item.rating, 0) / count;
                    countEl.innerText = `(${avgRating.toFixed(1)} • ${count} Reviews)`;
                    let starStr = "";
                    const roundedRating = Math.round(avgRating);
                    for (let i = 1; i <= 5; i++) { starStr += (i <= roundedRating) ? "★" : "☆"; }
                    starEl.innerText = starStr;
                } else {
                    countEl.innerText = "(No reviews yet)";
                    starEl.innerText = "☆☆☆☆☆";
                }
            } catch (err) {
                console.error(err);
                const el = document.getElementById(countElementId);
                if (el) el.innerText = "(Rating Unavailable)";
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            syncReviewData('aruna-perera-bio-2026', 'aruna-perera-bio-2026', 'star-aruna');
            syncReviewData('kamal-physics-featured', 'count-kamal', 'star-kamal');
            syncReviewData('nuwan-kumara-physics-2026', 'count-nuwan', 'star-nuwan');
        });



        function filterAds() {
            const s = document.getElementById('subjectSearch').value.toLowerCase();
            const g = document.getElementById('gradeSearch').value.toLowerCase();
            const l = document.getElementById('locationSearch').value.toLowerCase();
            
            const allCards = document.querySelectorAll('.class-card');
            const pagination = document.getElementById('pagination');
            const isSearching = s !== "" || g !== "" || l !== "";

            allCards.forEach(card => {
                const txt = card.innerText.toLowerCase();
                if (txt.includes(s) && txt.includes(g) && txt.includes(l)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });

            pagination.style.display = isSearching ? "none" : "flex";
        }