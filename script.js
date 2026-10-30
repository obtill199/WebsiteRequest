(() => {
  const form = document.querySelector('#brief-form');
  const steps = [...form.querySelectorAll('.step')];
  const count = document.querySelector('#step-count');
  const label = document.querySelector('#step-label');
  const fill = document.querySelector('#progress-fill');
  const error = document.querySelector('#step-error');
  const next = document.querySelector('#next-button');
  const back = document.querySelector('#back-button');
  const submit = document.querySelector('#submit-button');
  const review = document.querySelector('#review-list');
  const success = document.querySelector('#success-panel');
  const labels = ['Your business', 'What you need', 'Look & feel', 'Your details'];
  let current = 0;

  const field = (name) => form.querySelector(`[name="${name}"]`);
  const value = (name) => field(name)?.value.trim() || '';
  const selected = (name) => form.querySelector(`[name="${name}"]:checked`)?.value || '';
  const checked = (name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map(el => el.value);

  function showError(message, element) {
    error.textContent = message;
    error.hidden = false;
    if (element) {
      element.setAttribute('aria-invalid', 'true');
      element.focus();
    }
  }

  function clearError() {
    error.hidden = true;
    error.textContent = '';
    form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
    document.querySelector('#source-error').hidden = true;
  }

  function validUrl(input) {
    if (!input.value.trim()) return true;
    let url;
    try { url = new URL(input.value.trim()); } catch { return false; }
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  function validateStep() {
    clearError();
    if (current === 0) {
      if (!value('business_name')) return showError('Please add your business name.', field('business_name')), false;
      if (!value('location')) return showError('Please add your city and state.', field('location')), false;
      if (!selected('business_type')) return showError('Choose the option that fits your business best.'), false;
      if (!validUrl(field('existing_page'))) return showError('Please enter a full link starting with https://', field('existing_page')), false;
      if (!value('existing_page') && !value('business_description')) {
        document.querySelector('#source-error').hidden = false;
        field('existing_page').focus();
        return false;
      }
    }
    if (current === 1 && !selected('main_goal')) return showError('Pick your main goal for the website.'), false;
    if (current === 2) {
      if (!selected('style')) return showError('Pick a style, or choose “Surprise me.”'), false;
      if (!validUrl(field('inspiration_link'))) return showError('Please enter a full link starting with https://', field('inspiration_link')), false;
    }
    if (current === 3) {
      if (!value('name')) return showError('Please add your name.', field('name')), false;
      if (!value('email')) return showError('Please add your email address.', field('email')), false;
      if (!field('email').checkValidity()) return showError('Please enter a valid email address.', field('email')), false;
    }
    return true;
  }

  function addReview(term, answer) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = answer || 'Not picked yet';
    review.append(dt, dd);
  }

  function updateReview() {
    review.replaceChildren();
    addReview('Business', value('business_name'));
    addReview('Goal', selected('main_goal'));
    addReview('Pages', checked('pages').join(', ') || 'Help me decide');
    addReview('Style', selected('style'));
  }

  function render() {
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === current);
      step.setAttribute('aria-hidden', String(i !== current));
    });
    count.textContent = `${String(current + 1).padStart(2, '0')} / 04`;
    label.textContent = labels[current];
    fill.style.width = `${(current + 1) * 25}%`;
    back.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    submit.hidden = current !== steps.length - 1;
    clearError();
    if (current === steps.length - 1) updateReview();
  }

  function changeStep(newStep) {
    current = newStep;
    render();
    document.querySelector('.form-column').scrollIntoView({ behavior: 'smooth', block: 'start' });
    steps[current].querySelector('h2')?.focus({ preventScroll: true });
  }

  // Headings receive focus after a step change for keyboard and screen-reader users.
  steps.forEach(step => step.querySelector('h2').tabIndex = -1);
  next.addEventListener('click', () => { if (validateStep()) changeStep(current + 1); });
  back.addEventListener('click', () => changeStep(current - 1));
  form.addEventListener('input', () => {
    if (!error.hidden || !document.querySelector('#source-error').hidden) clearError();
    if (current === 3) updateReview();
  });
  form.addEventListener('change', () => {
    if (!error.hidden) clearError();
    if (current === 3) updateReview();
  });
  form.querySelectorAll('[name="pages"]').forEach(option => option.addEventListener('change', () => {
    if (!option.checked) return;
    const unsure = [...form.querySelectorAll('[name="pages"]')].find(el => el.value === 'Not sure yet');
    if (option === unsure) form.querySelectorAll('[name="pages"]').forEach(el => { if (el !== unsure) el.checked = false; });
    else unsure.checked = false;
  }));

  function requestData() {
    const data = {
      _subject: `New website request: ${value('business_name')}`,
      _template: 'table',
      _honey: value('_honey'),
      name: value('name'),
      email: value('email'),
      phone: value('phone') || 'Not provided',
      'Business name': value('business_name'),
      'City and state': value('location'),
      'Business type': selected('business_type'),
      'Current page': value('existing_page') || 'Not provided',
      'What they offer': value('business_description') || 'See current page',
      'Main website goal': selected('main_goal'),
      'Sections wanted': checked('pages').join(', ') || 'Help me decide',
      'Main button': selected('main_button') || 'Help me choose',
      'Style': selected('style'),
      'Colors': selected('colors') || 'No preference',
      'Photos and logo': selected('assets') || 'Not specified',
      'Inspiration link': value('inspiration_link') || 'Not provided',
      'Timeline': selected('timeline') || 'Not specified',
      'Extra notes': value('extra_notes') || 'None'
    };
    return data;
  }

  function showSendError() {
    showError('I couldn’t send this right now. Your answers are still here. Please try again.');
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (current < steps.length - 1) {
      if (validateStep()) changeStep(current + 1);
      return;
    }
    if (!validateStep()) return;

    const data = requestData();
    submit.disabled = true;
    submit.textContent = 'Sending…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/feef07f7dc6fcb9c5fe96f7121bb536c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || (result.success !== 'true' && result.success !== true)) throw new Error('Submission failed');
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      showSendError();
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.innerHTML = 'Send my request <span aria-hidden="true">→</span>';
    }
  });

  document.querySelector('#start-over').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    current = 0;
    render();
    document.querySelector('.form-column').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  render();
})();
