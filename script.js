document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section, .project, .hero-copy, .hero-art');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  sections.forEach((section) => observer.observe(section));
});
