/**
 * Automeri Website Core Script
 * Logic: Data Loading, Three.js Hero, Animations, interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    loadAllData();
    setupInteractions();
});

// --- 1. Dynamic Data Loading ---
async function fetchData(file) {
    try {
        const response = await fetch(`data/${file}.json`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${file}:`, error);
        return [];
    }
}

async function loadAllData() {
    // Parallel fetching
    const [services, projects, stats, testimonials, faq, caseStudies, technologies] = await Promise.all([
        fetchData('services'),
        fetchData('projects'),
        fetchData('stats'),
        fetchData('testimonials'),
        fetchData('faq'),
        fetchData('case_studies'),
        fetchData('technologies')
    ]);

    renderStats(stats);
    renderServices(services);
    renderProjects(projects);
    renderTestimonials(testimonials);
    renderFAQ(faq);
    renderCaseStudies(caseStudies);
    renderTechnologies(technologies);

    // Re-init icons and AOS after content is in DOM
    lucide.createIcons();
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Hide Loader
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
        }, 500);
    }, 800);
}

function renderStats(data) {
    const container = document.getElementById('stats-container');
    container.innerHTML = data.map(stat => `
        <div class="stat-card" data-aos="zoom-in">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

function renderServices(data) {
    const container = document.getElementById('services-container');
    container.innerHTML = data.map((service, index) => `
        <div class="service-card" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="service-icon">
                <i data-lucide="${service.icon}"></i>
            </div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        </div>
    `).join('');
}

function renderProjects(data) {
    const container = document.getElementById('projects-container');
    container.innerHTML = data.map((project, index) => `
        <article class="project-card" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="project-img">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-content">
                <span class="project-category">${project.category}</span>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        </article>
    `).join('');
}

function renderTestimonials(data) {
    const container = document.getElementById('testimonials-container');
    // Using simple grid for now, can be slider later
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${data.map(test => `
                <div class="stat-card" style="text-align: left; padding: 40px;" data-aos="fade-up">
                    <p style="font-style: italic; margin-bottom: 24px;">"${test.quote}"</p>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        ${test.avatar ? `<img src="${test.avatar}" style="width: 50px; height: 50px; border-radius: 50%;">` : ''}
                        <div>
                            <h4 style="margin: 0;">${test.name}</h4>
                            <small style="color: var(--text-muted)">${test.position}</small>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCaseStudies(data) {
    const container = document.getElementById('case-studies-container');
    container.innerHTML = data.map((item, index) => `
        <div class="case-study-card" data-aos="fade-up">
            <div class="case-img">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="case-content">
                <span class="case-client">${item.client}</span>
                <h3>${item.title}</h3>
                <div class="case-info">
                    <h4>The Challenge</h4>
                    <p>${item.challenge}</p>
                    <h4>The Solution</h4>
                    <p>${item.solution}</p>
                </div>
                <div class="case-results">
                    ${item.results.map(res => `
                        <div class="result-item">
                            <span class="result-val">${res.value}</span>
                            <span class="result-label">${res.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderTechnologies(data) {
    const container = document.getElementById('tech-container');
    container.innerHTML = data.map((tech, index) => `
        <div class="tech-badge" data-aos="fade-up" data-aos-delay="${index * 50}">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${tech.slug}.svg" alt="${tech.name}">
            ${tech.name}
        </div>
    `).join('');
}

function renderFAQ(data) {
    const container = document.getElementById('faq-container');
    container.innerHTML = data.map(item => `
        <div class="faq-item" onclick="this.classList.toggle('active')">
            <h3>${item.question} <i data-lucide="chevron-down"></i></h3>
            <div class="faq-answer">
                <p>${item.answer}</p>
            </div>
        </div>
    `).join('');
}

// --- 2. Three.js Hero Animation ---
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Particles
    const particlesCount = 1500;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const white = new THREE.Color(0xffffff);
    const grey = new THREE.Color(0x404040);

    for (let i = 0; i < particlesCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

        // Color
        const mixedColor = white.clone().lerp(grey, Math.random());
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.2;
    });

    function animate() {
        requestAnimationFrame(animate);
        
        points.rotation.y += 0.001;
        points.rotation.x += 0.0005;

        // Subtle mouse sway
        points.rotation.y += (mouseX - points.rotation.y) * 0.1;
        points.rotation.x += (mouseY - points.rotation.x) * 0.1;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 3. UI Interactions ---
function setupInteractions() {
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // GSAP Entrances
    gsap.from(".hero-title", { duration: 1.5, y: 100, opacity: 0, ease: "power4.out", delay: 1 });
    gsap.from(".badge", { duration: 1, scale: 0, opacity: 0, ease: "back.out(1.7)", delay: 0.8 });
}
