import { getToken } from '@/app/lib/auth';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}` + '/customer';

export async function fetchResolvedDuplicates(page = 1, pageSize = 10, search = '') {
  const token = getToken();
  const query = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    search,
  });

  const res = await fetch(`${API_BASE}/resolved?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch resolved data');
  return res.json();
}
