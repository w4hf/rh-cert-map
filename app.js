(function () {
  "use strict";

  const {
    evaluateProduct,
    bindArchitectSpecialists,
    normalizeCredName,
    matchCredentialsToExams: matchCredentialsAgainst,
    filterAchievedCredentials: filterAchievedAgainst,
    getExamLevel,
    isRedHatVerifyDocument,
  } = window.CertLogic;

  // ── Data ──────────────────────────────────────────────────────────────────

  const PRODUCTS = [
    {
      name: "OpenShift",
      nodes: [
        { id: "tech", name: "Technologist", col: 0, row: "center", type: "credential", rule: { type: "any", codes: ["EX180", "EX156"] }, hint: "Pass EX180 or EX156" },
        { id: "sysadm", name: "System Administrator", col: 1, row: "upper", type: "credential", rule: { type: "all", codes: ["EX280"] }, hint: "Pass EX280" },
        { id: "advsysadm", name: "Advanced System Administrator", col: 1, row: "lower", type: "credential", rule: { type: "all", codes: ["EX380"] }, hint: "Pass EX380" },
        { id: "engineer", name: "Engineer", col: 2, row: "upper", type: "meta", rule: { type: "meta", requires: ["sysadm", "advsysadm"] }, hint: "Achieve System Administrator + Advanced System Administrator" },
        { id: "specialist", name: "Specialist", col: 2, row: "lower", type: "credential", rule: { type: "any", codes: ["EX316", "EX336", "EX370", "EX430", "EX432", "EX282", "EX229", "EX480"] }, hint: "Pass any specialist exam" },
        { id: "architect", name: "Architect", col: 3, row: "center", type: "meta", rule: { type: "metaPlus", requires: ["engineer"], minSpecialist: 3 }, hint: "Achieve Engineer + pass at least 3 specialist exams" },
      ],
      edges: [
        ["tech", "sysadm"], ["tech", "advsysadm"],
        ["sysadm", "engineer"], ["advsysadm", "engineer"],
        ["engineer", "architect"], ["specialist", "architect"],
      ],
      exams: [
        { code: "EX180", name: "Red Hat Certified Technologist in OpenShift" },
        { code: "EX156", name: "Red Hat Certified Technologist in OpenShift Virtualization" },
        { code: "EX280", name: "Red Hat Certified System Administrator in OpenShift" },
        { code: "EX380", name: "Red Hat Certified Advanced System Administrator in OpenShift" },
        { code: "EX316", name: "Red Hat Certified Specialist in OpenShift Virtualization" },
        { code: "EX336", name: "Red Hat Certified Specialist in Automating OpenShift Virtual Machine Management" },
        { code: "EX370", name: "Red Hat Certified Specialist in OpenShift Data Foundation" },
        { code: "EX430", name: "Red Hat Certified Specialist in OpenShift Advanced Cluster Security" },
        { code: "EX432", name: "Red Hat Certified Specialist in OpenShift Advanced Cluster Management" },
        { code: "EX282", name: "Red Hat Certified Specialist in OpenShift Networking" },
        { code: "EX229", name: "Red Hat Certified Specialist in ROSA (Retired)" },
        { code: "EX480", name: "Red Hat Certified Specialist in MultiCluster Management (Retired)" },
      ],
    },
    {
      name: "Enterprise Linux",
      nodes: [
        { id: "sysadm", name: "System Administrator", col: 0, row: "upper", type: "credential", rule: { type: "all", codes: ["EX200"] }, hint: "Pass EX200 (RHCSA)" },
        { id: "advsysadm", name: "Advanced System Administrator", col: 0, row: "lower", type: "credential", rule: { type: "all", codes: ["EX342"] }, hint: "Pass EX342" },
        { id: "engineer", name: "Engineer", col: 1, row: "upper", type: "meta", rule: { type: "meta", requires: ["sysadm", "advsysadm"] }, hint: "Achieve System Administrator + Advanced System Administrator" },
        { id: "specialist", name: "Specialist", col: 1, row: "lower", type: "credential", rule: { type: "any", codes: ["EX210", "EX260", "EX358", "EX362", "EX403", "EX415", "EX436", "EX442"] }, hint: "Pass any specialist exam" },
        { id: "architect", name: "Architect", col: 2, row: "center", type: "meta", rule: { type: "metaPlus", requires: ["engineer"], minSpecialist: 3 }, hint: "Achieve Engineer + pass at least 3 specialist exams" },
      ],
      edges: [
        ["sysadm", "engineer"], ["advsysadm", "engineer"],
        ["engineer", "architect"], ["specialist", "architect"],
      ],
      exams: [
        { code: "EX200", name: "Red Hat Certified System Administrator (RHCSA)" },
        { code: "EX342", name: "Red Hat Certified Advanced System Administrator in Enterprise Linux" },
        { code: "EX210", name: "Red Hat Certified Specialist in Cloud Infrastructure" },
        { code: "EX260", name: "Red Hat Certified Specialist in Ceph Cloud Storage" },
        { code: "EX358", name: "Red Hat Certified Specialist in Services Management and Automation" },
        { code: "EX362", name: "Red Hat Certified Specialist in Identity Management" },
        { code: "EX403", name: "Red Hat Certified Specialist in Deployment and Systems Management" },
        { code: "EX415", name: "Red Hat Certified Specialist in Security: Linux" },
        { code: "EX436", name: "Red Hat Certified Specialist in High Availability Clustering" },
        { code: "EX442", name: "Red Hat Certified Specialist in Performance Tuning" },
      ],
    },
    {
      name: "Ansible",
      nodes: [
        { id: "sysadm", name: "System Administrator", col: 0, row: "upper", type: "credential", rule: { type: "all", codes: ["EX200"] }, hint: "Pass EX200 (RHCSA)" },
        { id: "advsysadm", name: "Advanced System Administrator", col: 0, row: "lower", type: "credential", rule: { type: "all", codes: ["EX294"] }, hint: "Pass EX294" },
        { id: "engineer", name: "Engineer", col: 1, row: "upper", type: "meta", rule: { type: "meta", requires: ["sysadm", "advsysadm"] }, hint: "Achieve System Administrator + Advanced System Administrator" },
        { id: "specialist", name: "Specialist", col: 1, row: "lower", type: "credential", rule: { type: "any", codes: ["EX374", "EX417", "EX457", "EX467"] }, hint: "Pass any specialist exam" },
        { id: "architect", name: "Architect", col: 2, row: "center", type: "meta", rule: { type: "metaPlus", requires: ["engineer"], minSpecialist: 3 }, hint: "Achieve Engineer + pass at least 3 specialist exams" },
      ],
      edges: [
        ["sysadm", "engineer"], ["advsysadm", "engineer"],
        ["engineer", "architect"], ["specialist", "architect"],
      ],
      exams: [
        { code: "EX200", name: "Red Hat Certified System Administrator (RHCSA)" },
        { code: "EX294", name: "Red Hat Certified Advanced System Administrator in Ansible" },
        { code: "EX374", name: "Red Hat Certified Specialist in Developing Automation with Ansible Automation Platform" },
        { code: "EX417", name: "Red Hat Certified Specialist in Microsoft Windows Automation with Ansible" },
        { code: "EX457", name: "Red Hat Certified Specialist in Ansible Network Automation" },
        { code: "EX467", name: "Red Hat Certified Specialist in Managing Automation with Ansible Automation Platform" },
      ],
    },
    {
      name: "Cloud-Native Applications",
      nodes: [
        { id: "dev", name: "Developer", col: 0, row: "upper", type: "credential", rule: { type: "all", codes: ["EX188"] }, hint: "Pass EX188" },
        { id: "advdev", name: "Advanced Developer", col: 0, row: "lower", type: "credential", rule: { type: "all", codes: ["EX288"] }, hint: "Pass EX288" },
        { id: "engineer", name: "Engineer", col: 1, row: "upper", type: "meta", rule: { type: "meta", requires: ["dev", "advdev"] }, hint: "Achieve Developer + Advanced Developer" },
        { id: "specialist", name: "Specialist", col: 1, row: "lower", type: "credential", rule: { type: "any", codes: ["EX183", "EX221", "EX240", "EX248", "EX328", "EX378", "EX482"] }, hint: "Pass any specialist exam" },
        { id: "architect", name: "Architect", col: 2, row: "center", type: "meta", rule: { type: "metaPlus", requires: ["engineer"], minSpecialist: 3 }, hint: "Achieve Engineer + pass at least 3 specialist exams" },
      ],
      edges: [
        ["dev", "engineer"], ["advdev", "engineer"],
        ["engineer", "architect"], ["specialist", "architect"],
      ],
      exams: [
        { code: "EX188", name: "Red Hat Certified Developer in Cloud-native Applications" },
        { code: "EX288", name: "Red Hat Certified Advanced Developer in Cloud-native Applications" },
        { code: "EX183", name: "Red Hat Certified Specialist in Enterprise Application Development" },
        { code: "EX221", name: "Red Hat Certified Specialist in Cloud-native Integration (Retired)" },
        { code: "EX240", name: "Red Hat Certified Specialist in API Management (Retired)" },
        { code: "EX248", name: "Red Hat Certified Specialist in Enterprise Application Server Administration" },
        { code: "EX328", name: "Red Hat Certified Specialist in Building Resilient Microservices" },
        { code: "EX378", name: "Red Hat Certified Specialist in Cloud-native Development" },
        { code: "EX482", name: "Red Hat Certified Specialist in Event-Driven Application Development" },
      ],
    },
    {
      name: "AI",
      nodes: [
        { id: "dev", name: "Developer", col: 0, row: "center", type: "credential", rule: { type: "all", codes: ["EX267"] }, hint: "Pass EX267" },
      ],
      edges: [],
      exams: [
        { code: "EX267", name: "Red Hat Certified Developer in AI" },
      ],
    },
  ];

  bindArchitectSpecialists(PRODUCTS);

  // Pre-computed deduped list of all exams across products
  const ALL_EXAMS = (() => {
    const seen = new Set();
    const list = [];
    PRODUCTS.forEach((p) => {
      p.exams.forEach((e) => {
        if (!seen.has(e.code)) {
          seen.add(e.code);
          list.push(e);
        }
      });
    });
    return list;
  })();

  // Derive codes array from a node's rule for tooltip display
  function getNodeCodes(node, product) {
    const r = node.rule;
    if (r.type === "meta") {
      const codes = [];
      for (const reqId of r.requires) {
        const reqNode = product.nodes.find((n) => n.id === reqId);
        if (reqNode) codes.push(...getNodeCodes(reqNode, product));
      }
      return codes;
    }
    if (r.type === "metaPlus") {
      return r.specialist || [];
    }
    if (r.codes) return r.codes;
    return [];
  }

  const STORAGE_KEY = "redhat-cert-map-passed";
  const EXPIRY_KEY = "redhat-cert-map-expiry";

  // ── State ─────────────────────────────────────────────────────────────────

  let passedExams = new Set(loadState());
  const examExpiry = new Map();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private mode and a full quota both throw. The page still updates.
    }
  }

  function loadExpiry() {
    try {
      const raw = localStorage.getItem(EXPIRY_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
      Object.entries(obj).forEach(([code, expiry]) => {
        if (typeof expiry === "string" && expiry && passedExams.has(code)) {
          examExpiry.set(code, expiry);
        }
      });
    } catch {
      // A blocked or corrupt store leaves the map without dates.
    }
  }

  function saveExpiry() {
    const obj = {};
    examExpiry.forEach((expiry, code) => {
      if (passedExams.has(code)) obj[code] = expiry;
    });
    writeStorage(EXPIRY_KEY, JSON.stringify(obj));
  }

  function saveState() {
    writeStorage(STORAGE_KEY, JSON.stringify([...passedExams]));
    saveExpiry();
  }

  loadExpiry();

  // ── Exam Checklist Rendering ──────────────────────────────────────────────

  const examListEl = document.getElementById("exam-list");
  const searchEl = document.getElementById("exam-search");
  const clearBtn = document.getElementById("clear-all");
  const sortToggleBtn = document.getElementById("sort-toggle");
  const viewBtns = document.querySelectorAll(".cert-view-btn");

  let currentView = "product";
  let sortAsc = true;

  const renderedCheckboxes = new Map();

  const LEVEL_ORDER = ["Technologist", "Developer", "Advanced Developer", "System Administrator", "Advanced System Administrator", "Engineer", "Specialist", "Other"];

  function sortExams(exams) {
    return [...exams].sort((a, b) => {
      const cmp = a.code.localeCompare(b.code);
      return sortAsc ? cmp : -cmp;
    });
  }

  function createExamItem(exam, idSuffix) {
    const item = document.createElement("div");
    item.className = "exam-item";
    item.dataset.code = exam.code;
    item.dataset.search = `${exam.code} ${exam.name}`.toLowerCase();

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `cb-${idSuffix}-${exam.code}`;
    cb.checked = passedExams.has(exam.code);

    const label = document.createElement("label");
    label.htmlFor = cb.id;
    label.innerHTML = `<span class="exam-code">${exam.code}</span> <span class="exam-name">— ${exam.name}</span>`;

    cb.addEventListener("change", () => {
      if (cb.checked) {
        passedExams.add(exam.code);
      } else {
        passedExams.delete(exam.code);
        examExpiry.delete(exam.code);
      }
      syncSharedCheckboxes(exam.code, cb.checked);
      saveState();
      updateMap();
    });

    item.appendChild(cb);
    item.appendChild(label);

    if (!renderedCheckboxes.has(exam.code)) {
      renderedCheckboxes.set(exam.code, []);
    }
    renderedCheckboxes.get(exam.code).push(cb);

    return item;
  }

  function buildGroupView(groupName, exams, idPrefix) {
    const group = document.createElement("div");
    group.className = "exam-group";

    const toggle = document.createElement("button");
    toggle.className = "group-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = `<span class="chevron"></span>${groupName}`;
    toggle.addEventListener("click", () => {
      group.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", String(!group.classList.contains("collapsed")));
    });
    group.appendChild(toggle);

    const examsWrap = document.createElement("div");
    examsWrap.className = "group-exams";

    const sorted = sortExams(exams);
    sorted.forEach((exam) => {
      examsWrap.appendChild(createExamItem(exam, idPrefix));
    });

    group.appendChild(examsWrap);
    return group;
  }

  function renderExamList() {
    examListEl.innerHTML = "";
    renderedCheckboxes.clear();

    if (currentView === "product") {
      PRODUCTS.forEach((product) => {
        const exams = product.exams;
        examListEl.appendChild(buildGroupView(product.name, exams, product.name));
      });
    } else if (currentView === "level") {
      const groups = {};
      LEVEL_ORDER.forEach((l) => { groups[l] = []; });
      const seen = new Set();
      PRODUCTS.forEach((p) => {
        p.exams.forEach((e) => {
          if (seen.has(e.code)) return;
          seen.add(e.code);
          const level = getExamLevel(e.name);
          groups[level].push(e);
        });
      });
      LEVEL_ORDER.forEach((level) => {
        if (groups[level].length > 0) {
          examListEl.appendChild(buildGroupView(level, groups[level], level));
        }
      });
    } else {
      const allExams = sortExams(ALL_EXAMS);
      const wrap = document.createElement("div");
      wrap.className = "group-exams";
      allExams.forEach((exam) => {
        wrap.appendChild(createExamItem(exam, "flat"));
      });
      examListEl.appendChild(wrap);
    }

    applySearchFilter();
  }

  function applySearchFilter() {
    const query = searchEl.value.toLowerCase().trim();
    document.querySelectorAll(".exam-item").forEach((item) => {
      item.classList.toggle("hidden", query !== "" && !item.dataset.search.includes(query));
    });
  }

  function syncSharedCheckboxes(code, checked) {
    const cbs = renderedCheckboxes.get(code);
    if (!cbs) return;
    cbs.forEach((cb) => { cb.checked = checked; });
  }

  // View mode buttons
  viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      currentView = btn.dataset.view;
      renderExamList();
    });
  });

  // Sort toggle
  sortToggleBtn.addEventListener("click", () => {
    sortAsc = !sortAsc;
    sortToggleBtn.textContent = sortAsc ? "A\u2192Z" : "Z\u2192A";
    sortToggleBtn.setAttribute("aria-label", sortAsc ? "Sort ascending" : "Sort descending");
    renderExamList();
  });

  // Search filter (debounced for mobile performance)
  let searchTimer;
  searchEl.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearchFilter, 100);
  });

  // Clear all
  clearBtn.addEventListener("click", () => {
    passedExams.clear();
    examExpiry.clear();
    saveState();
    document.querySelectorAll('#exam-list input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
    updateMap();
    verifyStatus.textContent = "";
    verifyStatus.className = "cert-verify-status";
    clearLookupResults();
    clearCertIdParam();
  });

  // ── Certification Map Rendering (SVG) ─────────────────────────────────────

  const mapEl = document.getElementById("cert-map");
  const tooltipEl = document.getElementById("tooltip");

  const SVG_NS = "http://www.w3.org/2000/svg";

  function getMapSizes() {
    const narrow = window.innerWidth <= 600;
    return {
      nodeRadius: narrow ? 10 : 14,
      rowHeight: narrow ? 260 : 300,
      paddingLeft: narrow ? 50 : 70,
      paddingRight: narrow ? 50 : 70,
      upperY: narrow ? 28 : 35,
      lowerY: narrow ? 120 : 145,
      centerY: narrow ? 70 : 88,
      labelOffsetY: narrow ? 18 : 20,
      checkScale: narrow ? 0.7 : 1,
      arrowSize: narrow ? 4 : 5,
      hoverExtra: narrow ? 12 : 4,
    };
  }

  function getNodeY(node, s) {
    if (node.row === "upper") return s.upperY;
    if (node.row === "lower") return s.lowerY;
    return s.centerY;
  }

  // Scalloped badge outline path (wavy circle with ribbon tails)
  function createBadgeOutline(cx, cy, r) {
    const bumps = 12;
    const outerR = r;
    const innerR = r * 0.82;
    let d = "";
    for (let i = 0; i < bumps; i++) {
      const a1 = (Math.PI * 2 * i) / bumps - Math.PI / 2;
      const a2 = (Math.PI * 2 * (i + 0.5)) / bumps - Math.PI / 2;
      const a3 = (Math.PI * 2 * (i + 1)) / bumps - Math.PI / 2;
      const ox = cx + outerR * Math.cos(a1);
      const oy = cy + outerR * Math.sin(a1);
      const ix = cx + innerR * Math.cos(a2);
      const iy = cy + innerR * Math.sin(a2);
      const nx = cx + outerR * Math.cos(a3);
      const ny = cy + outerR * Math.sin(a3);
      if (i === 0) d += `M${ox.toFixed(1)},${oy.toFixed(1)}`;
      d += ` Q${ix.toFixed(1)},${iy.toFixed(1)} ${nx.toFixed(1)},${ny.toFixed(1)}`;
    }
    d += " Z";
    // Ribbon tails
    const rw = r * 0.35;
    const rh = r * 0.7;
    const ry = cy + outerR * 0.6;
    d += ` M${cx - rw * 1.8},${ry} L${cx - rw * 2.2},${ry + rh} L${cx - rw * 0.8},${ry + rh * 0.65} Z`;
    d += ` M${cx + rw * 1.8},${ry} L${cx + rw * 2.2},${ry + rh} L${cx + rw * 0.8},${ry + rh * 0.65} Z`;
    return d;
  }

  let mapRefs = null;

  function buildMap() {
    mapEl.innerHTML = "";
    const s = getMapSizes();
    mapRefs = [];

    PRODUCTS.forEach((product) => {
      const row = document.createElement("div");
      row.className = "product-row";

      const label = document.createElement("div");
      label.className = "product-label";
      label.textContent = product.name;
      row.appendChild(label);

      const nodes = product.nodes;
      if (nodes.length === 0) return;

      const maxCol = Math.max(...nodes.map((n) => n.col));
      const containerWidth = mapEl.clientWidth || 600;
      const usable = containerWidth - s.paddingLeft - s.paddingRight;
      const gap = maxCol > 0 ? usable / maxCol : 0;
      const svgWidth = containerWidth;

      const nodePositions = {};
      nodes.forEach((node) => {
        const cx = s.paddingLeft + node.col * gap;
        const cy = getNodeY(node, s);
        nodePositions[node.id] = { cx, cy };
      });

      // Place convergence targets at the midpoint of their source nodes,
      // then offset same-column lower-row nodes to maintain equal spacing
      const incomingMap = {};
      product.edges.forEach(([fromId, toId]) => {
        if (!incomingMap[toId]) incomingMap[toId] = [];
        incomingMap[toId].push(fromId);
      });
      const rowGap = s.lowerY - s.upperY;
      for (const [nodeId, sources] of Object.entries(incomingMap)) {
        if (sources.length >= 2) {
          const avgY = sources.reduce((sum, srcId) => sum + nodePositions[srcId].cy, 0) / sources.length;
          nodePositions[nodeId].cy = avgY;

          const node = nodes.find((n) => n.id === nodeId);
          if (node) {
            const sameColLower = nodes.find((n) => n.col === node.col && n.row === "lower" && n.id !== nodeId);
            if (sameColLower && nodePositions[sameColLower.id]) {
              nodePositions[sameColLower.id].cy = avgY + rowGap;
            }
          }
        }
      }

      // Compute SVG height to tightly fit content
      const maxNodeY = Math.max(...Object.values(nodePositions).map((p) => p.cy));
      const svgHeight = maxNodeY + s.nodeRadius + s.labelOffsetY + 30;

      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
      svg.setAttribute("height", svgHeight);
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", `${product.name} certification track`);

      const productRef = { edges: [], nodes: {} };

      // Draw edges as orthogonal paths with rounded corners
      product.edges.forEach(([fromId, toId]) => {
        const from = nodePositions[fromId];
        const to = nodePositions[toId];
        if (!from || !to) return;

        const x1 = from.cx + s.nodeRadius;
        const x2 = to.cx - s.nodeRadius;
        const y1 = from.cy;
        const y2 = to.cy;

        let pathD;
        if (y1 === y2) {
          pathD = `M${x1},${y1} L${x2},${y2}`;
        } else {
          const midX = (x1 + x2) / 2;
          const r = Math.min(12, Math.abs(y2 - y1) / 2, Math.abs(midX - x1), Math.abs(x2 - midX));
          const dy = y2 > y1 ? 1 : -1;
          pathD = `M${x1},${y1} L${midX - r},${y1}` +
            ` Q${midX},${y1} ${midX},${y1 + r * dy}` +
            ` L${midX},${y2 - r * dy}` +
            ` Q${midX},${y2} ${midX + r},${y2}` +
            ` L${x2},${y2}`;
        }

        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", pathD);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-width", "2");
        path.classList.add("level-connector");
        svg.appendChild(path);

        const a = s.arrowSize;
        const arrow = document.createElementNS(SVG_NS, "polygon");
        arrow.setAttribute("points",
          `${x2},${y2} ${x2 - a * 2},${y2 - a} ${x2 - a * 2},${y2 + a}`
        );
        arrow.classList.add("arrowhead");
        svg.appendChild(arrow);

        productRef.edges.push({ line: path, arrow, fromId, toId });
      });

      // Draw nodes
      nodes.forEach((node) => {
        const { cx, cy } = nodePositions[node.id];
        const clipId = `clip-${product.name.replace(/\s+/g, "")}-${node.id}`;

        let circle;
        if (node.type === "meta") {
          circle = document.createElementNS(SVG_NS, "path");
          circle.setAttribute("d", createBadgeOutline(cx, cy, s.nodeRadius + 2));
          circle.setAttribute("stroke-width", "2");
          circle.classList.add("level-node", "meta");
          if (node.id === "architect") circle.classList.add("architect");
        } else {
          circle = document.createElementNS(SVG_NS, "circle");
          circle.setAttribute("cx", cx);
          circle.setAttribute("cy", cy);
          circle.setAttribute("r", s.nodeRadius);
          circle.setAttribute("stroke-width", "2.5");
          circle.classList.add("level-node");
        }
        const titleEl = document.createElementNS(SVG_NS, "title");
        titleEl.textContent = `${product.name} — ${node.name}`;
        circle.appendChild(titleEl);
        svg.appendChild(circle);

        // Partial fill (only for credential nodes)
        let fillRect = null;
        if (node.type !== "meta") {
          const defs = document.createElementNS(SVG_NS, "defs");
          const clipPath = document.createElementNS(SVG_NS, "clipPath");
          clipPath.setAttribute("id", clipId);
          const clipCircle = document.createElementNS(SVG_NS, "circle");
          clipCircle.setAttribute("cx", cx);
          clipCircle.setAttribute("cy", cy);
          clipCircle.setAttribute("r", s.nodeRadius - 1.5);
          clipPath.appendChild(clipCircle);
          defs.appendChild(clipPath);
          svg.appendChild(defs);

          fillRect = document.createElementNS(SVG_NS, "rect");
          fillRect.setAttribute("x", cx - s.nodeRadius);
          fillRect.setAttribute("width", s.nodeRadius * 2);
          fillRect.setAttribute("clip-path", `url(#${clipId})`);
          fillRect.classList.add("partial-fill");
          fillRect.style.display = "none";
          svg.appendChild(fillRect);
        }

        // Checkmark icon (shown when achieved)
        const sc = s.checkScale;
        const icon = document.createElementNS(SVG_NS, "path");
        icon.setAttribute("d",
          `M${cx - 5 * sc} ${cy + 1 * sc} L${cx - 1 * sc} ${cy + 5 * sc} L${cx + 6 * sc} ${cy - 4 * sc}`
        );
        icon.setAttribute("fill", "none");
        icon.setAttribute("stroke", "#fff");
        icon.setAttribute("stroke-width", 2.5 * sc);
        icon.setAttribute("stroke-linecap", "round");
        icon.setAttribute("stroke-linejoin", "round");
        icon.style.display = "none";
        if (node.type === "meta") icon.classList.add("meta-badge-icon");
        svg.appendChild(icon);

        // Label text
        const text = document.createElementNS(SVG_NS, "text");
        const labelY = node.type === "meta"
          ? cy + s.nodeRadius + s.labelOffsetY + 10
          : cy + s.nodeRadius + s.labelOffsetY;
        text.setAttribute("x", cx);
        text.setAttribute("y", labelY);
        text.classList.add("level-label");
        if (node.id === "architect") text.classList.add("architect");

        const words = node.name.split(" ");
        if (words.length > 1) {
          const mid = Math.ceil(words.length / 2);
          const tspan1 = document.createElementNS(SVG_NS, "tspan");
          tspan1.setAttribute("x", cx);
          tspan1.setAttribute("dy", "0");
          tspan1.textContent = words.slice(0, mid).join(" ");
          const tspan2 = document.createElementNS(SVG_NS, "tspan");
          tspan2.setAttribute("x", cx);
          tspan2.setAttribute("dy", "1.15em");
          tspan2.textContent = words.slice(mid).join(" ");
          text.appendChild(tspan1);
          text.appendChild(tspan2);
        } else {
          text.textContent = node.name;
        }

        const tspanPartial = document.createElementNS(SVG_NS, "tspan");
        tspanPartial.setAttribute("x", cx);
        tspanPartial.setAttribute("dy", "1.15em");
        tspanPartial.textContent = "(in progress)";
        tspanPartial.style.display = "none";
        text.appendChild(tspanPartial);
        svg.appendChild(text);

        // Hover target
        const hoverCircle = document.createElementNS(SVG_NS, "circle");
        hoverCircle.setAttribute("cx", cx);
        hoverCircle.setAttribute("cy", cy);
        hoverCircle.setAttribute("r", s.nodeRadius + s.hoverExtra);
        hoverCircle.setAttribute("fill", "transparent");
        hoverCircle.setAttribute("stroke", "none");
        hoverCircle.setAttribute("tabindex", "0");
        hoverCircle.setAttribute("role", "button");
        hoverCircle.setAttribute("focusable", "true");
        hoverCircle.setAttribute("aria-label", `${product.name} ${node.name}. ${node.hint}`);
        hoverCircle.setAttribute("aria-describedby", "tooltip");
        hoverCircle.classList.add("level-hit");
        hoverCircle.style.cursor = "pointer";
        const showNodeTooltip = (e, anchor) => showTooltip(e, buildCircleTooltip(node, product), anchor);
        hoverCircle.addEventListener("mouseenter", (e) => showNodeTooltip(e));
        hoverCircle.addEventListener("mousemove", (e) => moveTooltip(e));
        hoverCircle.addEventListener("mouseleave", hideTooltip);
        hoverCircle.addEventListener("focus", () => showNodeTooltip(null, hoverCircle));
        hoverCircle.addEventListener("blur", hideTooltip);
        hoverCircle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            showNodeTooltip(null, hoverCircle);
          } else if (e.key === "Escape") {
            hideTooltip();
          }
        });
        hoverCircle.addEventListener("touchstart", (e) => {
          if (!e.touches || !e.touches[0]) return;
          showNodeTooltip(e.touches[0]);
          setTimeout(hideTooltip, 3000);
        }, { passive: true });
        svg.appendChild(hoverCircle);

        productRef.nodes[node.id] = { circle, fillRect, icon, text, tspanPartial, cy, nodeRadius: s.nodeRadius, type: node.type };
      });

      row.appendChild(svg);
      mapEl.appendChild(row);
      mapRefs.push(productRef);
    });

    updateMap();
  }

  function updateMap() {
    if (!mapRefs) return;

    PRODUCTS.forEach((product, pIdx) => {
      const ref = mapRefs[pIdx];
      if (!ref) return;

      const results = evaluateProduct(product, passedExams);

      // Update edges
      ref.edges.forEach(({ line, arrow, fromId, toId }) => {
        const bothAchieved = results[fromId].achieved && results[toId].achieved;
        line.classList.toggle("achieved", bothAchieved);
        arrow.classList.toggle("achieved", bothAchieved);
      });

      // Update nodes
      product.nodes.forEach((node) => {
        const nRef = ref.nodes[node.id];
        if (!nRef) return;
        const ev = results[node.id];
        const isPartial = !ev.achieved && ev.progress > 0 && ev.progress < 1;

        nRef.circle.classList.toggle("achieved", ev.achieved);
        nRef.circle.classList.toggle("partial", isPartial);
        nRef.circle.classList.toggle("not-achieved", !ev.achieved && !isPartial);

        // Partial fill (credential nodes only)
        if (nRef.fillRect) {
          if (isPartial) {
            const fillHeight = (nRef.nodeRadius * 2) * ev.progress;
            const fillY = nRef.cy + nRef.nodeRadius - fillHeight;
            nRef.fillRect.setAttribute("y", fillY);
            nRef.fillRect.setAttribute("height", fillHeight);
            nRef.fillRect.style.display = "";
          } else {
            nRef.fillRect.style.display = "none";
          }
        }

        // Icon display (checkmark shown when achieved)
        nRef.icon.style.display = ev.achieved ? "" : "none";

        // Label classes
        nRef.text.classList.toggle("achieved", ev.achieved);
        nRef.text.classList.toggle("partial", isPartial);

        nRef.tspanPartial.style.display = isPartial ? "" : "none";
      });
    });
  }


  // ── Tooltip ───────────────────────────────────────────────────────────────

  function showTooltip(e, content, anchor) {
    if (typeof content === "string") {
      tooltipEl.textContent = content;
    } else {
      tooltipEl.innerHTML = "";
      tooltipEl.appendChild(content);
    }
    tooltipEl.classList.add("visible");
    tooltipEl.setAttribute("aria-hidden", "false");
    moveTooltip(e, anchor);
  }

  function expiryDatesForCodes(codes) {
    const dates = [];
    codes.forEach((code) => {
      if (passedExams.has(code) && examExpiry.has(code)) dates.push(examExpiry.get(code));
    });
    return dates;
  }

  function expiryDatesForNode(node, product) {
    const rule = node.rule;
    if (rule.codes) return expiryDatesForCodes(rule.codes);
    if (!rule.requires) return [];
    const dates = [];
    rule.requires.forEach((reqId) => {
      const reqNode = product.nodes.find((n) => n.id === reqId);
      if (reqNode) dates.push(...expiryDatesForNode(reqNode, product));
    });
    return dates;
  }

  function appendExpiryBadges(row, dates) {
    if (!dates.length) return;
    const group = document.createElement("span");
    group.className = "tooltip-expiry";
    dates.forEach((expiry) => {
      const badge = document.createElement("span");
      const { status } = computeExpiresIn(expiry);
      badge.className = "expires-badge expires-" + status;
      badge.textContent = expiry;
      group.appendChild(badge);
    });
    row.appendChild(group);
  }

  function appendCertRow(list, label, active, dates, nested) {
    const row = document.createElement("div");
    row.className = "tooltip-cert" + (nested ? " tooltip-cert-nested" : "") + (active ? "" : " tooltip-cert-pending");
    const name = document.createElement("span");
    name.textContent = label;
    row.appendChild(name);
    if (active) appendExpiryBadges(row, dates);
    list.appendChild(row);
  }

  function buildCircleTooltip(node, product) {
    const frag = document.createDocumentFragment();

    const title = document.createElement("div");
    title.style.fontWeight = "600";
    title.style.marginBottom = "0.4em";
    title.textContent = node.hint;
    frag.appendChild(title);

    const ruleType = node.rule.type;
    const examMap = {};
    product.exams.forEach((ex) => { examMap[ex.code] = ex.name; });

    if (ruleType === "meta" || ruleType === "metaPlus") {
      const list = document.createElement("div");
      list.className = "tooltip-certs";
      const results = evaluateProduct(product, passedExams);
      node.rule.requires.forEach((reqId) => {
        const reqNode = product.nodes.find((n) => n.id === reqId);
        if (!reqNode) return;
        const done = results[reqId].achieved;
        const icon = done ? "\u2705" : "\u274c";
        appendCertRow(list, `${icon} ${reqNode.name}`, done, expiryDatesForNode(reqNode, product));
      });
      if (ruleType === "metaPlus") {
        const specPassed = node.rule.specialist.filter((c) => passedExams.has(c)).length;
        const specDone = specPassed >= node.rule.minSpecialist;
        const specIcon = specDone ? "\u2705" : "\u274c";
        appendCertRow(
          list,
          `${specIcon} Specialist exams (${specPassed}/${node.rule.minSpecialist})`,
          specDone,
          []
        );
        node.rule.specialist.forEach((code) => {
          const passed = passedExams.has(code);
          const icon = passed ? "\u2705" : "\u2B1C";
          const name = examMap[code] || code;
          appendCertRow(list, `${icon} ${code} — ${name}`, passed, expiryDatesForCodes([code]), true);
        });
      }
      frag.appendChild(list);
    } else {
      const codes = getNodeCodes(node, product);
      if (codes.length > 0) {
        const list = document.createElement("div");
        list.className = "tooltip-certs";
        codes.forEach((code) => {
          const passed = passedExams.has(code);
          const icon = passed ? "\u2705" : "\u274c";
          const name = examMap[code] || code;
          appendCertRow(list, `${icon} ${code} — ${name}`, passed, expiryDatesForCodes([code]));
        });
        frag.appendChild(list);
      }
    }

    return frag;
  }

  function moveTooltip(e, anchor) {
    const pad = 12;
    let originX = 0;
    let originY = 0;
    const fromPointer = e && typeof e.clientX === "number" && (e.clientX !== 0 || e.clientY !== 0);
    if (anchor) {
      const box = anchor.getBoundingClientRect();
      originX = box.left + box.width / 2;
      originY = box.bottom;
    } else if (fromPointer) {
      originX = e.clientX;
      originY = e.clientY;
    }
    let x = originX + pad;
    let y = originY + pad;
    const rect = tooltipEl.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - pad) {
      x = originX - rect.width - pad;
    }
    if (y + rect.height > window.innerHeight - pad) {
      y = originY - rect.height - pad;
    }
    tooltipEl.style.left = x + "px";
    tooltipEl.style.top = y + "px";
  }

  function hideTooltip() {
    tooltipEl.classList.remove("visible");
    tooltipEl.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("touchstart", (e) => {
    if (!e.target.closest("[style*='cursor']")) {
      hideTooltip();
    }
  });

  // ── Resize handling ───────────────────────────────────────────────────────

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildMap, 150);
  });

  // ── Links menu ──────────────────────────────────────────────────────────

  const linksWrap = document.getElementById("links-menu-wrap");
  const linksToggle = document.getElementById("links-toggle");
  const linksMenu = document.getElementById("links-menu");

  function setLinksMenuOpen(open) {
    if (!linksToggle || !linksMenu) return;
    linksToggle.setAttribute("aria-expanded", open ? "true" : "false");
    linksMenu.classList.toggle("hidden", !open);
    linksMenu.hidden = !open;
  }

  if (linksToggle && linksMenu && linksWrap) {
    linksToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = linksToggle.getAttribute("aria-expanded") !== "true";
      setLinksMenuOpen(open);
    });

    document.addEventListener("click", (e) => {
      if (!linksWrap.contains(e.target)) setLinksMenuOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setLinksMenuOpen(false);
    });
  }

  // ── Certification Verification ──────────────────────────────────────────

  const CORS_PROXIES = [
    { url: (u) => "https://proxy.corsfix.com/?url=" + u },
    { url: (u) => "https://corsproxy.io/?key=8a7b7619&url=" + encodeURIComponent(u) },
    { url: (u) => "https://api.allorigins.win/raw?url=" + u },
  ];
  const VERIFY_URL = "https://rhtapps.redhat.com/verify/?certId=";

  const certIdInput = document.getElementById("cert-id-input");
  const verifyBtn = document.getElementById("verify-btn");
  const verifyStatus = document.getElementById("verify-status");
  const verifyOwner = document.getElementById("verify-owner");
  const verifySource = document.getElementById("verify-source");

  async function fetchPage(certId) {
    const id = certId.trim();
    if (!/^\d{3}-\d{3}-\d{3}$/.test(id)) {
      throw new Error("Invalid format. Use ###-###-###");
    }

    const target = VERIFY_URL + id;
    const TIMEOUT_MS = 15000;
    const controllers = [];

    const attempts = CORS_PROXIES.map((proxy) => {
      const ctrl = new AbortController();
      controllers.push(ctrl);
      const timeoutId = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const opts = { signal: ctrl.signal };
      if (proxy.headers) opts.headers = proxy.headers;
      return fetch(proxy.url(target), opts)
        .then((resp) => {
          clearTimeout(timeoutId);
          if (!resp.ok) return Promise.reject(new Error("not ok"));
          return resp.text();
        })
        .then((text) => {
          const doc = new DOMParser().parseFromString(text || "", "text/html");
          if (!isRedHatVerifyDocument(doc)) return Promise.reject(new Error("not a verify page"));
          return doc;
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          return Promise.reject(err);
        });
    });

    let doc;
    try {
      doc = await Promise.any(attempts);
      controllers.forEach((c) => c.abort());
    } catch {
      throw new Error("Failed to reach verification service (all proxies failed)");
    }

    const bodyText = doc.body.textContent || "";
    if (bodyText.includes("is not a valid Certification ID")) {
      throw new Error("Not a valid Certification ID");
    }
    if (bodyText.includes("No certifications found")) {
      throw new Error("No certifications found for this ID");
    }

    // Extract owner name from the "Owner:" table cell pattern
    let ownerName = "";
    const tds = doc.querySelectorAll("td");
    for (let i = 0; i < tds.length; i++) {
      if (tds[i].textContent.trim() === "Owner:" && tds[i + 1]) {
        ownerName = tds[i + 1].textContent.trim();
        break;
      }
    }

    return { doc, ownerName };
  }

  function extractExamTranscript(doc) {
    const exams = [];
    const h3s = doc.querySelectorAll("h3");
    for (const h3 of h3s) {
      if (h3.textContent.trim() === "Exam Transcript") {
        const table = h3.nextElementSibling;
        if (!table) break;
        const rows = table.querySelectorAll("tr");
        for (const row of rows) {
          const strong = row.querySelector("strong");
          if (!strong) continue;
          const text = strong.textContent.trim();
          const match = text.match(/^(EX\d{3})\s+(.*)/);
          if (!match) continue;

          const code = match[1];
          const name = match[2];

          let date = "";
          const innerTds = row.querySelectorAll("td");
          for (let j = 0; j < innerTds.length; j++) {
            if (innerTds[j].textContent.trim().startsWith("Date") && innerTds[j + 1]) {
              date = innerTds[j + 1].textContent.trim();
              break;
            }
          }

          exams.push({ code, name, date });
        }
        break;
      }
    }
    return exams;
  }

  function extractCurrentCredentials(doc) {
    const credentials = [];
    const h3s = doc.querySelectorAll("h3");
    for (const h3 of h3s) {
      if (h3.textContent.trim() === "Current Credentials") {
        const table = h3.nextElementSibling;
        if (!table) break;
        const rows = table.querySelectorAll("tr");
        for (const row of rows) {
          const strong = row.querySelector("strong");
          if (!strong) continue;
          const name = strong.textContent.trim();
          if (!name.startsWith("Red Hat")) continue;

          let date = "";
          let expiry = "";
          const innerTds = row.querySelectorAll("td");
          for (let j = 0; j < innerTds.length; j++) {
            const cellText = innerTds[j].textContent.trim();
            if (cellText === "Date:" && innerTds[j + 1]) {
              date = innerTds[j + 1].textContent.trim();
            }
            if (cellText.includes("Current Until:") && innerTds[j + 1]) {
              expiry = innerTds[j + 1].textContent.trim();
            }
          }

          credentials.push({ name, date, expiry });
        }
        break;
      }
    }
    return credentials;
  }

  function matchExamCodes(transcriptExams) {
    const matched = new Set();
    const unmatched = [];
    const knownCodes = new Set();
    PRODUCTS.forEach((p) => p.exams.forEach((e) => knownCodes.add(e.code)));

    for (const exam of transcriptExams) {
      if (knownCodes.has(exam.code)) {
        matched.add(exam.code);
      } else {
        unmatched.push(exam);
      }
    }
    return { matched, unmatched };
  }

  const CREDENTIAL_ALIASES = {
    "red hat certified specialist in linux performance tuning": "EX442",
    "red hat certified specialist in linux diagnostics and troubleshooting": "EX342",
    "red hat certified specialist in ansible automation": "EX294",
    "red hat certified specialist in openshift administration": "EX280",
    "red hat certified specialist in containers and kubernetes": "EX180",
    "red hat certified specialist in containers": "EX188",
  };

  function matchCredentialsToExams(credentials) {
    return matchCredentialsAgainst(credentials, ALL_EXAMS, CREDENTIAL_ALIASES);
  }

  function applyMatchedExams(matchedCodes, expiryByCode) {
    passedExams.clear();
    examExpiry.clear();
    matchedCodes.forEach((code) => passedExams.add(code));
    if (expiryByCode) {
      Object.entries(expiryByCode).forEach(([code, expiry]) => {
        if (expiry && passedExams.has(code)) examExpiry.set(code, expiry);
      });
    }
    saveState();

    document.querySelectorAll('#exam-list input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
    matchedCodes.forEach((code) => syncSharedCheckboxes(code, true));
    updateMap();
  }

  // ── Other Exams Table ───────────────────────────────────────────────────

  const otherExamsSection = document.getElementById("other-exams");
  const otherExamsTable = document.getElementById("other-exams-table");

  function isOlderThan3Years(dateStr) {
    const parsed = new Date(dateStr);
    if (isNaN(parsed)) return false;
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    return parsed < threeYearsAgo;
  }

  function renderOtherExams(unmatchedExams) {
    const tbody = otherExamsTable.querySelector("tbody");
    tbody.innerHTML = "";

    if (!unmatchedExams || unmatchedExams.length === 0) {
      otherExamsSection.hidden = true;
      return;
    }

    for (const exam of unmatchedExams) {
      const row = document.createElement("tr");

      const tdCode = document.createElement("td");
      tdCode.textContent = exam.code;

      const tdName = document.createElement("td");
      tdName.textContent = exam.name;

      const tdDate = document.createElement("td");
      if (exam.date) {
        const badge = document.createElement("span");
        badge.textContent = exam.date;
        badge.className = "date-badge " + (isOlderThan3Years(exam.date) ? "date-expired" : "date-fresh");
        tdDate.appendChild(badge);
      } else {
        tdDate.textContent = "—";
      }

      row.appendChild(tdCode);
      row.appendChild(tdName);
      row.appendChild(tdDate);
      tbody.appendChild(row);
    }

    otherExamsSection.hidden = false;
  }

  // ── Old Credentials Table ───────────────────────────────────────────────

  const oldCredsSection = document.getElementById("old-credentials");
  const oldCredsTable = document.getElementById("old-credentials-table");

  function computeExpiresIn(expiryStr) {
    const expiry = new Date(expiryStr);
    if (isNaN(expiry)) return { text: "—", status: "unknown" };

    const now = new Date();
    if (expiry <= now) return { text: "Expired", status: "expired" };

    let years = expiry.getFullYear() - now.getFullYear();
    let months = expiry.getMonth() - now.getMonth();
    let days = expiry.getDate() - now.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(expiry.getFullYear(), expiry.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0) parts.push(`${days}d`);
    const text = parts.join(" ") || "< 1 day";

    const totalMonths = years * 12 + months;
    let status;
    if (totalMonths < 3) status = "critical";
    else if (totalMonths < 12) status = "warning";
    else status = "healthy";

    return { text, status };
  }

  function renderOldCredentials(unmatchedCreds) {
    const tbody = oldCredsTable.querySelector("tbody");
    tbody.innerHTML = "";

    if (!unmatchedCreds || unmatchedCreds.length === 0) {
      oldCredsSection.hidden = true;
      return;
    }

    for (const cred of unmatchedCreds) {
      const row = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.textContent = cred.name || "—";

      const tdDate = document.createElement("td");
      tdDate.textContent = cred.date || "—";

      const tdUntil = document.createElement("td");
      tdUntil.textContent = cred.expiry || "—";

      const tdExpires = document.createElement("td");
      if (cred.expiry) {
        const { text, status } = computeExpiresIn(cred.expiry);
        const badge = document.createElement("span");
        badge.textContent = text;
        badge.className = "expires-badge expires-" + status;
        tdExpires.appendChild(badge);
      } else {
        tdExpires.textContent = "—";
      }

      row.appendChild(tdName);
      row.appendChild(tdDate);
      row.appendChild(tdUntil);
      row.appendChild(tdExpires);
      tbody.appendChild(row);
    }

    oldCredsSection.hidden = false;
  }

  // "Verify" button: populates Certification Map from Current Credentials,
  // and Other Exams from Exam Transcript

  function clearLookupResults() {
    verifyOwner.textContent = "";
    verifySource.textContent = "";
    renderOldCredentials([]);
    renderOtherExams([]);
  }

  function clearCertIdParam() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("certId") && !url.searchParams.has("certid")) return;
    url.searchParams.delete("certId");
    url.searchParams.delete("certid");
    window.history.replaceState(null, "", url);
  }

  function showVerifySource(certId) {
    const sourceUrl = "https://rhtapps.redhat.com/verify/?certId=" + certId.trim();
    verifySource.textContent = "";
    const sourceText = document.createTextNode("Data is obtained from ");
    const sourceLink = document.createElement("a");
    sourceLink.href = sourceUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = "this link";
    verifySource.appendChild(sourceText);
    verifySource.appendChild(sourceLink);
  }

  function filterAchievedCredentials(unmatchedCreds) {
    return filterAchievedAgainst(unmatchedCreds, PRODUCTS, passedExams);
  }

  function handleVerifySuccess(doc, certId) {
    const credentials = extractCurrentCredentials(doc);
    if (credentials.length === 0) {
      throw new Error("No current credentials found on the page");
    }

    const { matched: matchedCodes, unmatched: unmatchedCreds, expiryByCode } = matchCredentialsToExams(credentials);
    applyMatchedExams(matchedCodes, expiryByCode);

    renderOldCredentials(filterAchievedCredentials(unmatchedCreds));

    const transcriptExams = extractExamTranscript(doc);
    const { unmatched } = matchExamCodes(transcriptExams);
    renderOtherExams(unmatched);

    const matchedCount = matchedCodes.size;
    const total = credentials.length;
    if (matchedCount === 0) {
      verifyStatus.textContent = `Found ${total} credential(s) but none matched known exams`;
      verifyStatus.className = "cert-verify-status error";
    } else {
      verifyStatus.textContent = `Matched ${matchedCount} of ${total} current credential(s)`;
      verifyStatus.className = "cert-verify-status success";
    }
  }

  verifyBtn.addEventListener("click", async () => {
    const certId = certIdInput.value;
    if (certId) {
      const url = new URL(window.location.href);
      url.searchParams.set("certId", certId);
      url.searchParams.delete("certid");
      window.history.replaceState(null, "", url);
    }
    verifyStatus.textContent = "Fetching certifications...";
    verifyStatus.className = "cert-verify-status loading";
    clearLookupResults();
    verifyBtn.disabled = true;

    try {
      const { doc, ownerName } = await fetchPage(certId);
      if (ownerName) verifyOwner.textContent = "Owner: " + ownerName;
      showVerifySource(certId);
      handleVerifySuccess(doc, certId);
    } catch (err) {
      clearLookupResults();
      verifyStatus.textContent = err.message;
      verifyStatus.className = "cert-verify-status error";
    } finally {
      verifyBtn.disabled = false;
    }
  });

  // Auto-format cert ID: insert dashes after every 3 digits
  certIdInput.addEventListener("input", () => {
    const raw = certIdInput.value.replace(/[^0-9]/g, "").slice(0, 9);
    let formatted = "";
    for (let i = 0; i < raw.length; i++) {
      if (i > 0 && i % 3 === 0) formatted += "-";
      formatted += raw[i];
    }
    if (certIdInput.value !== formatted) {
      certIdInput.value = formatted;
    }
  });

  // Allow Enter key to trigger verify
  certIdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") verifyBtn.click();
  });

  // ── Sidebar Toggle ──────────────────────────────────────────────────────

  const navToggleBtn = document.getElementById("nav-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");
  const sidebarEl = document.getElementById("page-sidebar");
  const pageEl = document.querySelector(".pf-v6-c-page");

  function isMobile() {
    return window.innerWidth <= 992;
  }

  // ── Sidebar resizing ────────────────────────────────────────────────────

  const sidebarResizer = document.getElementById("sidebar-resizer");
  const SIDEBAR_WIDTH_KEY = "redhat-cert-map-sidebar-width";
  const MIN_SIDEBAR_WIDTH = 280;
  const DEFAULT_SIDEBAR_WIDTH = 320;
  let preferredSidebarWidth = DEFAULT_SIDEBAR_WIDTH;
  let sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
  let sidebarDrag = null;
  let sidebarMapFrame = null;

  try {
    const savedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
    if (Number.isFinite(savedWidth) && savedWidth >= MIN_SIDEBAR_WIDTH) {
      preferredSidebarWidth = Math.min(savedWidth, 640);
    }
  } catch {
    // The divider also works when storage is unavailable.
  }

  function maxSidebarWidth() {
    // Leave space for the map, including its outer margin.
    return Math.max(MIN_SIDEBAR_WIDTH, Math.min(640, window.innerWidth - 504));
  }

  function setSidebarWidth(width) {
    const maximum = maxSidebarWidth();
    const nextWidth = Math.round(Math.max(MIN_SIDEBAR_WIDTH, Math.min(width, maximum)));
    const changed = nextWidth !== sidebarWidth;
    sidebarWidth = nextWidth;
    document.documentElement.style.setProperty("--desktop-sidebar-width", `${sidebarWidth}px`);
    sidebarResizer.setAttribute("aria-valuemax", String(maximum));
    sidebarResizer.setAttribute("aria-valuenow", String(sidebarWidth));
    sidebarResizer.setAttribute("aria-valuetext", `${sidebarWidth} pixels`);
    if (changed && !isMobile() && sidebarMapFrame === null) {
      sidebarMapFrame = requestAnimationFrame(() => {
        sidebarMapFrame = null;
        buildMap();
      });
    }
  }

  function saveSidebarWidth() {
    preferredSidebarWidth = sidebarWidth;
    writeStorage(SIDEBAR_WIDTH_KEY, String(preferredSidebarWidth));
  }

  function finishSidebarResize(commit = true) {
    if (!sidebarDrag) return;
    const pointerId = sidebarDrag.pointerId;
    sidebarDrag = null;
    document.body.classList.remove("is-resizing-sidebar");
    if (sidebarResizer.hasPointerCapture(pointerId)) sidebarResizer.releasePointerCapture(pointerId);
    if (commit) saveSidebarWidth();
    else setSidebarWidth(preferredSidebarWidth);
  }

  sidebarResizer.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !event.isPrimary || isMobile() || sidebarDrag) return;
    event.preventDefault();
    sidebarResizer.focus();
    sidebarDrag = { pointerId: event.pointerId, startX: event.clientX, startWidth: sidebarWidth };
    sidebarResizer.setPointerCapture(event.pointerId);
    document.body.classList.add("is-resizing-sidebar");
    hideTooltip();
  });

  sidebarResizer.addEventListener("pointermove", (event) => {
    if (!sidebarDrag || event.pointerId !== sidebarDrag.pointerId) return;
    setSidebarWidth(sidebarDrag.startWidth + event.clientX - sidebarDrag.startX);
  });

  sidebarResizer.addEventListener("pointerup", (event) => {
    if (sidebarDrag?.pointerId === event.pointerId) finishSidebarResize();
  });
  sidebarResizer.addEventListener("pointercancel", () => finishSidebarResize(false));
  sidebarResizer.addEventListener("lostpointercapture", () => finishSidebarResize());
  window.addEventListener("blur", () => finishSidebarResize(false));

  sidebarResizer.addEventListener("keydown", (event) => {
    if (isMobile()) return;
    if (event.key === "Escape" && sidebarDrag) {
      event.preventDefault();
      finishSidebarResize(false);
      return;
    }
    if (sidebarDrag) return;
    const step = event.shiftKey ? 48 : 16;
    const widths = {
      ArrowLeft: sidebarWidth - step,
      ArrowRight: sidebarWidth + step,
      Home: MIN_SIDEBAR_WIDTH,
      End: maxSidebarWidth(),
    };
    if (!Object.hasOwn(widths, event.key)) return;
    event.preventDefault();
    setSidebarWidth(widths[event.key]);
    saveSidebarWidth();
  });

  sidebarResizer.addEventListener("dblclick", () => {
    if (isMobile()) return;
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    saveSidebarWidth();
  });

  window.addEventListener("resize", () => {
    finishSidebarResize(false);
    if (!isMobile()) setSidebarWidth(preferredSidebarWidth);
    syncNavToggle();
    backdrop.classList.toggle("visible", isMobile() && sidebarEl.classList.contains("pf-m-expanded"));
  });

  setSidebarWidth(preferredSidebarWidth);

  function syncNavToggle() {
    if (!navToggleBtn || !sidebarEl) return;
    const expanded = sidebarEl.classList.contains("pf-m-expanded");
    navToggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    sidebarResizer.tabIndex = expanded && !isMobile() ? 0 : -1;
  }

  function openSidebar() {
    if (sidebarEl) sidebarEl.classList.add("pf-m-expanded");
    if (pageEl) pageEl.classList.add("pf-m-sidebar-expanded");
    if (isMobile() && backdrop) backdrop.classList.add("visible");
    writeStorage("sidebar_expanded", "true");
    syncNavToggle();
    setTimeout(buildMap, 50);
  }

  function closeSidebar() {
    finishSidebarResize(false);
    if (sidebarEl) sidebarEl.classList.remove("pf-m-expanded");
    if (pageEl) pageEl.classList.remove("pf-m-sidebar-expanded");
    if (backdrop) backdrop.classList.remove("visible");
    writeStorage("sidebar_expanded", "false");
    syncNavToggle();
    setTimeout(buildMap, 50);
  }

  if (navToggleBtn) {
    navToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (sidebarEl && sidebarEl.classList.contains("pf-m-expanded")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeSidebar);
  }

  (function () {
    let savedState = null;
    try {
      savedState = localStorage.getItem("sidebar_expanded");
    } catch {
      savedState = null;
    }
    if (savedState === "false") {
      if (sidebarEl) sidebarEl.classList.remove("pf-m-expanded");
      if (pageEl) pageEl.classList.remove("pf-m-sidebar-expanded");
    } else if (isMobile() && savedState === null) {
      if (sidebarEl) sidebarEl.classList.remove("pf-m-expanded");
      if (pageEl) pageEl.classList.remove("pf-m-sidebar-expanded");
    }
    syncNavToggle();
  })();

  // ── Init ──────────────────────────────────────────────────────────────────

  renderExamList();
  buildMap();

  // Auto-verify if cert ID is provided in URL (e.g. ?certId=140-255-795)
  const urlParams = new URLSearchParams(window.location.search);
  const urlCertId = urlParams.get("certId") || urlParams.get("certid");
  if (urlCertId) {
    certIdInput.value = urlCertId.trim();
    certIdInput.dispatchEvent(new Event("input"));
    verifyBtn.click();
  }
})();
