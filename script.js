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
});
