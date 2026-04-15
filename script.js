document.addEventListener('DOMContentLoaded', () => {
    const dotsContainer = document.getElementById('dots-container');
    const numDots = 150;

    for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.style.top = `${Math.random() * 100}%`;
        dot.style.left = `${Math.random() * 100}%`;
        dot.dataset.depth = Math.random() * 3 + 1; // Depth for parallax effect
        dotsContainer.appendChild(dot);
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            const depth = dot.dataset.depth;
            const moveY = -(scrollY / depth);
            dot.style.transform = `translateY(${moveY}px)`;
        });
    });

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
