'use client';

import { useEffect, useState } from 'react';
import { fetchDuplicates, mergeGroup, updateCustomer } from '@/services/duplicatesService';
import DuplicateLayout from '@/components/DuplicateLayout';
import Link from 'next/link';

type Customer = {
  custCode: string;
  name: string;
  add01: string;
  add02: string;
  postCode: string;
  country: string;
  groupKey: string;
  isParent: boolean;
  parentCustCode?: string | null;
};

export default function DuplicatesPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [selectedParents, setSelectedParents] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, Partial<Customer>>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'success' | 'error' | 'info' | ''>('');

  useEffect(() => {
    load(currentPage);
  }, [currentPage, search]);

  useEffect(() => {
    if (bannerMessage) {
      const timeout = setTimeout(() => {
        setBannerMessage('');
        setBannerType('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [bannerMessage]);

  const load = async (page: number) => {
    try {
      setLoading(true);
      const result = await fetchDuplicates(page, 10, search);
      setData(result.data);
      setTotalPages(result.totalPages);
      setBannerMessage(result.bannerMessage || '');
      setBannerType(result.bannerType || '');
    } catch (e) {
      setError('Failed to load data');
      setBannerMessage('Failed to load data');
      setBannerType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (custCode: string, field: keyof Customer, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [custCode]: {
        ...prev[custCode],
        [field]: value,
        custCode,
      },
    }));
  };

  const saveChanges = async (custCode: string) => {
 
    const updated = editing[custCode];
    if (!updated) return;
    
    const original = data.find(c => c.custCode === custCode);
    if (!original) return;
    const merged: Customer = { ...original, ...updated };

    try {
       
      await updateCustomer(merged);
      setEditing(prev => {
        const newState = { ...prev };
        delete newState[custCode];
        return newState;
      });
      load(currentPage);
    } catch (e) {
      
      setBannerMessage('Error saving customer');
      setBannerType('error');
    }
  };

  const handleSelectParent = (groupKey: string, custCode: string) => {
    setSelectedParents((prev) => ({ ...prev, [groupKey]: custCode }));
    setValidationErrors((prev) => ({ ...prev, [groupKey]: {} }));
  };

  const handleMerge = async (groupKey: string) => {
    const parentCode = selectedParents[groupKey];
    if (!parentCode) {
      setBannerMessage('Select a parent before merging');
      setBannerType('error');
      return;
    }

    const parentOriginal = data.find(c => c.custCode === parentCode);
    if (!parentOriginal) return;

    const parentEdit = editing[parentCode] || {};
    const updatedParent: Customer = { ...parentOriginal, ...parentEdit };

    const requiredFields: (keyof Customer)[] = ['name', 'add01', 'add02', 'postCode', 'country'];
    const errors: Record<string, string> = {};

    for (const field of requiredFields) {
      if (!updatedParent[field] || updatedParent[field]?.toString().trim() === '') {
        errors[field] = `${field} is required`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, [groupKey]: errors }));
      return;
    }

    try {
      await updateCustomer(updatedParent);
      setEditing(prev => {
        const newState = { ...prev };
        delete newState[parentCode];
        return newState;
      });

      const response = await mergeGroup(groupKey, parentCode, updatedParent);
      setBannerMessage(response.bannerMessage || 'Group merged successfully.');
      setBannerType(response.bannerType?.toLowerCase() || 'success');

      setTimeout(() => {
        load(currentPage);
      }, 1000);
    } catch (err) {
      setBannerMessage('Failed to save or merge parent');
      setBannerType('error');
    }
  };

  const grouped = Array.isArray(data)
    ? data.reduce<Record<string, Customer[]>>((acc, curr) => {
        acc[curr.groupKey] = acc[curr.groupKey] || [];
        acc[curr.groupKey].push(curr);
        return acc;
      }, {})
    : {};

  return (
    <DuplicateLayout
      title="Duplicate Customers"
      searchValue={search}
      onSearch={(val) => {
        setSearch(val);
        setCurrentPage(1);
      }}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      secondaryLink={
        <Link href="/resolved" className="text-sm text-blue-600 underline">
          → View Resolved Records
        </Link>
      }
    >
      {bannerMessage && (
        <div
          className={`p-2 mb-4 rounded text-white ${
            bannerType === 'success'
              ? 'bg-green-600'
              : bannerType === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600'
          }`}
        >
          {bannerMessage}
        </div>
      )}

      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p>No duplicates found.</p>
      ) : (
        Object.entries(grouped).map(([groupKey, customers]) => (
          <div key={groupKey} className="mb-6 border rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-2">Group: {groupKey}</h2>
            <table className="w-full table-auto border-collapse mb-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">Select</th>
                  <th className="border px-2 py-1">CustCode</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Add01</th>
                  <th className="border px-2 py-1">Add02</th>
                  <th className="border px-2 py-1">PostCode</th>
                  <th className="border px-2 py-1">Country</th>
                  <th className="border px-2 py-1">Role</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const isEditing = editing[cust.custCode];
                  const isSelectedParent = selectedParents[groupKey] === cust.custCode;
                  return (
                    <tr key={cust.custCode}>
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="radio"
                          name={`parent-${groupKey}`}
                          checked={isSelectedParent}
                          onChange={() => handleSelectParent(groupKey, cust.custCode)}
                        />
                      </td>
                      <td className="border px-2 py-1">{cust.custCode}</td>
                      {["name", "add01", "add02", "postCode", "country"].map((field) => {
                        const errorMsg = validationErrors[groupKey]?.[field];
                        return (
                          <td key={field} className="border px-2 py-1">
                            <input
                              type="text"
                              className={`w-full border p-1 ${isSelectedParent && errorMsg ? 'border-red-500' : ''}`}
                              value={(isEditing?.[field as keyof Customer] as string) ?? (cust[field as keyof Customer] as string) ?? ''}
                              onChange={(e) => handleEditChange(cust.custCode, field as keyof Customer, e.target.value)}
                            />
                            {isSelectedParent && errorMsg && (
                              <div className="text-red-500 text-xs mt-1">{errorMsg}</div>
                            )}
                          </td>
                        );
                      })}
                      <td className="border px-2 py-1 text-center">
                        {cust.isParent ? (
                          <span className="text-green-700 font-semibold">Parent</span>
                        ) : cust.parentCustCode ? (
                          <span className="text-blue-600">Child</span>
                        ) : (
                          <span className="text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          className="text-sm px-3 py-1 bg-blue-500 text-white rounded mr-2"
                          onClick={() => saveChanges(cust.custCode)}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => handleMerge(groupKey)}
            >
              Merge Group
            </button>
          </div>
        ))
      )}
    </DuplicateLayout>
  );
}
