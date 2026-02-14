/* ═══════════════════════════════════════════════════════
   MediHealth — app.js
   Application logic: Supabase integration, booking,
   authentication, health tips, and UI interactions
   ═══════════════════════════════════════════════════════ */

const MediHealth = (() => {

  // ── STATE ──
  let supabaseClient = null;
  let currentUser = null;

  // ══════════════════════════════════════════
  //  HEALTH TIPS DATA
  //  Brief Key Feature 2: Interactive Health Tips
  //  Personalised based on profile and preferences
  // ══════════════════════════════════════════
  const healthTips = [
    {
      id: 1,
      category: 'nutrition',
      emoji: '🥗',
      title: 'Balanced Eating Habits',
      body: 'Incorporate whole grains, lean proteins, and a variety of colourful vegetables into every meal for sustained energy and long-term wellbeing.',
    },
    {
      id: 2,
      category: 'fitness',
      emoji: '🏃',
      title: '30-Minute Daily Movement',
      body: 'Just 30 minutes of moderate exercise daily can reduce heart disease risk by up to 35%, improve mood, and boost energy levels significantly.',
    },
    {
      id: 3,
      category: 'sleep',
      emoji: '😴',
      title: 'Quality Sleep Matters',
      body: 'Aim for 7–9 hours of quality sleep each night. Maintain a consistent schedule and limit blue light exposure before bed for better rest.',
    },
    {
      id: 4,
      category: 'mental-health',
      emoji: '🧘',
      title: 'Mindfulness & Meditation',
      body: 'Practising mindfulness for just 10 minutes a day can reduce stress hormones, improve focus, and enhance your overall emotional wellbeing.',
    },
    {
      id: 5,
      category: 'hydration',
      emoji: '💧',
      title: 'Stay Hydrated Daily',
      body: 'Drink at least 2 litres of water per day. Proper hydration supports digestion, clear skin, cognitive function, and physical performance.',
    },
    {
      id: 6,
      category: 'prevention',
      emoji: '🩺',
      title: 'Regular Health Check-ups',
      body: 'Schedule routine check-ups every 6–12 months. Early detection is the most effective strategy for preventing and managing health conditions.',
    },
    {
      id: 7,
      category: 'nutrition',
      emoji: '🍎',
      title: 'Reduce Processed Sugar',
      body: 'Cutting back on processed sugars can lower inflammation, improve dental health, stabilise energy levels, and reduce the risk of type 2 diabetes.',
    },
    {
      id: 8,
      category: 'fitness',
      emoji: '🚶',
      title: 'Walk After Meals',
      body: 'A short 10–15 minute walk after eating aids digestion, helps regulate blood sugar levels, and contributes to your daily movement goals.',
    },
    {
      id: 9,
      category: 'sleep',
      emoji: '🌙',
      title: 'Create a Sleep Routine',
      body: 'Establish a calming pre-sleep routine: dim the lights, avoid caffeine after 2pm, and keep your bedroom cool and quiet for optimal rest.',
    },
    {
      id: 10,
      category: 'mental-health',
      emoji: '📝',
      title: 'Journaling for Wellbeing',
      body: 'Writing down thoughts and feelings for just 5 minutes daily can improve mental clarity, reduce anxiety, and help process emotions constructively.',
    },
  ];

  // ══════════════════════════════════════════
  //  INITIALISATION
  // ══════════════════════════════════════════
  function init() {
    // Loader
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
      }, 1600);
    });

    // Navigation
    initNavigation();

    // Scroll effects
    initScrollEffects();

    // Testimonial carousel
    initCarousel();

    // Render health tips
    renderTips('all');
    initTipFilters();

    // Auth tabs
    initAuthTabs();

    // Forms
    initForms();

    // Set min date on booking calendar
    const dateInput = document.getElementById('bkDate');
    if (dateInput) {
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    // Auto-connect Supabase: first check hidden inputs (hardcoded), then sessionStorage
    const hardcodedUrl = document.getElementById('sbUrl').value.trim();
    const hardcodedKey = document.getElementById('sbKey').value.trim();
    const savedUrl = hardcodedUrl || sessionStorage.getItem('mh-sb-url');
    const savedKey = hardcodedKey || sessionStorage.getItem('mh-sb-key');
    if (savedUrl && savedKey) {
      document.getElementById('sbUrl').value = savedUrl;
      document.getElementById('sbKey').value = savedKey;
      connectSupabase();
    }
  }

  // ══════════════════════════════════════════
  //  NAVIGATION — Brief Key Feature 3:
  //  Enhanced Navigation: simple and intuitive
  // ══════════════════════════════════════════
  function initNavigation() {
    const burger = document.getElementById('navBurger');
    const overlay = document.getElementById('mobileOverlay');
    const header = document.getElementById('header');

    // Mobile menu toggle
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      // Header shrink
      header.classList.toggle('scrolled', window.scrollY > 50);

      // Active link
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) current = section.id;
      });
      document.querySelectorAll('.nav__link').forEach(link => {
        link.classList.toggle('active',
          link.getAttribute('href') === `#${current}`
        );
      });
    });
  }

  // ══════════════════════════════════════════
  //  SCROLL REVEAL ANIMATIONS
  // ══════════════════════════════════════════
  function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  }

  // ══════════════════════════════════════════
  //  TESTIMONIAL CAROUSEL
  //  Duplicates cards so the loop is seamless
  // ══════════════════════════════════════════
  function initCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    // Clone all testimonials and append for infinite scroll effect
    const items = track.innerHTML;
    track.innerHTML = items + items;
  }

  // ══════════════════════════════════════════
  //  HEALTH TIPS — Interactive Filtering
  //  Brief: personalised tips based on preferences
  // ══════════════════════════════════════════
  function renderTips(category) {
    const grid = document.getElementById('tipsGrid');
    const filtered = category === 'all'
      ? healthTips
      : healthTips.filter(t => t.category === category);

    grid.innerHTML = filtered.map(tip => `
      <div class="tip-card scroll-reveal visible" data-category="${tip.category}">
        <div class="tip-card__visual tip-card__visual--${tip.category}">${tip.emoji}</div>
        <div class="tip-card__body">
          <div class="tip-card__cat">${tip.category.replace('-', ' ')}</div>
          <h4>${tip.title}</h4>
          <p>${tip.body}</p>
        </div>
      </div>
    `).join('');
  }

  function initTipFilters() {
    const container = document.getElementById('tipFilters');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const category = chip.dataset.cat;
      renderTips(category);
    });
  }

  // ══════════════════════════════════════════
  //  AUTH TABS
  // ══════════════════════════════════════════
  function initAuthTabs() {
    const tabs = document.getElementById('authTabs');
    if (!tabs) return;

    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.auth-tab');
      if (!tab) return;

      tabs.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      const form = tab.dataset.tab === 'login'
        ? document.getElementById('loginForm')
        : document.getElementById('signupForm');
      form.classList.add('active');
    });
  }

  // ══════════════════════════════════════════
  //  FORM HANDLING
  // ══════════════════════════════════════════
  function initForms() {
    // Booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', handleBooking);
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSignup);
    }
  }

  // ══════════════════════════════════════════
  //  SUPABASE CONNECTION
  // ══════════════════════════════════════════
  function connectSupabase() {
    const url = document.getElementById('sbUrl').value.trim();
    const key = document.getElementById('sbKey').value.trim();

    if (!url || !key) {
      alert('Please enter both Supabase URL and Anon Key.');
      return;
    }

    try {
      supabaseClient = supabase.createClient(url, key);
      setStatus('connected', 'Connected to Supabase ✓');

      sessionStorage.setItem('mh-sb-url', url);
      sessionStorage.setItem('mh-sb-key', key);

      // Check existing session
      supabaseClient.auth.getSession().then(({ data }) => {
        if (data.session) {
          currentUser = data.session.user;
          showUserPanel(currentUser);
          setStatus('connected', `Connected — signed in as ${currentUser.email}`);
        }
      });

      console.log('✅ Supabase connected:', url);
    } catch (err) {
      setStatus('error', 'Connection failed — check your credentials');
      console.error('Supabase error:', err);
    }
  }

  function setStatus(state, text) {
    const dot = document.getElementById('sbDot');
    const txt = document.getElementById('sbText');
    if (dot) dot.className = 'sb-status__dot ' + state;
    if (txt) txt.textContent = text;
  }

  // ══════════════════════════════════════════
  //  BOOKING — Brief Key Feature 1:
  //  Schedule, reschedule, and cancel appointments
  // ══════════════════════════════════════════
  async function handleBooking(e) {
    e.preventDefault();
    const msg = document.getElementById('bkMsg');
    const btn = document.getElementById('bkSubmit');

    const data = {
      first_name: document.getElementById('bkFname').value.trim(),
      last_name:  document.getElementById('bkLname').value.trim(),
      email:      document.getElementById('bkEmail').value.trim(),
      phone:      document.getElementById('bkPhone').value.trim() || null,
      service:    document.getElementById('bkService').value,
      appointment_date: document.getElementById('bkDate').value,
      appointment_time: document.getElementById('bkTime').value,
      notes:      document.getElementById('bkNotes').value.trim() || null,
      user_id:    currentUser ? currentUser.id : null,
      status:     'confirmed',
    };

    // Demo mode if no Supabase
    if (!supabaseClient) {
      showMessage(msg, 'success',
        `✓ Demo mode — Appointment booked for ${data.first_name} on ${data.appointment_date} at ${data.appointment_time}. Connect Supabase to save to database.`
      );
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Booking…';

    try {
      const { error } = await supabaseClient
        .from('appointments')
        .insert([data]);

      if (error) {
        showMessage(msg, 'error', `Booking failed: ${error.message}`);
      } else {
        showMessage(msg, 'success',
          `✓ Appointment confirmed for ${data.first_name} ${data.last_name} — ${data.service} on ${data.appointment_date} at ${data.appointment_time}.`
        );
        e.target.reset();

        // Refresh user panel if logged in
        if (currentUser) loadUserAppointments();
      }
    } catch (err) {
      showMessage(msg, 'error', 'An unexpected error occurred while booking.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirm Appointment';
    }
  }

  // ── LOOKUP APPOINTMENTS (for reschedule/cancel) ──
  async function lookupAppointments() {
    const email = document.getElementById('manageEmail').value.trim();
    const list = document.getElementById('appointmentsList');

    if (!email) {
      list.innerHTML = '<p class="muted">Please enter your email address.</p>';
      return;
    }

    if (!supabaseClient) {
      list.innerHTML = '<p class="muted">Connect to Supabase first to look up appointments.</p>';
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('email', email)
        .order('appointment_date', { ascending: true });

      if (error) {
        list.innerHTML = `<p class="muted">Error: ${error.message}</p>`;
        return;
      }

      if (!data || data.length === 0) {
        list.innerHTML = '<p class="muted">No appointments found for this email.</p>';
        return;
      }

      list.innerHTML = data.map(apt => `
        <div class="apt-row" data-id="${apt.id}">
          <div class="apt-row__info">
            <strong>${formatService(apt.service)}</strong>
            <small>${apt.appointment_date} at ${apt.appointment_time} — ${apt.status}</small>
          </div>
          <div class="apt-row__actions">
            <button class="apt-btn--reschedule" onclick="MediHealth.rescheduleAppointment('${apt.id}')">Reschedule</button>
            <button class="apt-btn--cancel" onclick="MediHealth.cancelAppointment('${apt.id}')">Cancel</button>
          </div>
        </div>
      `).join('');

    } catch (err) {
      list.innerHTML = '<p class="muted">An error occurred during lookup.</p>';
    }
  }

  // ── RESCHEDULE ──
  async function rescheduleAppointment(id) {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    const newTime = prompt('Enter new time (e.g. 10:00):');

    if (!newDate || !newTime || !supabaseClient) return;

    try {
      const { error } = await supabaseClient
        .from('appointments')
        .update({ appointment_date: newDate, appointment_time: newTime, status: 'rescheduled' })
        .eq('id', id);

      if (error) {
        alert('Reschedule failed: ' + error.message);
      } else {
        alert('Appointment rescheduled successfully.');
        lookupAppointments(); // Refresh list
      }
    } catch (err) {
      alert('An error occurred.');
    }
  }

  // ── CANCEL ──
  async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    if (!supabaseClient) return;

    try {
      const { error } = await supabaseClient
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        alert('Cancellation failed: ' + error.message);
      } else {
        alert('Appointment cancelled.');
        lookupAppointments();
      }
    } catch (err) {
      alert('An error occurred.');
    }
  }

  // ══════════════════════════════════════════
  //  AUTHENTICATION (Supabase Auth)
  // ══════════════════════════════════════════
  async function handleLogin(e) {
    e.preventDefault();
    const msg = document.getElementById('loginMsg');

    if (!supabaseClient) {
      showMessage(msg, 'error', 'Please connect to Supabase first (see Setup section).');
      return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        showMessage(msg, 'error', error.message);
      } else {
        currentUser = data.user;
        showMessage(msg, 'success', `Welcome back! Signed in as ${data.user.email}`);
        showUserPanel(currentUser);
        setStatus('connected', `Connected — signed in as ${data.user.email}`);
      }
    } catch (err) {
      showMessage(msg, 'error', 'An unexpected error occurred.');
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    const msg = document.getElementById('signupMsg');

    if (!supabaseClient) {
      showMessage(msg, 'error', 'Please connect to Supabase first (see Setup section).');
      return;
    }

    const email = document.getElementById('sigEmail').value.trim();
    const password = document.getElementById('sigPass').value;
    const firstName = document.getElementById('sigFname').value.trim();
    const lastName = document.getElementById('sigLname').value.trim();

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        showMessage(msg, 'error', error.message);
        return;
      }

      // If Supabase returns a session, user is auto-confirmed — log them in
      if (data.session) {
        currentUser = data.user;
        showMessage(msg, 'success', `Account created! You're now signed in as ${email}.`);
        showUserPanel(currentUser);
        setStatus('connected', `Connected — signed in as ${email}`);
      } else {
        // Email confirmation is enabled on the Supabase project
        // Try to auto-sign-in immediately (works if "Confirm email" is off)
        const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (loginErr) {
          showMessage(msg, 'success',
            'Account created! If you receive a confirmation email, click the link then sign in. Otherwise, try signing in now.'
          );
        } else {
          currentUser = loginData.user;
          showMessage(msg, 'success', `Account created and signed in as ${email}!`);
          showUserPanel(currentUser);
          setStatus('connected', `Connected — signed in as ${email}`);
        }
      }
    } catch (err) {
      showMessage(msg, 'error', 'An unexpected error occurred.');
    }
  }

  async function signOut() {
    if (!supabaseClient) return;

    await supabaseClient.auth.signOut();
    currentUser = null;

    document.getElementById('authPanel').style.display = '';
    document.getElementById('userPanel').style.display = 'none';
    setStatus('connected', 'Connected to Supabase ✓');
  }

  // ── USER PANEL ──
  function showUserPanel(user) {
    document.getElementById('authPanel').style.display = 'none';
    document.getElementById('userPanel').style.display = '';

    const meta = user.user_metadata || {};
    const name = [meta.first_name, meta.last_name].filter(Boolean).join(' ') || 'User';

    document.getElementById('uAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('uName').textContent = name;
    document.getElementById('uEmail').textContent = user.email;

    loadUserAppointments();
  }

  async function loadUserAppointments() {
    const container = document.getElementById('uAppointments');
    if (!supabaseClient || !currentUser) return;

    try {
      const { data, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('appointment_date', { ascending: true });

      if (error || !data || data.length === 0) {
        container.innerHTML = '<p class="muted">No upcoming appointments.</p>';
        return;
      }

      container.innerHTML = data.map(apt => `
        <div class="apt-row">
          <div class="apt-row__info">
            <strong>${formatService(apt.service)}</strong>
            <small>${apt.appointment_date} at ${apt.appointment_time} — ${apt.status}</small>
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = '<p class="muted">Could not load appointments.</p>';
    }
  }

  // ══════════════════════════════════════════
  //  UTILITIES
  // ══════════════════════════════════════════
  function showMessage(el, type, text) {
    el.className = 'form-msg ' + type;
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 8000);
  }

  function formatService(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function copySQL() {
    const code = document.getElementById('sqlCode');
    const text = code.innerText || code.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('SQL copied to clipboard!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('SQL copied to clipboard!');
    });
  }

  // ══════════════════════════════════════════
  //  PUBLIC API
  // ══════════════════════════════════════════
  return {
    init,
    connectSupabase,
    lookupAppointments,
    rescheduleAppointment,
    cancelAppointment,
    signOut,
    copySQL,
  };

})();

// ── BOOT ──
document.addEventListener('DOMContentLoaded', MediHealth.init);
