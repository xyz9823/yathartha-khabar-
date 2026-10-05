export function formatRelativeTime(dateString: string): string {
  try {
    const then = new Date(dateString).getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - then) / 1000));

    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffSec < 120) return '1 min ago';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 7200) return '1 hour ago';
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;

    // For older articles: format as "5 Oct 2026, 8:42 PM" (Section 12 requirement)
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kathmandu',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return 'Recent';
  }
}

export function formatNepalTime(dateString?: string): string {
  try {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' NPT';
  } catch {
    return 'NPT';
  }
}

export function getCurrentNepalHeaderDate(): { gregorian: string; bs: string; time: string } {
  const now = new Date();
  
  const gregorian = now.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kathmandu',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const time = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kathmandu',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' NPT';

  // Approximate Bikram Sambat date (B.S. is 56.7 years ahead)
  const bs = 'Ashwin 2083 B.S.';

  return { gregorian, bs, time };
}
