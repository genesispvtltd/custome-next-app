import { getToken } from '@/app/lib/auth';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`+'/customer';

type Customer = {
  custCode: string;
  name: string;
  add01: string;
  add02: string;
  postCode: string;
  country: string;
  groupKey: string;
  isParent: boolean;
};


export async function fetchDuplicates(page = 1, pageSize = 10, search = '') {
  const token = getToken();
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize), search });

  const res = await fetch(`${API_BASE}/duplicates?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to load duplicates');
  return res.json();
}

export async function mergeGroup(groupKey: string, parentCustCode: string, parentCustomer: Customer) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/merge`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      groupKey,
      parentCustCode,
      parentCustomer
    }),
  });

  if (!res.ok) throw new Error('Merge failed');

  return res.json();
}

export async function updateCustomer(updated: Partial<Customer> & { custCode: string }) {

  const token = getToken();

  const res = await fetch(`${API_BASE}/update`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) throw new Error('Failed to update customer');
}



