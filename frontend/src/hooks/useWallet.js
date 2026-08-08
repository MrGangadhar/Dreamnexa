import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/walletApi';

export const useWalletSummary = () => {
  return useQuery({
    queryKey: ['walletSummary'],
    queryFn: walletApi.getSummary,
  });
};

export const usePointsHistory = () => {
  return useQuery({
    queryKey: ['pointsHistory'],
    queryFn: walletApi.getPointsHistory,
  });
};

export const usePrizeHistory = () => {
  return useQuery({
    queryKey: ['prizeHistory'],
    queryFn: walletApi.getPrizeHistory,
  });
};

export const useWithdrawHistory = () => {
  return useQuery({
    queryKey: ['withdrawHistory'],
    queryFn: walletApi.getWithdrawHistory,
  });
};

export const useWithdrawMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.withdraw,
    onSuccess: () => {
      // Invalidate queries so that the UI updates immediately after a successful withdrawal
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawHistory'] });
    },
  });
};

export const useRedeemCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.redeemCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['pointsHistory'] });
      queryClient.invalidateQueries({ queryKey: ['prizeHistory'] });
    },
  });
};
