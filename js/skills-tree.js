/**
 * Dynamic Skills Tree with Physics
 * Creates a top-down interactive tree that sways and reacts to mouse movement.
 */

const skillsData = {
    name: "Software Architecture",
    children: [
        {
            name: "DEVOPS",
            color: "#00f2fe",
            children: [
                { name: "CI/CD Pipelines" },
                { name: "Kubernetes" },
                { name: "Terraform" },
                { name: "Cloud Native" }
            ]
        },
        {
            name: "Back-end",
            color: "#4facfe",
            children: [
                { name: "Distributed Systems" },
                { name: "Microservices" },
                { name: "Python / Django" },
                { name: "Event Driven Architectures" }
            ]
        },
        {
            name: "AI",
            color: "#00ff88",
            children: [
                { name: "Spec-Driven Development" },
                { name: "Agentic Coding" },
                { name: "LLM Orchestration" },
                { name: "AI Safety & Verification" }
            ]
        }
    ]
};

class SkillNode {
    constructor(data, parent = null, depth = 0, angle = 0, length = 100) {
        this.data = data;
        this.parent = parent;
        this.depth = depth;
        this.children = [];

        // Physics properties
        this.baseAngle = angle;
        this.angle = angle;
        this.targetAngle = angle;
        this.length = length;
        this.vel = 0;
        this.acc = 0;
        this.stiffness = 0.05;
        this.damping = 0.92;

        // Screen position
        this.x = 0;
        this.y = 0;

        // DOM Elements
        this.line = null;
        this.circle = null;
        this.text = null;

        if (data.children) {
            // Balanced spread for fitting
            const spread = Math.PI * 0.75;
            data.children.forEach((child, i) => {
                const childAngle = angle + (spread * (i / (data.children.length - 1 || 1)) - spread / 2);
                // Balanced lengths for the 800px height
                const childLength = depth === 0 ? 180 : 130;
                this.children.push(new SkillNode(child, this, depth + 1, childAngle, childLength));
            });
        }
    }

    initDOM(container, svg) {
        if (this.parent) {
            this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.line.setAttribute("stroke", this.data.color || this.parent.data.color || "#ffffff");
            this.line.setAttribute("stroke-width", Math.max(1, 4 - this.depth));
            this.line.setAttribute("stroke-linecap", "round");
            this.line.style.opacity = "0.25";
            svg.appendChild(this.line);
        }

        this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.circle.setAttribute("r", this.depth === 0 ? 10 : 5);
        this.circle.setAttribute("fill", this.data.color || (this.parent ? this.parent.data.color : "#ffffff"));
        this.circle.style.cursor = "pointer";
        this.circle.style.filter = `drop-shadow(0 0 10px ${this.data.color || "#ffffff"}aa)`;
        svg.appendChild(this.circle);

        this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.text.setAttribute("fill", "#ffffff");
        this.text.style.fontSize = this.depth === 0 ? "18px" : "13px";
        this.text.style.fontWeight = this.depth === 0 ? "700" : "500";
        this.text.style.fontFamily = "'Space Grotesk', sans-serif";
        this.text.style.pointerEvents = "none";
        this.text.style.opacity = "1";
        this.text.textContent = this.data.name;
        svg.appendChild(this.text);

        this.circle.addEventListener('mouseenter', () => {
            this.circle.setAttribute("r", this.depth === 0 ? 15 : 8);
            this.text.style.fontSize = this.depth === 0 ? "20px" : "15px";
            this.text.style.fill = "var(--accent)";
            this.vel += 0.15;
        });

        this.circle.addEventListener('mouseleave', () => {
            this.circle.setAttribute("r", this.depth === 0 ? 10 : 5);
            this.text.style.fontSize = this.depth === 0 ? "18px" : "13px";
            this.text.style.fill = "#ffffff";
        });

        this.children.forEach(child => child.initDOM(container, svg));
    }

    update(mouseX, mouseY, time) {
        const swayScale = this.depth === 0 ? 0.01 : 0.03;
        const sway = Math.sin(time * 0.0007 + this.depth) * swayScale;
        this.targetAngle = this.baseAngle + sway;

        // Mouse interaction (repulsion/attraction)
        if (mouseX !== undefined && mouseY !== undefined) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
                const force = (250 - dist) / 2500;
                this.targetAngle += force * (dx > 0 ? -1 : 1);
            }
        }

        // Spring physics for angle
        this.acc = (this.targetAngle - this.angle) * this.stiffness;
        this.vel += this.acc;
        this.vel *= this.damping;
        this.angle += this.vel;

        // Position calculation
        if (!this.parent) {
            const container = document.getElementById('skills-tree-container');
            this.x = container ? container.clientWidth / 2 : 400;
            this.y = 120;
        } else {
            this.x = this.parent.x + Math.cos(this.angle) * this.length;
            this.y = this.parent.y + Math.sin(this.angle) * this.length;
        }

        if (this.line) {
            this.line.setAttribute("x1", this.parent.x);
            this.line.setAttribute("y1", this.parent.y);
            this.line.setAttribute("x2", this.x);
            this.line.setAttribute("y2", this.y);
        }

        this.circle.setAttribute("cx", this.x);
        this.circle.setAttribute("cy", this.y);

        this.text.setAttribute("x", this.x + 15);
        this.text.setAttribute("y", this.y + 5);

        this.children.forEach(child => child.update(mouseX, mouseY, time));
    }
}

let rootNode;
let svg;
let mouseX, mouseY;

function initSkillsTree() {
    const container = document.getElementById('skills-tree-container');
    if (!container) return;

    container.innerHTML = '';
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.overflow = "visible";
    container.appendChild(svg);

    // Initial root length 
    rootNode = new SkillNode(skillsData, null, 0, Math.PI / 2, 110);
    rootNode.initDOM(container, svg);

    window.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    requestAnimationFrame(animate);
}

function animate(time) {
    if (rootNode) {
        rootNode.update(mouseX, mouseY, time);
    }
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', initSkillsTree);

// Re-init on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initSkillsTree, 250);
});
