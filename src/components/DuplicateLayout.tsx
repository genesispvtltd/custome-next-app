'use client';

import React from 'react';
import Link from 'next/link';

interface DuplicateLayoutProps {
  title: string;
  searchValue: string;
  onSearch: (value: string) => void;
  showBackLink?: boolean;
  children: React.ReactNode;
  secondaryLink?: React.ReactNode;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function DuplicateLayout({
  title,
  searchValue,
  onSearch,
  showBackLink = false,
  children,
  secondaryLink,
  currentPage,
  totalPages,
  onPageChange
}: DuplicateLayoutProps) {
  return (
    <div className="p-6">
      {showBackLink && (
        <div className="mb-4">
          <Link href="/duplicates" className="text-blue-600 underline">
            ← Back to Duplicate Customers
          </Link>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {secondaryLink && <div className="mb-4">{secondaryLink}</div>}

      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by customer name"
          className="border px-3 py-2 rounded w-64"
        />
        <button
          onClick={() => onSearch('')}
          className="text-sm text-gray-500 underline"
        >
          Clear
        </button>
      </div>

      <div>{children}</div>

      {typeof currentPage === 'number' &&
        typeof totalPages === 'number' &&
        onPageChange && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Prev
            </button>
            <span className="px-2">Page {currentPage}</span>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
