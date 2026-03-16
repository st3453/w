   // --- 1. CONFIGURATION ---
        const SB_URL = 'https://nlwfmersznyaglxcpgds.supabase.co';
        const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd2ZtZXJzem55YWdseGNwZ2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjgyNzksImV4cCI6MjA4ODYwNDI3OX0.8Yd96WPdScG4Fp4PD3DjIRQSS7qIDdkmUm_1y1HTbEE';
        const manualAdId = 'aruna-perera-bio-2026';
        const _sb = supabase.createClient(SB_URL, SB_KEY);
        let userRating = 0;
        let allReviews = [];

        // --- 2. REVIEW LOADING & DISPLAY ---
        async function loadReviews() {
            try {
                const { data: reviews, error } = await _sb.from('reviews')
                    .select('*')
                    .eq('ad_id', manualAdId)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                allReviews = reviews;
                displayReviews(false);
            } catch (err) {
                console.error("Error loading reviews:", err.message);
                document.getElementById('reviews-list').innerText = "Unable to load reviews.";
            }
        }

        function displayReviews(showAll) {
            const reviewBox = document.getElementById('reviews-list');
            const container = document.getElementById('see-more-container');
            if (allReviews && allReviews.length > 0) {
                const reviewsToDisplay = showAll ? allReviews : allReviews.slice(0, 2);
                reviewBox.innerHTML = reviewsToDisplay.map(r => `
                    <div class="review-card">
                        <div class="rating-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                        <div class="review-meta">${r.student_name}</div>
                        <div class="review-comment">${r.comment}</div>
                    </div>
                `).join('');
                if (!showAll && allReviews.length > 2) {
                    container.innerHTML = `<button class="see-more-btn" onclick="displayReviews(true)">See More Reviews (${allReviews.length - 2}+)</button>`;
                } else {
                    container.innerHTML = "";
                }
            } else {
                reviewBox.innerHTML = "<p style='color: #64748b; font-size: 0.9rem;'>No reviews yet. Be the first to leave one!</p>";
                container.innerHTML = "";
            }
        }

        // --- 3. STAR RATING SYSTEM ---
        function setRating(n) {
            userRating = n;
            document.querySelectorAll('.star-input').forEach((s, i) => {
                s.classList.toggle('active', i < n);
            });
        }

        // --- 4. SUBMIT REVIEW ---
        async function submitReview() {
            const name = document.getElementById('stu-name').value.trim();
            const msg = document.getElementById('stu-comment').value.trim();
            if (!name || !msg || userRating === 0) {
                return alert("Please provide your name, a comment, and a star rating!");
            }
            const { error } = await _sb.from('reviews').insert([{
                ad_id: manualAdId,
                student_name: name,
                rating: userRating,
                comment: msg
            }]);
            if (error) {
                alert("Error submitting review: " + error.message);
            } else {
                alert("Review submitted successfully!");
                location.reload();
            }
        }

        // --- 5. REPORTING SYSTEM ---
        function openReport() { document.getElementById('reportModal').style.display = 'flex'; }
        function closeReport() { document.getElementById('reportModal').style.display = 'none'; }
        async function sendReport() {
            const reason = document.getElementById('report-reason').value;
            const { error } = await _sb.from('reports').insert([{
                ad_id: manualAdId,
                reason: reason,                status: 'pending'
            }]);
            if (error) {
                alert("Error sending report: " + error.message);
            } else {
                alert("Thank you. This advertisement has been reported for review.");
                closeReport();
            }
        }
        loadReviews();