document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/feedback";

    // Fetch Feedback
    async function loadFeedback() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Failed to fetch feedback");
            const feedbacks = await res.json();

            renderFeedback(feedbacks);
            updateFeedbackStats(feedbacks);
            renderCharts(feedbacks);
        } catch (err) {
            console.error(err);
        }
    }

    // Render Feedback Review
    function renderFeedback(feedbacks) {
        const list = document.getElementById("feedbackList");
        list.innerHTML = "";

        feedbacks.forEach(fb => {
            const item = document.createElement("div");
            item.className = "feedback-item";
            item.innerHTML = `
        <h4>${fb.username} (${fb.rating}⭐) - <span>${fb.category}</span></h4>
        <p>${fb.message}</p>
      `;
            list.appendChild(item);
        });
    }

    // Update Cards
    function updateFeedbackStats(feedbacks) {
        const total = feedbacks.length;
        const avg = total > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) : 0;

        document.getElementById("totalFeedbacks").textContent = total;
        document.getElementById("avgRating").textContent = avg;
    }

    // Render Charts
    function renderCharts(feedbacks) {
        const ctx1 = document.getElementById("ratingsChart").getContext("2d");
        const ctx2 = document.getElementById("trendChart").getContext("2d");

        const ratingsCount = { 1:0,2:0,3:0,4:0,5:0 };
        feedbacks.forEach(f => ratingsCount[f.rating]++);

        new Chart(ctx1, {
            type: "pie",
            data: {
                labels: ["1⭐","2⭐","3⭐","4⭐","5⭐"],
                datasets: [{
                    data: Object.values(ratingsCount),
                    backgroundColor: ["#ef4444","#f97316","#facc15","#22c55e","#3b82f6"]
                }]
            }
        });

        // Dummy trend data
        const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        const trendData = days.map(() => Math.floor(Math.random() * 10));

        new Chart(ctx2, {
            type: "line",
            data: {
                labels: days,
                datasets: [{
                    label: "Feedbacks",
                    data: trendData,
                    borderColor: "#3b82f6",
                    fill: false,
                    tension: 0.3
                }]
            }
        });
    }

    // Dummy User Management Data
    const users = [
        {id:1, name:"Alice", email:"alice@mail.com", role:"User", status:"Active"},
        {id:2, name:"Bob", email:"bob@mail.com", role:"Admin", status:"Active"},
        {id:3, name:"Charlie", email:"charlie@mail.com", role:"User", status:"Inactive"},
    ];

    function renderUsers() {
        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";

        users.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.status}</td>
        <td>
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    }

    renderUsers();
    loadFeedback();
});
