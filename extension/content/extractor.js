browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'EXTRACT_JOB') return false;

  const host = window.location.hostname;
  let data = null;

  if (host.includes('linkedin.com'))        data = extractLinkedIn();
  else if (host.includes('indeed.com'))     data = extractIndeed();
  else if (host.includes('glassdoor.com'))  data = extractGlassdoor();
  else if (host.includes('xing.com'))       data = extractXing();
  else if (host.includes('stepstone'))      data = extractStepStone();

  if (data) {
    sendResponse({ success: true, data });
  } else {
    sendResponse({ success: false, reason: 'not_a_job_page' });
  }
  return true;
});
