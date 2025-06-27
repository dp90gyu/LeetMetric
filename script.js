document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");
    const loadingSpinner = document.getElementById("loading-spinner");
    const themeToggle = document.getElementById("theme-toggle");

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        if (!regex.test(username)) {
            alert("Invalid Username");
            return false;
        }
        return true;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
            loadingSpinner.classList.remove("hidden");

            const proxyUrl = 'http://localhost:3000/leetcode';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                                totalSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                            }
                        }
                    }
                `,
                variables: { username }
            });

            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            });

            if (!response.ok) throw new Error("Unable to fetch the User details");

            const parsedData = await response.json();

            if (!parsedData.data || !parsedData.data.matchedUser)
                throw new Error("User not found or data missing");

            displayUserData(parsedData);
        } catch (error) {
            console.error("Error:", error);
            statsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
            loadingSpinner.classList.add("hidden");
        }
    }

    function updateProgress(solved, total, label, circle) {
        const percentage = total === 0 ? 0 : (solved / total) * 100;
        circle.style.setProperty("--progress", `${percentage}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(data) {
        const q = data.data.allQuestionsCount;
        const a = data.data.matchedUser.submitStats.acSubmissionNum;
        const t = data.data.matchedUser.submitStats.totalSubmissionNum;

        const totalEasy = q.find(q => q.difficulty === "Easy")?.count || 0;
        const totalMedium = q.find(q => q.difficulty === "Medium")?.count || 0;
        const totalHard = q.find(q => q.difficulty === "Hard")?.count || 0;

        const solvedEasy = a.find(s => s.difficulty === "Easy")?.count || 0;
        const solvedMedium = a.find(s => s.difficulty === "Medium")?.count || 0;
        const solvedHard = a.find(s => s.difficulty === "Hard")?.count || 0;

        updateProgress(solvedEasy, totalEasy, easyLabel, easyProgressCircle);
        updateProgress(solvedMedium, totalMedium, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHard, totalHard, hardLabel, hardProgressCircle);

        const cards = [
            { label: "Overall Submissions", value: t[0]?.submissions || 0 },
            { label: "Overall Easy Submissions", value: t.find(s => s.difficulty === "Easy")?.submissions || 0 },
            { label: "Overall Medium Submissions", value: t.find(s => s.difficulty === "Medium")?.submissions || 0 },
            { label: "Overall Hard Submissions", value: t.find(s => s.difficulty === "Hard")?.submissions || 0 },
        ];

        cardStatsContainer.innerHTML = cards.map(c =>
            `<div class="card"><h4>${c.label}</h4><p>${c.value}</p></div>`).join("");
    }

    searchButton.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        if (validateUsername(username)) fetchUserDetails(username);
    });
});
