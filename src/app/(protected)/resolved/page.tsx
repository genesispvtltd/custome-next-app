'use client';

import { useEffect, useState } from 'react';
import { fetchResolvedDuplicates } from '@/services/resolvedService';
import DuplicateLayout from '@/components/DuplicateLayout';

type Customer = {
  custCode: string;
  name: string;
  add01: string;
  add02: string;
  postCode: string;
  country: string;
  groupKey: string;
  isParent: boolean;
  children?: Customer[];
};

export default function ResolvedPage() {
  const [resolvedGroups, setResolvedGroups] = useState<Customer[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    load(currentPage);
  }, [currentPage, search]);

  const load = async (page: number) => {
    try {
      const result = await fetchResolvedDuplicates(page, 10, search);
      setResolvedGroups(result.data);
      setTotalPages(result.totalPages);
    } catch {
      setError('Failed to load resolved duplicates');
    }
  };

  return (
    <DuplicateLayout
      title="Resolved Merges"
      searchValue={search}
      onSearch={(val) => {
        setSearch(val);
        setCurrentPage(1);
      }}
      showBackLink
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    >
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {resolvedGroups.length === 0 ? (
        <p>No resolved merges found.</p>
      ) : (
        resolvedGroups.map((parent) => (
          <div key={parent.custCode} className="border rounded shadow mb-4 bg-white">
            <div
              className="cursor-pointer bg-gray-100 px-4 py-2 flex justify-between"
              onClick={() =>
                setExpanded(expanded === parent.groupKey ? null : parent.groupKey)
              }
            >
              <span className="font-semibold">
                {parent.name} ({parent.custCode})
              </span>
              <span>{expanded === parent.groupKey ? '-' : '+'}</span>
            </div>

            {expanded === parent.groupKey && (
              <div className="p-4">
                <p><strong>Address 1:</strong> {parent.add01}</p>
                <p><strong>Address 2:</strong> {parent.add02}</p>
                <p><strong>Post Code:</strong> {parent.postCode}</p>
                <p><strong>Country:</strong> {parent.country}</p>

                <h4 className="mt-4 font-semibold">Children:</h4>
                {parent.children && parent.children.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {parent.children.map((child) => (
                      <li key={child.custCode}>
                        {child.name} ({child.custCode})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No child records found.</p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </DuplicateLayout>
  );
}
