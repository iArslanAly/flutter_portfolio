const CONSENT_KEY = 'iarslanaly-analytics-consent';
const GA_MEASUREMENT_ID = 'G-0NYCV99TDH';

function loadGoogleAnalytics() {
  if (window.googleAnalyticsLoaded) return;
  window.googleAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function setAnalyticsConsent(choice) {
  localStorage.setItem(CONSENT_KEY, choice);
  document.getElementById('consentBanner')?.classList.remove('show');
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = choice !== 'accepted';
  if (choice === 'accepted') loadGoogleAnalytics();
}

function showConsentBanner() {
  document.getElementById('consentBanner')?.classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
  const savedConsent = localStorage.getItem(CONSENT_KEY);

  if (savedConsent === 'accepted') {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    loadGoogleAnalytics();
  } else if (savedConsent === 'declined') {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  } else {
    showConsentBanner();
  }

  document.getElementById('acceptAnalytics')?.addEventListener('click', () => {
    setAnalyticsConsent('accepted');
  });

  document.getElementById('declineAnalytics')?.addEventListener('click', () => {
    setAnalyticsConsent('declined');
  });

  document.querySelectorAll('[data-manage-consent]').forEach(button => {
    button.addEventListener('click', () => {
      localStorage.removeItem(CONSENT_KEY);
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
      showConsentBanner();
      document.getElementById('consentBanner')?.focus();
    });
  });
});
