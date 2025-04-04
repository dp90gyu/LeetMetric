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

    // Validate username with regex
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

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';

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

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }

            const parsedData = await response.json();
            console.log("Logging data: ", parsedData);

            if (!parsedData.data || !parsedData.data.matchedUser) {
                throw new Error("User not found or data missing");
            }

            displayUserData(parsedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            statsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        if (total === 0) {
            label.textContent = "0/0";
            return;
        }
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const questions = parsedData.data.allQuestionsCount;
        const submissions = parsedData.data.matchedUser.submitStats.acSubmissionNum;
        const totalSubmissions = parsedData.data.matchedUser.submitStats.totalSubmissionNum;

        if (questions.length < 3 || submissions.length < 3) {
            statsContainer.innerHTML = `<p>Data format unexpected</p>`;
            return;
        }

        const totalEasyQues = questions.find(q => q.difficulty === "Easy")?.count || 0;
        const totalMediumQues = questions.find(q => q.difficulty === "Medium")?.count || 0;
        const totalHardQues = questions.find(q => q.difficulty === "Hard")?.count || 0;

        const solvedTotalEasyQues = submissions.find(s => s.difficulty === "Easy")?.count || 0;
        const solvedTotalMediumQues = submissions.find(s => s.difficulty === "Medium")?.count || 0;
        const solvedTotalHardQues = submissions.find(s => s.difficulty === "Hard")?.count || 0;

        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: totalSubmissions[0]?.submissions || 0 },
            { label: "Overall Easy Submissions", value: totalSubmissions.find(s => s.difficulty === "Easy")?.submissions || 0 },
            { label: "Overall Medium Submissions", value: totalSubmissions.find(s => s.difficulty === "Medium")?.submissions || 0 },
            { label: "Overall Hard Submissions", value: totalSubmissions.find(s => s.difficulty === "Hard")?.submissions || 0 },
        ];

        cardStatsContainer.innerHTML = cardsData
            .map(data => `<div class="card"><h4>${data.label}</h4><p>${data.value}</p></div>`)
            .join("");
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value.trim();
        console.log("Logging username: ", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
