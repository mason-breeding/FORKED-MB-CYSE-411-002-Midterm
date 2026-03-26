// ============================================================
//  CYSE 411 Q4 Starter Code
//  Employee Directory Application


function loadSession() {
    const raw = sessionStorage.getItem("session");
    if (!raw) {
        return null;
    }

    try {
        const session = JSON.parse(raw);

        if (!session || typeof session !== "object") {
            return null;
        }

        const { userId, role, displayName } = session;
        const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

        if (!isNonEmptyString(userId) || !isNonEmptyString(role) || !isNonEmptyString(displayName)) {
            return null;
        }

        return {
            userId: userId.trim(),
            role: role.trim(),
            displayName: displayName.trim()
        };
    } catch (err) {
        console.warn("loadSession: invalid JSON in sessionStorage", err);
        return null;
    }
}


//  Q4.A  Status Message Rendering
//  Displays an employee's status message on their profile card.
//  VULNERABILITY: The message is inserted via innerHTML,
//  allowing any HTML or script tags in the message to
//  execute in the viewer's browser (stored XSS).


function sanitizeStatusMessage(message) {
    if (typeof message !== "string") {
        return "";
    }
    return message.trim().replace(/[\x00-\x1F\x7F]+/g, "");
}

function renderStatusMessage(containerElement, message) {
    const p = document.createElement("p");
    p.textContent = message;
    containerElement.appendChild(p);   // SAFE via textContent
}



//  Q4.B  Search Query Sanitization
//  Builds a display label from the user's search input.
//  VULNERABILITY: The raw input is used directly with no
//  character filtering, no length limit, and no trimming.


function sanitizeSearchQuery(input) {
    // TODO: Implement sanitization.
    // Requirements:
    //   - Allow only letters, digits, spaces, hyphens, underscores
    //   - Trim leading/trailing whitespace before processing
    //   - Max 40 characters
    //   - Return null if the result is empty after sanitization
    let sanitized = input.trim().replace(/[^a-zA-Z0-9 _-]/g, '');
    if (sanitized.length === 0) {
        return null;
    }

    return sanitized.substring(0, 40);   // UNSAFE – returns raw input unchanged
}

function performSearch(query) {
    const sanitized = sanitizeSearchQuery(query);
    const label = document.getElementById("search-label");
    label.innerHTML = "Showing results for: " + sanitized;  // UNSAFE
}



//  Application Bootstrap
//  Runs when the page finishes loading.


document.addEventListener("DOMContentLoaded", function () {

    // Load session
    const session = loadSession();
    if (session) {
        document.getElementById("welcome-msg").textContent =
            "Welcome, " + session.displayName;
    }

    // Simulate receiving a profile card with a status message
    // In production this would come from an API response.
    const simulatedProfiles = [
        {
            name: "Alice Johnson",
            department: "Engineering",
            status: "Working from home today"
        },
        {
            name: "Bob Martinez",
            department: "Security",
            // Attacker-controlled payload – should NOT execute
            status: "<img src=x onerror=\"alert('XSS: session stolen')\">"
        },
        {
            name: "Carol Lee",
            department: "HR",
            status: "Out of office until Friday"
        }
    ];

    const directory = document.getElementById("directory");

    simulatedProfiles.forEach(function (profile) {
        const card = document.createElement("div");
        card.className = "profile-card";

        const nameEl = document.createElement("h3");
        nameEl.textContent = profile.name;

        const deptEl = document.createElement("p");
        deptEl.textContent = "Department: " + profile.department;

        const statusContainer = document.createElement("div");
        statusContainer.className = "status";

        // Q4.A – fix this call
        const sanitizedStatus = sanitizeStatusMessage(profile.status);
        renderStatusMessage(statusContainer, sanitizedStatus);

        card.appendChild(nameEl);
        card.appendChild(deptEl);
        card.appendChild(statusContainer);
        directory.appendChild(card);
    });

    // Search button handler
    document.getElementById("search-btn").addEventListener("click", function () {
        const query = document.getElementById("search-input").value;
        performSearch(query);
    });

});
