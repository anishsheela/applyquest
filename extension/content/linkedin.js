function extractLinkedIn() {
  const title = document.querySelector([
    'h1.t-24',
    'h1[class*="job-details-jobs-unified-top-card__job-title"]',
    'h1[class*="topcard__title"]',
    'h1[class*="job-title"]',
    '.job-details-jobs-unified-top-card__container--two-pane h1',
  ].join(', '))?.innerText?.trim();

  const company = document.querySelector([
    'a[class*="topcard__org-name-link"]',
    '.job-details-jobs-unified-top-card__company-name a',
    '[class*="job-details-jobs-unified-top-card__primary-description"] a',
    'a[data-tracking-control-name*="company"]',
  ].join(', '))?.innerText?.trim();

  const location = document.querySelector([
    'span[class*="topcard__flavor--bullet"]',
    '.job-details-jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__primary-description span.tvm__text',
  ].join(', '))?.innerText?.trim();

  const easyApply = !!(
    document.querySelector('button[aria-label*="Easy Apply"]') ||
    document.querySelector('[class*="jobs-apply-button"]')
  );

  if (!title && !company) return null;

  return {
    jobTitle: title || '',
    companyName: company || '',
    location: location || '',
    jobUrl: window.location.href.split('?')[0],
    easyApply,
    jobBoardSource: 'LinkedIn',
  };
}
