import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import { classifyApp, daysSince, FOLLOWUP_STALE_DAYS, DECISION_STALE_DAYS } from '../utils/followup';
import { JobApplication } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dateAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function makeApp(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: 'app-1',
    userId: 'user-1',
    companyName: 'Acme',
    positionTitle: 'Engineer',
    location: 'Berlin',
    status: 'Applied',
    visaSponsorship: false,
    germanRequirement: 'None',
    relocationSupport: false,
    easyApply: false,
    priorityStars: 0,
    appliedDate: dateAgo(0),
    createdAt: daysAgoIso(0),
    updatedAt: daysAgoIso(0),
    ...overrides,
  };
}

// ─── classifyApp (pure logic) ────────────────────────────────────────────────

describe('classifyApp', () => {
  it('returns ok for a freshly updated app', () => {
    const app = makeApp({ updatedAt: daysAgoIso(0) });
    expect(classifyApp(app)).toBe('ok');
  });

  it('returns needs_followup when stale and no followup recorded', () => {
    const app = makeApp({ updatedAt: daysAgoIso(FOLLOWUP_STALE_DAYS) });
    expect(classifyApp(app)).toBe('needs_followup');
  });

  it('returns ok when stale but followed up recently', () => {
    const app = makeApp({
      updatedAt: daysAgoIso(10),
      followedUpAt: dateAgo(1),
    });
    expect(classifyApp(app)).toBe('awaiting_response');
  });

  it('returns needs_decision when followup was 3+ days ago', () => {
    const app = makeApp({
      updatedAt: daysAgoIso(10),
      followedUpAt: dateAgo(DECISION_STALE_DAYS),
    });
    expect(classifyApp(app)).toBe('needs_decision');
  });

  it('returns ok for Rejected regardless of staleness', () => {
    const app = makeApp({ status: 'Rejected', updatedAt: daysAgoIso(30) });
    expect(classifyApp(app)).toBe('ok');
  });

  it('returns ok for Ghosted regardless of staleness', () => {
    const app = makeApp({ status: 'Ghosted', updatedAt: daysAgoIso(30) });
    expect(classifyApp(app)).toBe('ok');
  });
});

// ─── daysSince ───────────────────────────────────────────────────────────────

describe('daysSince', () => {
  it('returns 0 for today', () => {
    expect(daysSince(daysAgoIso(0))).toBe(0);
  });

  it('returns the correct number of days', () => {
    expect(daysSince(daysAgoIso(5))).toBe(5);
  });
});

// ─── FollowupPage component ──────────────────────────────────────────────────

jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('../services/api', () => ({
  applicationService: {
    markFollowedUp: jest.fn(),
    updateStatus: jest.fn(),
  },
  userService: {
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const { useAppContext } = require('../context/AppContext');
const { applicationService, userService } = require('../services/api');
import FollowupPage from '../pages/Followup';

function renderFollowup(apps: JobApplication[]) {
  const setApplications = jest.fn();
  const setUser = jest.fn();
  useAppContext.mockReturnValue({
    applications: apps,
    setApplications,
    setUser,
    isMentorView: false,
  });
  render(
    <MemoryRouter>
      <FollowupPage />
    </MemoryRouter>
  );
  return { setApplications, setUser };
}

describe('FollowupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no actionable apps', () => {
    renderFollowup([makeApp({ updatedAt: daysAgoIso(0) })]);
    expect(screen.getByText('All caught up!')).toBeInTheDocument();
  });

  it('shows stale app under Needs Followup section', () => {
    const app = makeApp({ companyName: 'Beta Corp', updatedAt: daysAgoIso(FOLLOWUP_STALE_DAYS) });
    renderFollowup([app]);
    expect(screen.getByText('Beta Corp')).toBeInTheDocument();
    expect(screen.getByText(/Needs Followup/)).toBeInTheDocument();
  });

  it('shows Mark Followed Up button for needs_followup apps', () => {
    const app = makeApp({ updatedAt: daysAgoIso(FOLLOWUP_STALE_DAYS) });
    renderFollowup([app]);
    expect(screen.getByRole('button', { name: /Mark Followed Up/i })).toBeInTheDocument();
  });

  it('calls markFollowedUp API and updates context when button clicked', async () => {
    const app = makeApp({ id: 'x1', updatedAt: daysAgoIso(FOLLOWUP_STALE_DAYS) });
    const updatedApp = { ...app, followedUpAt: dateAgo(0) };
    applicationService.markFollowedUp.mockResolvedValue(updatedApp);
    userService.getCurrentUser.mockResolvedValue({ points: 51 });

    const { setApplications } = renderFollowup([app]);
    fireEvent.click(screen.getByRole('button', { name: /Mark Followed Up/i }));

    await waitFor(() => {
      expect(applicationService.markFollowedUp).toHaveBeenCalledWith('x1');
      expect(setApplications).toHaveBeenCalled();
    });
  });

  it('shows Ghosted/Rejected buttons under Needs Decision section', () => {
    const app = makeApp({
      updatedAt: daysAgoIso(10),
      followedUpAt: dateAgo(DECISION_STALE_DAYS),
    });
    renderFollowup([app]);
    expect(screen.getByRole('button', { name: 'Ghosted' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rejected' })).toBeInTheDocument();
  });

  it('calls updateStatus with Ghosted when Ghosted button clicked', async () => {
    const app = makeApp({
      id: 'y1',
      updatedAt: daysAgoIso(10),
      followedUpAt: dateAgo(DECISION_STALE_DAYS),
    });
    const ghostedApp = { ...app, status: 'Ghosted' as const };
    applicationService.updateStatus.mockResolvedValue(ghostedApp);

    const { setApplications } = renderFollowup([app]);
    fireEvent.click(screen.getByRole('button', { name: 'Ghosted' }));

    await waitFor(() => {
      expect(applicationService.updateStatus).toHaveBeenCalledWith('y1', 'Ghosted');
      expect(setApplications).toHaveBeenCalled();
    });
  });

  it('shows Awaiting Response section for recently followed-up apps', () => {
    const app = makeApp({
      companyName: 'Gamma Inc',
      updatedAt: daysAgoIso(10),
      followedUpAt: dateAgo(1),
    });
    renderFollowup([app]);
    expect(screen.getByText('Gamma Inc')).toBeInTheDocument();
    expect(screen.getByText(/Awaiting Response/)).toBeInTheDocument();
  });
});

// ─── DashboardComponent followup widget ─────────────────────────────────────

jest.mock('../../components/dashboard/DashboardComponent', () => {
  // keep real impl but mock navigate
}, { virtual: true });

jest.mock('../services/api', () => ({
  ...jest.requireActual('../services/api'),
  userService: { claimDailyGoalBonus: jest.fn() },
  applicationService: { markFollowedUp: jest.fn(), updateStatus: jest.fn() },
}));

import ApplyQuestDashboard from '../components/dashboard/DashboardComponent';

function renderDashboard(apps: JobApplication[]) {
  useAppContext.mockReturnValue({
    user: { name: 'Alice', points: 50, level: 1, levelName: 'Novice', currentStreak: 1, longestStreak: 3 },
    setUser: jest.fn(),
    applications: apps,
    contacts: [],
    loading: false,
  });
  render(
    <MemoryRouter>
      <ApplyQuestDashboard />
    </MemoryRouter>
  );
}

describe('DashboardComponent followup widget', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hides followup widget when no actionable apps', () => {
    renderDashboard([makeApp({ updatedAt: daysAgoIso(0) })]);
    expect(screen.queryByText('Followup Queue')).not.toBeInTheDocument();
  });

  it('shows followup widget with count when stale apps exist', () => {
    const app = makeApp({ updatedAt: daysAgoIso(FOLLOWUP_STALE_DAYS) });
    renderDashboard([app]);
    expect(screen.getByText('Followup Queue')).toBeInTheDocument();
    expect(screen.getByText(/need a followup/)).toBeInTheDocument();
  });

  it('shows decision count in widget when apps need decision', () => {
    const app = makeApp({
      updatedAt: daysAgoIso(10),
      followedUpAt: dateAgo(DECISION_STALE_DAYS),
    });
    renderDashboard([app]);
    expect(screen.getByText(/need a decision/)).toBeInTheDocument();
  });
});
