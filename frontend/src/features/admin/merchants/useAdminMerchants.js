import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';

export function useAdminMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('pending'); // default to pending so admin sees action items first
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    suspended: 0,
    total: 0,
  });

  const loadMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getMerchants({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm.trim() || undefined,
        pageNumber,
        pageSize,
      });

      setMerchants(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('فشل جلب قائمة المطاعم:', err);
      setError(err.message || 'تعذر تحميل بيانات المطاعم');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, pageNumber, pageSize]);

  // Load overview stats for the tabs
  const loadStats = useCallback(async () => {
    try {
      const overview = await adminService.getFinanceOverview();
      if (overview) {
        setStats({
          pending: overview.pendingMerchantsCount || 0,
          approved: overview.activeMerchantsCount || 0,
          total: (overview.activeMerchantsCount || 0) + (overview.pendingMerchantsCount || 0),
        });
      }
    } catch (err) {
      console.warn('تعذر تحميل إحصائيات المطاعم:', err);
    }
  }, []);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const approveMerchant = async (id) => {
    try {
      await adminService.approveMerchant(id);
      await loadMerchants();
      await loadStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'فشل اعتماد المطعم' };
    }
  };

  const rejectMerchant = async (id, reason) => {
    try {
      await adminService.rejectMerchant(id, reason);
      await loadMerchants();
      await loadStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'فشل رفض المطعم' };
    }
  };

  const toggleStatus = async (id) => {
    try {
      await adminService.toggleMerchantStatus(id);
      await loadMerchants();
      await loadStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'فشل تغيير حالة المطعم' };
    }
  };

  return {
    merchants,
    totalCount,
    totalPages,
    pageNumber,
    setPageNumber,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    stats,
    loadMerchants,
    approveMerchant,
    rejectMerchant,
    toggleStatus,
  };
}
