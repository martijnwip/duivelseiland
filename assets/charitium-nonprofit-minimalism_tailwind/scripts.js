// version 1.0
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = !mobileMenu.classList.contains('hidden');
      menuButton.setAttribute('aria-expanded', isExpanded);
    });
    const amountButtons = document.querySelectorAll('.donation-amount');
    const customAmountInput = document.getElementById('custom-amount');
    amountButtons.forEach(button => {
      button.addEventListener('click', () => {
        amountButtons.forEach(btn => {
          btn.classList.remove('bg-background', 'border-cta', 'text-cta');
          btn.classList.add('border-border');
        });
        button.classList.remove('border-border');
        button.classList.add('bg-background', 'border-cta', 'text-cta');
        customAmountInput.value = '';
      });
    });
    customAmountInput.addEventListener('focus', () => {
      amountButtons.forEach(btn => {
        btn.classList.remove('bg-background', 'border-cta', 'text-cta');
        btn.classList.add('border-border');
      });
    });
    const subscribeForm = document.getElementById('subscribe-form');
    const loadingMsg = document.getElementById('subscribe-loading');
    const successMsg = document.getElementById('subscribe-success');
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadingMsg.classList.remove('hidden');
      setTimeout(() => {
        loadingMsg.classList.add('hidden');
        successMsg.classList.remove('hidden');
        subscribeForm.reset();
        setTimeout(() => {
          successMsg.classList.add('hidden');
        }, 3000);
      }, 1500);
    });
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const endValue = parseFloat(target.getAttribute('data-target'));
          const duration = 2000;
          animateValue(target, 0, endValue, duration);
          observer.unobserve(target);
        }
      });
    }, observerOptions);
    document.querySelectorAll('.count-up')
      .forEach(el => {
        observer.observe(el);
      });

    function animateValue(element, start, end, duration) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        if (end % 1 !== 0) {
          element.textContent = (progress * (end - start) + start)
            .toFixed(1);
        } else {
          element.textContent = Math.floor(progress * (end - start) + start)
            .toLocaleString();
        }
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  });
});
