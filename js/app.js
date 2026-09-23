/**
 * Antigravity Personal Portfolio Website Engine
 * Author: Bryce 
 * Stack: Vanilla HTML5 / CSS3 / ES6 Javascript
 */

document.addEventListener("DOMContentLoaded", async () => {
  let RESUME_DATA;
  try {
    const response = await fetch('../dist/resume.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    RESUME_DATA = await response.json();
  } catch (error) {
    console.error("Critical Error: resume.json could not be loaded!", error);
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = "position:fixed;inset:0;background:#0d1117;color:#f85149;display:flex;justify-content:center;align-items:center;font-family:monospace;font-size:1.2rem;padding:20px;text-align:center;z-index:999999;";
    errorDiv.textContent = "CRITICAL ERROR: Failed to load resume database (resume.json). Verify that the file exists and is well-formed JSON.";
    document.body.appendChild(errorDiv);
    return;
  }

  // --- Core Application DOM Registry ---
  const lockscreen = document.getElementById("lockscreen");
  const portfolioApp = document.getElementById("portfolio-app");
  
  // Tab Elements
  const tabButtons = document.querySelectorAll(".nav-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");
  
  // Theme & Shell Controls
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const btnRelock = document.getElementById("btn-relock");
  const lockscreenTime = document.getElementById("lockscreen-time");
  
  // CLI Elements
  const terminalInput = document.getElementById("terminal-input");
  const terminalBody = document.getElementById("terminal-body");
  const btnModeCli = document.getElementById("btn-mode-cli");
  const btnModePuzzle = document.getElementById("btn-mode-puzzle");
  const terminalPanel = document.getElementById("terminal-panel");
  const puzzlePanel = document.getElementById("puzzle-panel");
  
  // Puzzle Elements
  const puzzleGrid = document.getElementById("puzzle-grid");
  const patternSequenceText = document.getElementById("pattern-sequence");
  const btnResetPuzzle = document.getElementById("btn-reset-puzzle");

  // Blog Modal Elements
  const blogModal = document.getElementById("blog-modal");
  const btnCloseBlogModal = document.getElementById("btn-close-blog-modal");
  const modalBlogDate = document.getElementById("modal-blog-date");
  const modalBlogReadtime = document.getElementById("modal-blog-readtime");
  const modalBlogTitle = document.getElementById("modal-blog-title");
  const modalBlogContent = document.getElementById("modal-blog-content");


  // ==========================================================================
  // 1. STATE INITIALIZATION & ROUTING SETUP
  // ==========================================================================
  
  // Set real-time clock on lockscreen
  const updateClock = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    lockscreenTime.textContent = `${hoursStr}:${minutes} ${ampm}`;
  };
  updateClock();
  setInterval(updateClock, 60000);

  // Initialize Theme System
  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  };
  initTheme();

  // Theme Switching Event Listener
  btnThemeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Check Unlock Persistence State
  const checkAccessState = () => {
    const isUnlocked = sessionStorage.getItem("unlocked") === "true";
    if (isUnlocked) {
      bypassLockscreen();
    } else {
      // Direct focus onto terminal input if CLI is active
      setTimeout(() => {
        if (terminalPanel.classList.contains("active-panel")) {
          terminalInput.focus();
        }
      }, 500);
    }
  };


  // ==========================================================================
  // 2. DYNAMIC CONTENT RENDERING (POPULATE DOM)
  // ==========================================================================
  
  const populatePortfolioDOM = () => {
    // 2.1 Update Branding / Profile Header
    document.getElementById("brand-name").textContent = RESUME_DATA.profile.name;
    document.getElementById("brand-title").textContent = RESUME_DATA.profile.title;
    
    // 2.2 Sidebar Profile Card Content
    document.getElementById("profile-avatar").innerHTML = RESUME_DATA.profile.avatar || "BM";
    document.querySelector(".profile-name").textContent = RESUME_DATA.profile.name;
    document.querySelector(".profile-tagline").textContent = RESUME_DATA.profile.title;
    document.getElementById("profile-location-text").textContent = RESUME_DATA.profile.location;
    
    // Contact Links
    document.getElementById("contact-email").href = `mailto:${RESUME_DATA.profile.email}`;
    document.getElementById("contact-email-text").textContent = RESUME_DATA.profile.email;
    
    document.getElementById("contact-github").href = `https://${RESUME_DATA.profile.github}`;
    document.getElementById("contact-github-text").textContent = RESUME_DATA.profile.github;
    
    document.getElementById("contact-linkedin").href = `https://${RESUME_DATA.profile.linkedin}`;
    document.getElementById("contact-linkedin-text").textContent = RESUME_DATA.profile.linkedin;
    
    if (RESUME_DATA.profile.phone) {
      document.getElementById("contact-phone").style.display = "flex";
      document.getElementById("contact-phone").href = `tel:${RESUME_DATA.profile.phone.replace(/[^0-9+]/g, '')}`;
      document.getElementById("contact-phone-text").textContent = RESUME_DATA.profile.phone;
    } else {
      const phoneEl = document.getElementById("contact-phone");
      if (phoneEl) phoneEl.style.display = "none";
    }
    
    document.getElementById("btn-download-resume").href = RESUME_DATA.profile.pdfUrl || "#";

    // 2.3 Professional Summary
    document.getElementById("profile-summary-text").textContent = RESUME_DATA.profile.summary;

    // 2.4 Load Technical Expertise Categories
    const skillsContainer = document.getElementById("skills-list-container");
    skillsContainer.innerHTML = ""; // Clear
    RESUME_DATA.skills.forEach(skillGroup => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "skill-group";
      
      const groupHeading = document.createElement("h4");
      groupHeading.textContent = skillGroup.category;
      groupDiv.appendChild(groupHeading);
      
      const tagsContainer = document.createElement("div");
      tagsContainer.className = "skill-tags";
      
      skillGroup.items.forEach(skill => {
        const tagSpan = document.createElement("span");
        tagSpan.className = "skill-tag";
        tagSpan.textContent = skill;
        tagsContainer.appendChild(tagSpan);
      });
      
      groupDiv.appendChild(tagsContainer);
      skillsContainer.appendChild(groupDiv);
    });

    // 2.5 Load Experience Timeline
    const timelineContainer = document.getElementById("experience-timeline");
    timelineContainer.innerHTML = "";
    RESUME_DATA.experience.forEach(exp => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "timeline-item";
      
      let descHTML = "";
      if (Array.isArray(exp.description)) {
        descHTML = `<ul class="timeline-bullets">` + exp.description.map(bullet => `<li>${bullet}</li>`).join("") + `</ul>`;
      } else {
        descHTML = `<p class="timeline-desc">${exp.description}</p>`;
      }
      
      itemDiv.innerHTML = `
        <div class="timeline-node"></div>
        <div class="timeline-header">
          <div>
            <span class="timeline-role">${exp.role}</span>
            <span class="dot-separator">•</span>
            <span class="timeline-company">${exp.company}</span>
          </div>
          <span class="timeline-period">${exp.period}</span>
        </div>
        ${descHTML}
      `;
      timelineContainer.appendChild(itemDiv);
    });

    // 2.6 Load Education list
    const eduContainer = document.getElementById("education-list");
    eduContainer.innerHTML = "";
    RESUME_DATA.education.forEach(edu => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "education-item";
      
      itemDiv.innerHTML = `
        <div>
          <span class="edu-title">${edu.degree}</span>
          <span class="dot-separator">•</span>
          <span class="edu-school">${edu.school}</span>
          <p class="edu-details">${edu.details}</p>
        </div>
        <span class="timeline-period">${edu.period}</span>
      `;
      eduContainer.appendChild(itemDiv);
    });

    // 2.7 Load Projects List
    renderProjects("all");

    // 2.8 Load Blog Grid
    const blogContainer = document.getElementById("blog-grid-container");
    blogContainer.innerHTML = "";
    RESUME_DATA.blogPosts.forEach((post, index) => {
      const card = document.createElement("article");
      card.className = "blog-card card";
      card.innerHTML = `
        <div class="blog-card-meta">
          <span>${post.date}</span>
          <span class="dot-separator">•</span>
          <span>${post.readTime}</span>
        </div>
        <h3 class="blog-card-title">${post.title}</h3>
        <p class="blog-card-summary">${post.summary}</p>
        <div class="blog-card-footer">
          <button class="btn btn-secondary btn-read-blog" data-index="${index}" type="button">Read Full Article</button>
        </div>
      `;
      blogContainer.appendChild(card);
    });

    // Attach click listeners to blog reading buttons
    document.querySelectorAll(".btn-read-blog").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const postIdx = e.target.getAttribute("data-index");
        openBlogModal(parseInt(postIdx));
      });
    });

    // 2.9 Load Hobbies
    const hobbiesContainer = document.getElementById("hobbies-grid-container");
    hobbiesContainer.innerHTML = "";
    RESUME_DATA.hobbies.forEach(hobby => {
      const card = document.createElement("div");
      card.className = "hobby-card card";
      
      card.innerHTML = `
        <div class="hobby-icon">${hobby.icon}</div>
        <h3 class="hobby-name">${hobby.name}</h3>
        <p class="hobby-desc">${hobby.description}</p>
      `;
      hobbiesContainer.appendChild(card);
    });
  };

  // Dynamic projects render utility to support category filtering
  const renderProjects = (filterCategory) => {
    const projectsContainer = document.getElementById("projects-grid-container");
    projectsContainer.innerHTML = "";
    
    RESUME_DATA.projects.forEach(project => {
      // Check if project tags matches query (case-insensitive fuzzy match)
      const matchesFilter = filterCategory === "all" || project.tags.some(tag => {
        // Map common filter selectors to tags
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normalize(tag).includes(normalize(filterCategory));
      });
      
      if (!matchesFilter) return;

      const card = document.createElement("div");
      card.className = "project-card card";
      
      // Determine a fun icon for cards dynamically
      let icon = "💻";
      if (project.tags.some(t => t.toLowerCase().includes("audio"))) icon = "🎵";
      if (project.tags.some(t => t.toLowerCase().includes("wasm") || t.toLowerCase().includes("rust"))) icon = "⚙️";
      if (project.tags.some(t => t.toLowerCase().includes("security") || t.toLowerCase().includes("terminal"))) icon = "🔒";

      const tagsMarkup = project.tags.map(t => `<span class="project-tag">${t}</span>`).join("");

      card.innerHTML = `
        <div class="project-card-header">
          <span class="project-icon">${icon}</span>
          <div class="project-links">
            <a href="${project.githubLink}" target="_blank" rel="noopener" class="project-link-btn" title="View Source on GitHub">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-small"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            </a>
            <a href="${project.liveLink}" class="project-link-btn" title="View Live Demo">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon-small"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          </div>
        </div>
        <h3 class="project-card-title">${project.title}</h3>
        <p class="project-card-desc">${project.description}</p>
        <div class="project-card-tags">${tagsMarkup}</div>
      `;
      projectsContainer.appendChild(card);
    });
  };


  // ==========================================================================
  // 3. RESPONSIVE TAB HANDLERS
  // ==========================================================================
  
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetPanelId = button.getAttribute("aria-controls");
      
      // Update Tab state attributes
      tabButtons.forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute("tabindex", "-1");
      });
      
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      button.setAttribute("tabindex", "0");
      
      // Update Tab panels visibility
      tabPanels.forEach(panel => {
        panel.classList.remove("active-panel");
      });
      
      const targetPanel = document.getElementById(targetPanelId);
      targetPanel.classList.add("active-panel");
      
      // Force scroll to top of workspace
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Project Category Filter Handler
  const filterButtons = document.querySelectorAll(".btn-filter");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filterCategory = btn.getAttribute("data-filter");
      renderProjects(filterCategory);
    });
  });


  // ==========================================================================
  // 4. RETRO INTERACTIVE TERMINAL LOCKSCREEN CORE
  // ==========================================================================
  
  // Maintain terminal focus on click
  lockscreen.addEventListener("click", (e) => {
    // Only focus input if in CLI mode and modal/buttons aren't clicked
    if (terminalPanel.classList.contains("active-panel") && 
        e.target !== btnModeCli && e.target !== btnModePuzzle && 
        !e.target.closest(".bypass-selector")) {
      terminalInput.focus();
    }
  });

  // Switch Lockscreen Bypass Modes
  btnModeCli.addEventListener("click", () => {
    btnModeCli.classList.add("active");
    btnModeCli.setAttribute("aria-selected", "true");
    btnModePuzzle.classList.remove("active");
    btnModePuzzle.setAttribute("aria-selected", "false");
    
    terminalPanel.classList.add("active-panel");
    puzzlePanel.classList.remove("active-panel");
    terminalInput.focus();
  });

  btnModePuzzle.addEventListener("click", () => {
    btnModePuzzle.classList.add("active");
    btnModePuzzle.setAttribute("aria-selected", "true");
    btnModeCli.classList.remove("active");
    btnModeCli.setAttribute("aria-selected", "false");
    
    puzzlePanel.classList.add("active-panel");
    terminalPanel.classList.remove("active-panel");
    initPuzzleGrid();
  });

  // CLI Command Diagnostic Core
  const logTerminalRow = (text, type = "") => {
    const row = document.createElement("div");
    row.className = `terminal-row ${type}`;
    row.textContent = text;
    terminalBody.appendChild(row);
    
    // Auto-scroll terminal log
    terminalBody.scrollTop = terminalBody.scrollHeight;
  };

  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const rawInput = terminalInput.value;
      const cmd = rawInput.trim().toLowerCase();
      terminalInput.value = "";
      
      // Log echoing command typed
      logTerminalRow(`guest@antigravity:~$ ${rawInput}`, "user-echo");
      
      if (!cmd) return;

      // CLI Diagnostic Switchboard
      switch(cmd) {
        case "help":
          logTerminalRow("Available system diagnostics command matrix:", "system-msg");
          logTerminalRow("  about     - Output high-level profile summary for candidate", "system-msg");
          logTerminalRow("  skills    - List core programming languages and frameworks", "system-msg");
          logTerminalRow("  projects  - Fetch titles of outstanding creative works", "system-msg");
          logTerminalRow("  bypass    - Recover handshake puzzle security bypass sequence hint", "system-msg");
          logTerminalRow("  unlock    - Complete handshake sequence, dissolving block-gate", "system-msg");
          logTerminalRow("  matrix    - Stream digital system data rain onto the display", "system-msg");
          logTerminalRow("  clear     - Wipe local diagnostic history buffer", "system-msg");
          break;
          
        case "about":
          logTerminalRow("Candidate profile diagnostic details...", "success-msg");
          logTerminalRow(`Name: ${RESUME_DATA.profile.name}`);
          logTerminalRow(`Title: ${RESUME_DATA.profile.title}`);
          logTerminalRow(`Location: ${RESUME_DATA.profile.location}`);
          logTerminalRow(`Bio: ${RESUME_DATA.profile.summary}`);
          break;
          
        case "skills":
          logTerminalRow("Querying tech skills stack database...", "success-msg");
          RESUME_DATA.skills.forEach(grp => {
            logTerminalRow(`  [${grp.category}]: ${grp.items.join(", ")}`);
          });
          break;
          
        case "projects":
          logTerminalRow("Querying outstanding projects catalog...", "success-msg");
          RESUME_DATA.projects.forEach((proj, i) => {
            logTerminalRow(`  ${i+1}. ${proj.title}: ${proj.description.substring(0, 70)}...`);
          });
          break;
          
        case "bypass":
          logTerminalRow("Initiating decryption sequence for alignment patterns...", "system-msg");
          setTimeout(() => {
            logTerminalRow("HANDSHAKE BYPASS KEY DETECTED:", "success-msg");
            logTerminalRow("Sequence Path: [ Node 1 ] -> [ Node 6 ] -> [ Node 7 ] -> [ Node 12 ]", "success-msg");
          }, 450);
          break;
          
        case "clear":
          terminalBody.innerHTML = "";
          logTerminalRow("Terminal diagnostic buffer cleared.", "system-msg");
          break;
          
        case "unlock":
          logTerminalRow("Handshake override initiated... VALIDATING CRAWLER BLOCKERS...", "system-msg");
          setTimeout(() => {
            logTerminalRow("Bypass override completed! Handshake established.", "success-msg");
            setTimeout(() => {
              bypassLockscreen();
            }, 500);
          }, 600);
          break;
          
        case "matrix":
          logTerminalRow("Entering digital stream sequence... ESC to abort.", "system-msg");
          triggerMatrixStream();
          break;
          
        default:
          logTerminalRow(`Command diagnostic check failed: '${cmd}'. Type 'help' for support catalog.`, "error-msg");
      }
    }
  });

  // Retro Matrix streams simulated
  let matrixTimer = null;
  const triggerMatrixStream = () => {
    // Disable normal input while typing streams
    terminalInput.disabled = true;
    let counts = 0;
    
    matrixTimer = setInterval(() => {
      // Draw random binary string
      let binStr = "";
      for (let i = 0; i < 60; i++) {
        binStr += Math.random() > 0.5 ? "1" : "0";
      }
      
      // Inject random character noise in matrix blue
      if (Math.random() > 0.8) {
        binStr = binStr.substring(0, 15) + " ANTIGRAVITY_PORTFOLIO_SYSTEM " + binStr.substring(45);
      }
      
      logTerminalRow(binStr, "success-msg");
      counts++;
      
      if (counts > 25) {
        clearInterval(matrixTimer);
        terminalInput.disabled = false;
        terminalInput.focus();
        logTerminalRow("Diagnostic data rain stream terminated successfully.", "system-msg");
      }
    }, 80);
  };


  // ==========================================================================
  // 5. SECURE GEOMETRIC CIRCUIT BYPASS PUZZLE LOGIC
  // ==========================================================================
  
  // Sequence sequence pattern matching: Node 1 -> Node 6 -> Node 7 -> Node 12
  const PUZZLE_SECRET_PATH = [1, 6, 7, 12];
  let currentSelectedPath = [];

  const initPuzzleGrid = () => {
    puzzleGrid.innerHTML = ""; // Clear
    currentSelectedPath = [];
    patternSequenceText.textContent = "IDLE (GRID RESET)";
    patternSequenceText.className = "pattern-sequence";
    
    // Generate 12 nodes (3 rows x 4 columns)
    // Layout indices: 1 to 12
    for (let i = 1; i <= 12; i++) {
      const node = document.createElement("div");
      node.className = "puzzle-node";
      node.textContent = i;
      node.setAttribute("data-node-id", i);
      
      node.addEventListener("click", () => {
        handleNodeClick(i, node);
      });
      
      puzzleGrid.appendChild(node);
    }
  };

  const handleNodeClick = (nodeId, nodeElement) => {
    // Prevent double clicking already selected elements
    if (nodeElement.classList.contains("selected")) return;
    
    // Determine the position in secret path
    const expectedStepIndex = currentSelectedPath.length;
    const expectedNodeId = PUZZLE_SECRET_PATH[expectedStepIndex];
    
    if (nodeId === expectedNodeId) {
      // Correct node clicked in sequence!
      currentSelectedPath.push(nodeId);
      nodeElement.classList.add("selected");
      
      // Update UI Text Indicator
      patternSequenceText.textContent = currentSelectedPath.map(n => `Node ${n}`).join(" ➡️ ");
      patternSequenceText.className = "pattern-sequence success-msg";
      
      // Check if sequence completed fully
      if (currentSelectedPath.length === PUZZLE_SECRET_PATH.length) {
        patternSequenceText.textContent = "ACCESS BYPASS GRANTED! HANDSHAKE ESTABLISHED.";
        patternSequenceText.className = "pattern-sequence success-msg";
        
        setTimeout(() => {
          bypassLockscreen();
        }, 800);
      }
    } else {
      // Incorrect node clicked! Jitter flash error
      const selectedNodes = puzzleGrid.querySelectorAll(".puzzle-node.selected, .puzzle-node");
      
      // Flash red elements
      selectedNodes.forEach(node => {
        if (node.classList.contains("selected") || parseInt(node.getAttribute("data-node-id")) === nodeId) {
          node.classList.add("pulse-error");
        }
      });
      
      patternSequenceText.textContent = "SECURITY BREACH DETECTED: INVALID SEQUENCE RESET!";
      patternSequenceText.className = "pattern-sequence error-msg";
      
      // Reset after animation completed
      setTimeout(() => {
        initPuzzleGrid();
      }, 700);
    }
  };

  btnResetPuzzle.addEventListener("click", () => {
    initPuzzleGrid();
  });


  // ==========================================================================
  // 6. DECRYPT TRANSITIONS & GLOBAL ACTIONS
  // ==========================================================================
  
  const bypassLockscreen = () => {
    // Save session state to prevent lockscreen reprompt
    sessionStorage.setItem("unlocked", "true");
    
    // Animate lockscreen exit
    lockscreen.classList.add("unlocked");
    
    // Reveal Portfolio
    portfolioApp.classList.remove("hidden");
    
    // Initialize full portfolio data
    populatePortfolioDOM();
  };

  // Relock Action Utility
  btnRelock.addEventListener("click", () => {
    // Wipes unlock state
    sessionStorage.removeItem("unlocked");
    
    // Bring lockscreen back
    lockscreen.classList.remove("unlocked");
    portfolioApp.classList.add("hidden");
    
    // Focus terminal CLI
    btnModeCli.click();
    terminalInput.value = "";
    terminalBody.innerHTML = "";
    logTerminalRow("Handshake status revoked. MainPage re-locked.", "system-msg");
  });


  // ==========================================================================
  // 7. MARKDOWN BLOG READING MODAL READER
  // ==========================================================================
  
  const openBlogModal = (postIndex) => {
    const post = RESUME_DATA.blogPosts[postIndex];
    if (!post) return;
    
    modalBlogDate.textContent = post.date;
    modalBlogReadtime.textContent = post.readTime;
    modalBlogTitle.textContent = post.title;
    
    // Convert markdown content to simple beautiful HTML elements
    modalBlogContent.innerHTML = parseMarkdownToHTML(post.content);
    
    // Open Overlay
    blogModal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent page background scroll
  };

  const closeBlogModal = () => {
    blogModal.classList.add("hidden");
    document.body.style.overflow = ""; // Re-enable background scrolling
  };

  btnCloseBlogModal.addEventListener("click", closeBlogModal);
  
  // Close modal when tapping overlay backdrop
  blogModal.addEventListener("click", (e) => {
    if (e.target === blogModal) {
      closeBlogModal();
    }
  });

  // Simple clientside markdown parsing engine
  const parseMarkdownToHTML = (markdown) => {
    if (!markdown) return "";
    
    let html = markdown;
    
    // Handle titles: ### Header
    html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    
    // Handle bold: **Text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Handle inline code: `code`
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");
    
    // Handle multi-line codeblocks: ```lang\nCode\n```
    html = html.replace(/```(.*?)\n([\s\S]*?)\n```/g, "<pre><code>$2</code></pre>");
    
    // Handle bullet lists: - Item
    html = html.replace(/^- (.*?)$/gm, "<li>$1</li>");
    // Wrap lists in ul
    html = html.replace(/(<li>.*?<\/li>)/s, "<ul>$1</ul>");
    
    // Split text into paragraphs unless it is a list or code element
    const lines = html.split("\n\n");
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      
      // Skip wrapping elements already converted
      if (trimmed.startsWith("<h") || trimmed.startsWith("<pre") || trimmed.startsWith("<ul") || trimmed.startsWith("<li>")) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    });
    
    return processedLines.join("\n");
  };


  // --- Run Diagnostic Access Routing Checks ---
  checkAccessState();
});
