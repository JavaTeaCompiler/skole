document.addEventListener('DOMContentLoaded', () => {
    const dotsContainer = document.getElementById('dots-container');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (dotsContainer) {
        const createStaticDotField = () => {
            dotsContainer.innerHTML = '';
            const dotCount = window.innerWidth < 700 ? 75 : 130;

            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                const size = Math.random() * 4 + 3;
                dot.style.width = `${size}px`;
                dot.style.height = `${size}px`;
                dot.style.opacity = String(Math.random() * 0.32 + 0.46);
                dot.style.left = '0px';
                dot.style.top = '0px';
                dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                dotsContainer.appendChild(dot);
            }
        };

        if (reduceMotion) {
            createStaticDotField();
        } else {
        const dotItems = [];
        const shapeItems = [];
        const cursor = {
            x: window.innerWidth * 0.5,
            y: window.innerHeight * 0.5,
            active: false,
            idleTime: 0
        };
        const scrollState = {
            y: window.scrollY,
            velocity: 0,
            pulse: 0
        };
        const orientationState = {
            active: false,
            gamma: 0,
            beta: 0
        };

        const randomBetween = (min, max) => Math.random() * (max - min) + min;

        const createDotField = () => {
            dotItems.length = 0;
            dotsContainer.innerHTML = '';

            const dotCount = window.innerWidth < 700 ? 90 : 170;
            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');

                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                const size = randomBetween(2.6, 8.2);

                dot.style.width = `${size}px`;
                dot.style.height = `${size}px`;
                dot.style.opacity = String(randomBetween(0.48, 0.92));
                dot.style.left = '0px';
                dot.style.top = '0px';
                dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                dotsContainer.appendChild(dot);

                dotItems.push({
                    el: dot,
                    x,
                    y,
                    vx: 0,
                    vy: 0,
                    anchorX: x,
                    anchorY: y,
                    mass: randomBetween(0.7, 1.6),
                    spring: randomBetween(0.018, 0.032),
                    damping: randomBetween(0.82, 0.9),
                    gravityStrength: randomBetween(2800, 6200),
                    maxOffset: randomBetween(34, 68),
                    scrollDepth: randomBetween(0.05, 0.2),
                    scrollPush: randomBetween(0.006, 0.02),
                    scrollSway: randomBetween(2, 8),
                    driftPhase: Math.random() * Math.PI * 2,
                    driftSpeed: randomBetween(0.0012, 0.0024),
                    driftAmp: randomBetween(0.7, 2.2)
                });
            }
        };

        const initShapes = () => {
            shapeItems.length = 0;
            const shapes = document.querySelectorAll('.shape');

            shapes.forEach(shape => {
                const rect = shape.getBoundingClientRect();
                const anchorX = rect.left + rect.width / 2;
                const anchorY = rect.top + rect.height / 2;
                let baseRotation = randomBetween(-8, 8);
                const transformText = shape.style.transform || '';
                const rotateMatch = transformText.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
                if (rotateMatch) {
                    baseRotation = Number(rotateMatch[1]);
                }

                shape.style.left = `${anchorX - rect.width / 2}px`;
                shape.style.top = `${anchorY - rect.height / 2}px`;
                shape.style.willChange = 'transform';

                shapeItems.push({
                    el: shape,
                    x: anchorX,
                    y: anchorY,
                    vx: 0,
                    vy: 0,
                    anchorX,
                    anchorY,
                    width: rect.width,
                    height: rect.height,
                    mass: randomBetween(5.5, 9.5),
                    spring: randomBetween(0.012, 0.022),
                    damping: randomBetween(0.86, 0.92),
                    gravityStrength: randomBetween(6200, 12000),
                    maxOffset: randomBetween(48, 98),
                    scrollDepth: randomBetween(0.02, 0.08),
                    scrollPush: randomBetween(0.002, 0.006),
                    scrollSway: randomBetween(1.2, 3.8),
                    baseRotation,
                    rotVelocity: randomBetween(-0.2, 0.2),
                    driftPhase: Math.random() * Math.PI * 2,
                    driftSpeed: randomBetween(0.0008, 0.0017),
                    driftAmp: randomBetween(1.5, 4.2)
                });
            });
        };

        const applyPhysics = (item, time, dtFactor) => {
            const dx = cursor.x - item.x;
            const dy = cursor.y - item.y;
            const distSq = dx * dx + dy * dy + 320;
            const dist = Math.sqrt(distSq);

            let fx = 0;
            let fy = 0;

            if (cursor.active) {
                const pull = Math.min(item.gravityStrength / distSq, 0.9);
                fx += (dx / dist) * pull;
                fy += (dy / dist) * pull;
            }

            // Scroll-aware anchor offset creates subtle field drift while preserving spring bounds.
            const scrollAnchorY = item.anchorY + scrollState.y * item.scrollDepth;
            const scrollAnchorX = item.anchorX + Math.sin(time * 0.0012 + item.driftPhase) * item.scrollSway;
            fx += (scrollAnchorX - item.x) * item.spring;
            fy += (scrollAnchorY - item.y) * item.spring;
            fy += scrollState.velocity * item.scrollPush;
            fx += Math.sin(time * 0.002 + item.driftPhase) * scrollState.pulse * 0.002;

            const driftTime = time * item.driftSpeed + item.driftPhase;
            fx += Math.cos(driftTime) * item.driftAmp * 0.004;
            fy += Math.sin(driftTime) * item.driftAmp * 0.004;

            item.vx = (item.vx + fx / item.mass * dtFactor) * item.damping;
            item.vy = (item.vy + fy / item.mass * dtFactor) * item.damping;

            item.x += item.vx * dtFactor;
            item.y += item.vy * dtFactor;

            const offsetX = item.x - item.anchorX;
            const offsetY = item.y - item.anchorY;
            const offsetDist = Math.hypot(offsetX, offsetY);

            if (offsetDist > item.maxOffset) {
                const ratio = item.maxOffset / offsetDist;
                item.x = item.anchorX + offsetX * ratio;
                item.y = item.anchorY + offsetY * ratio;
                item.vx *= 0.72;
                item.vy *= 0.72;
            }
        };

        const renderDots = () => {
            dotItems.forEach(item => {
                item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
            });
        };

        const renderShapes = time => {
            shapeItems.forEach(item => {
                const rotate = item.baseRotation + Math.sin(time * 0.001 + item.driftPhase) * 5 + item.rotVelocity;
                const tx = item.x - item.anchorX;
                const ty = item.y - item.anchorY;
                item.el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rotate.toFixed(2)}deg)`;
            });
        };

        let lastTime = performance.now();
        const animate = time => {
            const dt = Math.min(32, time - lastTime);
            const dtFactor = dt / 16.67;
            lastTime = time;

            scrollState.velocity *= 0.9;
            scrollState.pulse *= 0.9;

            cursor.idleTime += dt;

            if (orientationState.active && window.innerWidth < 800) {
                const targetX = window.innerWidth * 0.5 + (orientationState.gamma / 30) * (window.innerWidth * 0.4);
                const targetY = window.innerHeight * 0.5 + (orientationState.beta / 30) * (window.innerHeight * 0.4);
                cursor.x += (targetX - cursor.x) * 0.08;
                cursor.y += (targetY - cursor.y) * 0.08;
                cursor.active = true;
                cursor.idleTime = 0;
            } else if (!cursor.active && cursor.idleTime > 1200) {
                const wanderX = window.innerWidth * (0.5 + Math.cos(time * 0.00027) * 0.2);
                const wanderY = window.innerHeight * (0.46 + Math.sin(time * 0.00021) * 0.24);
                cursor.x += (wanderX - cursor.x) * 0.03;
                cursor.y += (wanderY - cursor.y) * 0.03;
            }

            dotItems.forEach(item => applyPhysics(item, time, dtFactor));
            shapeItems.forEach(item => applyPhysics(item, time, dtFactor));

            renderDots();
            renderShapes(time);
            requestAnimationFrame(animate);
        };

        const onPointerMove = event => {
            cursor.active = true;
            cursor.idleTime = 0;
            cursor.x = event.clientX;
            cursor.y = event.clientY;
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerMove, { passive: true });
        window.addEventListener('pointerleave', () => {
            cursor.active = false;
            cursor.idleTime = 0;
        });

        // iOS 13+ requires explicit permission via a user gesture to access device orientation
        const requestOrientationPermission = () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            orientationState.active = true;
                        }
                    })
                    .catch(console.error);
            }
        };
        window.addEventListener('touchstart', requestOrientationPermission, { once: true });
        window.addEventListener('click', requestOrientationPermission, { once: true });

        window.addEventListener('deviceorientation', event => {
            if (event.gamma !== null && event.beta !== null) {
                orientationState.active = true;
                let gamma = event.gamma; 
                let beta = event.beta; 
                // Consider resting position around beta=45 on mobile
                beta -= 45;
                gamma = Math.max(-45, Math.min(45, gamma));
                beta = Math.max(-45, Math.min(45, beta));
                orientationState.gamma = orientationState.gamma * 0.8 + gamma * 0.2;
                orientationState.beta = orientationState.beta * 0.8 + beta * 0.2;
            }
        });

        window.addEventListener('scroll', () => {
            const nextY = window.scrollY;
            const dy = nextY - scrollState.y;
            scrollState.y = nextY;
            scrollState.velocity = scrollState.velocity * 0.65 + dy * 0.35;
            scrollState.pulse = Math.min(90, scrollState.pulse + Math.abs(dy) * 0.5);
        }, { passive: true });

        let resizeTimer = null;
        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            // On mobile, scrolling up/down hides/shows the address bar, changing innerHeight and triggering 'resize'.
            // Only re-create the dots if the width actually changes (e.g. rotating the phone) to prevent sudden jumps.
            if (window.innerWidth === lastWidth) return;
            lastWidth = window.innerWidth;

            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                createDotField();
                initShapes();
                cursor.x = window.innerWidth * 0.5;
                cursor.y = window.innerHeight * 0.5;
            }, 120);
        });

        createDotField();
        initShapes();
        requestAnimationFrame(animate);
        }
    }

    const submenuParents = Array.from(document.querySelectorAll('.has-submenu'));

    const setExpanded = (parent, expanded) => {
        const toggle = parent.querySelector('.submenu-toggle');
        const submenu = parent.querySelector('.sub-topic-list');
        if (!toggle || !submenu) {
            return;
        }

        toggle.setAttribute('aria-expanded', String(expanded));
        parent.classList.toggle('is-open', expanded);
        submenu.hidden = !expanded;
    };

    const closeAllSubmenus = () => {
        submenuParents.forEach(parent => setExpanded(parent, false));
    };

    submenuParents.forEach(parent => {
        const toggle = parent.querySelector('.submenu-toggle');
        if (!toggle) {
            return;
        }

        setExpanded(parent, false);

        toggle.addEventListener('click', event => {
            event.preventDefault();
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

            closeAllSubmenus();
            setExpanded(parent, !isExpanded);
        });
    });

    document.addEventListener('click', event => {
        const clickedInsideSubmenu = submenuParents.some(parent => parent.contains(event.target));
        if (!clickedInsideSubmenu) {
            closeAllSubmenus();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeAllSubmenus();
        }
    });
});
