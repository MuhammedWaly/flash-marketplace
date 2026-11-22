import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';

export function useAdminFinance() {
  const [overview, setOverview] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFinanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, merchantsData] = await Promise.all([
        adminService.getFinanceOverview(),
        adminService.getMerchantFinances(searchTerm.trim() || undefined),
      ]);
      setOverview(overviewData);
      setMerchants(merchantsData || []);
    } catch (err) {
      console.error('فشل جلب البيانات المالية:', err);
      setError(err.message || 'تعذر تحميل المؤشرات المالية والعمولات');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const updateCommission = async (id, commissionRate) => {
    try {
      await adminService.updateCommissionRate(id, commissionRate);
      await loadFinanceData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'فشل تحديث نسبة العمولة' };
    }
  };

  const recordPayout = async (payload) => {
    try {
      const res = await adminService.recordPayout(payload);
      await loadFinanceData();
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err.message || 'فشل تسجيل الـ Payout' };
    }
  };

  return {
    overview,
    merchants,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    loadFinanceData,
    updateCommission,
    recordPayout,
  };
}
